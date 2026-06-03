from __future__ import annotations

import json
import mimetypes
import os
import platform
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import traceback
import uuid
import zipfile
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from http import HTTPStatus
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse, unquote

from converter import (
    ExportOptions,
    PdfItem,
    export_pdfs,
    get_pdf_page_count,
    parse_page_ranges,
    render_pdf_page,
    render_pdf_page_preview,
    require_tools,
)


APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static"
SESSIONS: dict[str, dict[str, object]] = {}
EXPORT_JOBS: dict[str, dict[str, object]] = {}
RENDER_SEMAPHORE = threading.Semaphore(min(os.cpu_count() or 4, 8))
INSTALL_LOCK = threading.Lock()


def preview_dpi(pages: int) -> int:
    """动态预览精度：小文件给高画质，大文件优先速度。"""
    if pages <= 20:
        return 220
    if pages <= 100:
        return 200
    if pages <= 300:
        return 185
    return 180


def preview_quality(pages: int) -> int:
    """动态JPEG质量：与DPI策略一致。"""
    if pages <= 20:
        return 95
    if pages <= 100:
        return 92
    if pages <= 300:
        return 90
    return 88


def json_bytes(payload: object) -> bytes:
    return json.dumps(payload, ensure_ascii=False).encode("utf-8")


def parse_multipart(content_type: str, body: bytes) -> list[tuple[str, str, bytes]]:
    marker = "boundary="
    if marker not in content_type:
        raise ValueError("Missing multipart boundary")
    boundary = content_type.split(marker, 1)[1].strip().strip('"')
    delimiter = b"--" + boundary.encode("utf-8")
    parts: list[tuple[str, str, bytes]] = []
    for raw_part in body.split(delimiter):
        raw_part = raw_part.strip()
        if not raw_part or raw_part == b"--":
            continue
        if raw_part.endswith(b"--"):
            raw_part = raw_part[:-2].strip()
        header_blob, _, data = raw_part.partition(b"\r\n\r\n")
        if not header_blob:
            continue
        headers = header_blob.decode("utf-8", errors="replace").split("\r\n")
        name = ""
        filename = ""
        filename_star = ""
        for header in headers:
            if header.lower().startswith("content-disposition:"):
                for chunk in header.split(";"):
                    key, _, value = chunk.strip().partition("=")
                    if key == "name":
                        name = value.strip('"')
                    elif key == "filename":
                        filename = value.strip('"')
                    elif key == "filename*":
                        # RFC 5987: charset'language'value_percent_encoded
                        filename_star = value.strip("'").split("''", 1)[-1]
        chosen = unquote(filename_star, encoding="utf-8") if filename_star else filename
        if chosen:
            chosen = Path(chosen).name
        if data.endswith(b"\r\n"):
            data = data[:-2]
        if chosen:
            parts.append((name, chosen, data))
    return parts


def zip_directory(source_dir: Path, zip_path: Path) -> None:
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source_dir.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(source_dir))
        # Force UTF-8 flag on all entries so Chinese filenames survive extraction
        # on any OS (CP437 is the default and corrupts non-ASCII names).
        for info in archive.filelist:
            info.flag_bits |= 0x800


def poppler_install_plan() -> dict[str, object]:
    system = platform.system()
    if system == "Darwin" and shutil.which("brew"):
        return {
            "available": True,
            "platform": "macOS",
            "manager": "Homebrew",
            "command": ["brew", "install", "poppler"],
            "label": "Install Poppler with Homebrew",
        }
    if system == "Windows":
        if shutil.which("winget"):
            return {
                "available": True,
                "platform": "Windows",
                "manager": "winget",
                "command": [
                    "winget",
                    "install",
                    "--id",
                    "oschwartz10612.Poppler",
                    "-e",
                    "--accept-package-agreements",
                    "--accept-source-agreements",
                ],
                "label": "Install Poppler with winget",
            }
        if shutil.which("choco"):
            return {
                "available": True,
                "platform": "Windows",
                "manager": "Chocolatey",
                "command": ["choco", "install", "poppler", "-y"],
                "label": "Install Poppler with Chocolatey",
            }
    return {
        "available": False,
        "platform": system or "Unknown",
        "manager": "",
        "command": [],
        "label": "",
    }


def restart_server() -> None:
    """Restart the server process to pick up new PATH entries (e.g. after installing Poppler)."""
    time.sleep(1)  # allow the HTTP response to flush
    print("[server] Restarting to pick up newly installed tools...")
    os.execv(sys.executable, [sys.executable] + sys.argv)


def run_poppler_install() -> dict[str, object]:
    plan = poppler_install_plan()
    if not plan["available"]:
        raise ValueError("No supported Poppler installer was found on this host")
    with INSTALL_LOCK:
        result = subprocess.run(
            plan["command"],
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=900,
        )
    missing = require_tools()
    if result.returncode == 0 and missing:
        # Install succeeded but tools are not visible yet — restart to refresh PATH.
        threading.Thread(target=restart_server, daemon=True).start()
    return {
        "ok": result.returncode == 0,
        "returnCode": result.returncode,
        "output": result.stdout[-6000:],
        "missingTools": missing,
        "needsRestart": result.returncode == 0 and bool(missing),
        "plan": plan,
    }


def run_export_job(
    job_id: str,
    pdf_items: list[PdfItem],
    options: ExportOptions,
    export_dir: Path,
    zip_path: Path,
) -> None:
    job = EXPORT_JOBS[job_id]
    job["status"] = "running"

    def progress(done: int, total: int, label: str) -> None:
        job["done"] = done
        job["total"] = total
        job["label"] = label

    try:
        stats = export_pdfs(pdf_items, options, progress=progress)
        job["status"] = "zipping"
        job["label"] = "Creating ZIP"
        zip_directory(export_dir, zip_path)
        job["success"] = stats.success
        job["failed"] = stats.failed
        job["errors"] = stats.errors
        job["done"] = stats.total
        job["total"] = stats.total
        job["status"] = "done"
        job["label"] = "Done"
    except Exception as exc:  # noqa: BLE001 - stored for UI display.
        job["status"] = "error"
        job["errors"] = [str(exc)]
        job["label"] = str(exc)


class WebHandler(BaseHTTPRequestHandler):
    server_version = "PDFImageConverterWeb/1.0"

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[web] {self.address_string()} - {fmt % args}")

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json({"ok": True, "missingTools": require_tools(), "installer": poppler_install_plan()})
            return
        if parsed.path == "/api/preview":
            self.handle_preview(parsed.query)
            return
        if parsed.path == "/api/preview/batch":
            self.handle_preview_batch(parsed.query)
            return
        if parsed.path == "/api/export/status":
            self.handle_export_status(parsed.query)
            return
        if parsed.path == "/api/export/download":
            self.handle_export_download(parsed.query)
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/upload":
            self.handle_upload(parsed.query)
            return
        if parsed.path == "/api/export":
            self.handle_export()
            return
        if parsed.path == "/api/tools/install":
            self.handle_tools_install()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def serve_static(self, path: str) -> None:
        if path in ("", "/"):
            target = STATIC_DIR / "index.html"
        else:
            target = (STATIC_DIR / path.lstrip("/")).resolve()
            if STATIC_DIR.resolve() not in target.parents and target != STATIC_DIR.resolve():
                self.send_error(HTTPStatus.FORBIDDEN, "Forbidden")
                return
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return
        mime, _ = mimetypes.guess_type(target)
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def handle_upload(self, query: str = "") -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            content_type = self.headers.get("Content-Type", "")
            body = self.rfile.read(length)
            uploads = parse_multipart(content_type, body)
            params = parse_qs(query)
            requested_session = params.get("session", [""])[0]
            if requested_session and requested_session in SESSIONS:
                session_id = requested_session
                session = SESSIONS[session_id]
                temp_dir = Path(session["dir"])
                start_index = len(session.get("files", [])) + 1
            else:
                session_id = uuid.uuid4().hex
                temp_dir = Path(tempfile.mkdtemp(prefix="pdf_image_web_"))
                SESSIONS[session_id] = {"dir": str(temp_dir), "files": []}
                start_index = 1
            files = []
            for index, (_field, filename, data) in enumerate(uploads, start=start_index):
                if not filename.lower().endswith(".pdf"):
                    continue
                target = temp_dir / f"{index}_{filename}"
                target.write_bytes(data)
                pages = get_pdf_page_count(target)
                file_id = uuid.uuid4().hex
                files.append(
                    {
                        "id": file_id,
                        "name": filename,
                        "path": str(target),
                        "pages": pages,
                    }
                )
            SESSIONS[session_id]["files"].extend(files)
            self.send_json({"sessionId": session_id, "files": files})
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_preview(self, query: str) -> None:
        try:
            params = parse_qs(query)
            session = self.get_session(params.get("session", [""])[0])
            file_id = params.get("file", [""])[0]
            page = int(params.get("page", ["1"])[0])
            kind = params.get("kind", ["preview"])[0]
            pdf = self.find_file(session, file_id)
            temp_dir = Path(session["dir"]) / "previews"
            temp_dir.mkdir(exist_ok=True)

            print(f"[preview] file={pdf['name']} page={page} kind={kind} path={pdf['path']}")

            if kind == "thumb":
                # Thumbnails: PNG at 34 DPI (small, need quality)
                dpi = 34
                prefix = temp_dir / f"{file_id}_{page}_{kind}"
                png = prefix.with_suffix(".png")
                if not png.exists():
                    with RENDER_SEMAPHORE:
                        png = render_pdf_page(Path(pdf["path"]), page, prefix, dpi=dpi)
                data = png.read_bytes()
                content_type = "image/png"
            else:
                # Main preview: dynamic DPI and quality based on page count
                pages_total = int(pdf["pages"])
                dpi = preview_dpi(pages_total)
                quality = preview_quality(pages_total)
                prefix = temp_dir / f"{file_id}_{page}_{kind}_{dpi}q{quality}"
                cached = prefix.with_suffix(".jpg")
                if not cached.exists():
                    with RENDER_SEMAPHORE:
                        cached = render_pdf_page_preview(Path(pdf["path"]), page, prefix, dpi=dpi, quality=quality)
                data = cached.read_bytes()
                content_type = "image/jpeg"

            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_type)
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            traceback.print_exc()
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_preview_batch(self, query: str) -> None:
        """Pre-render a range of pages in parallel so they are cached for subsequent requests."""
        try:
            params = parse_qs(query)
            session = self.get_session(params.get("session", [""])[0])
            file_id = params.get("file", [""])[0]
            start = int(params.get("start", ["1"])[0])
            end = int(params.get("end", ["1"])[0])
            kind = params.get("kind", ["preview"])[0]
            pdf = self.find_file(session, file_id)
            total = int(pdf["pages"])
            start = max(1, start)
            end = min(total, end)
            pages = list(range(start, end + 1))

            temp_dir = Path(session["dir"]) / "previews"
            temp_dir.mkdir(exist_ok=True)

            if kind == "thumb":
                dpi = 34
                quality = 95
                suffix = ".png"
                render_fn = render_pdf_page
            else:
                dpi = preview_dpi(total)
                quality = preview_quality(total)
                suffix = ".jpg"
                render_fn = render_pdf_page_preview

            # Filter to pages that are not yet cached.
            uncached = []
            for p in pages:
                if kind == "thumb":
                    prefix = temp_dir / f"{file_id}_{p}_{kind}"
                else:
                    prefix = temp_dir / f"{file_id}_{p}_{kind}_{dpi}q{quality}"
                if not prefix.with_suffix(suffix).exists():
                    uncached.append(p)

            if uncached:
                def render_one(p: int) -> None:
                    if kind == "thumb":
                        pre = temp_dir / f"{file_id}_{p}_{kind}"
                        with RENDER_SEMAPHORE:
                            render_fn(Path(pdf["path"]), p, pre, dpi=dpi)
                    else:
                        pre = temp_dir / f"{file_id}_{p}_{kind}_{dpi}q{quality}"
                        with RENDER_SEMAPHORE:
                            render_fn(Path(pdf["path"]), p, pre, dpi=dpi, quality=quality)

                workers = min(len(uncached), os.cpu_count() or 4, 8)
                with ThreadPoolExecutor(max_workers=workers) as executor:
                    list(executor.map(render_one, uncached))

            self.send_json({"ok": True, "cached": len(pages) - len(uncached), "rendered": len(uncached)})
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_export(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            session = self.get_session(payload["sessionId"])
            pdf_items = []
            for file_payload in payload.get("files", []):
                if not file_payload.get("enabled", True):
                    continue
                pdf = self.find_file(session, file_payload["id"])
                pages_text = str(file_payload.get("pages", "")).strip()
                selected_pages = parse_page_ranges(pages_text, int(pdf["pages"])) if pages_text else set()
                pdf_items.append(PdfItem(Path(pdf["path"]), int(pdf["pages"]), True, selected_pages))

            export_dir = Path(session["dir"]) / f"export_{uuid.uuid4().hex}"
            zip_path = Path(session["dir"]) / f"PDFImageConverter_{uuid.uuid4().hex}.zip"
            options = ExportOptions(
                output_dir=export_dir,
                image_format=payload.get("format", "PNG"),
                dpi=int(payload.get("dpi", 300)),
                jpeg_quality=int(payload.get("jpegQuality", 90)),
                bmp_depth=payload.get("bmpDepth", "24-bit RGB"),
                export_mode=payload.get("exportMode", "separate"),
                filename_template=payload.get("filenameTemplate", "{page}") or "{page}",
            )
            job_id = uuid.uuid4().hex
            EXPORT_JOBS[job_id] = {
                "id": job_id,
                "status": "queued",
                "done": 0,
                "total": sum(len(item.active_pages()) for item in pdf_items),
                "label": "",
                "success": 0,
                "failed": 0,
                "errors": [],
                "zipPath": str(zip_path),
            }
            thread = threading.Thread(
                target=run_export_job,
                args=(job_id, pdf_items, options, export_dir, zip_path),
                daemon=True,
            )
            thread.start()
            self.send_json({"jobId": job_id})
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_export_status(self, query: str) -> None:
        try:
            params = parse_qs(query)
            job = EXPORT_JOBS.get(params.get("job", [""])[0])
            if not job:
                raise ValueError("Export job not found")
            self.send_json(
                {
                    "id": job["id"],
                    "status": job["status"],
                    "done": job["done"],
                    "total": job["total"],
                    "label": job["label"],
                    "success": job["success"],
                    "failed": job["failed"],
                    "errors": job["errors"][:5],
                    "downloadReady": job["status"] == "done" and Path(str(job["zipPath"])).exists(),
                }
            )
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_export_download(self, query: str) -> None:
        try:
            params = parse_qs(query)
            job = EXPORT_JOBS.get(params.get("job", [""])[0])
            if not job:
                raise ValueError("Export job not found")
            if job["status"] != "done":
                raise ValueError("Export job is not finished")
            zip_path = Path(str(job["zipPath"]))
            data = zip_path.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", 'attachment; filename="PDFImageConverter.zip"')
            self.send_header("X-Export-Success", str(job["success"]))
            self.send_header("X-Export-Failed", str(job["failed"]))
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as exc:
            self.send_json({"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def handle_tools_install(self) -> None:
        try:
            self.send_json(run_poppler_install())
        except Exception as exc:
            self.send_json({"error": str(exc), "installer": poppler_install_plan()}, status=HTTPStatus.BAD_REQUEST)

    def get_session(self, session_id: str) -> dict[str, object]:
        if not session_id or session_id not in SESSIONS:
            raise ValueError("Session not found")
        return SESSIONS[session_id]

    def find_file(self, session: dict[str, object], file_id: str) -> dict[str, object]:
        for item in session.get("files", []):
            if item["id"] == file_id:
                return item
        raise ValueError("PDF not found")

    def send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
        data = json_bytes(payload)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    parser = argparse.ArgumentParser(description="PDF Image Converter Web")
    parser.add_argument("--host", default="127.0.0.1", help="Use 0.0.0.0 for LAN access")
    parser.add_argument("--port", default=8765, type=int)
    args = parser.parse_args()
    host = args.host
    port = args.port
    server = ThreadingHTTPServer((host, port), WebHandler)
    print(f"PDF Image Converter Web is running at http://{host}:{port}")
    if host == "0.0.0.0":
        print("Open this from another device with your Mac LAN IP and the same port.")
    else:
        print("Use --host 0.0.0.0 for access from other devices on the same network.")
    server.serve_forever()


if __name__ == "__main__":
    main()
