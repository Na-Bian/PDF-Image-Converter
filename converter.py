from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable

from PIL import Image


SUPPORTED_FORMATS = ("PNG", "JPG", "BMP")
SUPPORTED_BMP_DEPTHS = ("1-bit", "8-bit grayscale", "24-bit RGB", "32-bit RGBA")
TOOL_SEARCH_DIRS = (
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
)

# Windows: add common Poppler install locations
if platform.system() == "Windows":
    _local = Path(os.environ.get("LOCALAPPDATA", "")) / "Poppler"
    _prog = Path(os.environ.get("PROGRAMFILES", "")) / "Poppler"
    for _d in [_local, _prog]:
        if _d.is_dir():
            TOOL_SEARCH_DIRS = (*TOOL_SEARCH_DIRS, str(_d / "Library" / "bin"))


class ConverterError(RuntimeError):
    pass


@dataclass
class PdfItem:
    path: Path
    pages: int
    enabled: bool = True
    selected_pages: set[int] = field(default_factory=set)

    @property
    def stem(self) -> str:
        return self.path.stem

    def active_pages(self) -> list[int]:
        if not self.selected_pages:
            return list(range(1, self.pages + 1))
        return sorted(p for p in self.selected_pages if 1 <= p <= self.pages)


@dataclass
class ExportOptions:
    output_dir: Path
    image_format: str = "PNG"
    dpi: int = 300
    jpeg_quality: int = 90
    bmp_depth: str = "24-bit RGB"
    export_mode: str = "separate"
    filename_template: str = "{page}"
    workers: int | None = None


@dataclass
class ExportStats:
    total: int = 0
    success: int = 0
    failed: int = 0
    errors: list[str] = field(default_factory=list)


ProgressCallback = Callable[[int, int, str], None]


@dataclass(frozen=True)
class ExportTask:
    item: PdfItem
    pdf_index: int
    page: int
    global_index: int
    source_prefix: Path
    target_path: Path
    label: str


def require_tools() -> list[str]:
    missing = []
    for name in ("pdfinfo", "pdftoppm"):
        if find_tool(name) is None:
            missing.append(name)
    return missing


def find_tool(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found
    for folder in TOOL_SEARCH_DIRS:
        candidate = Path(folder) / name
        if candidate.exists() and os.access(candidate, os.X_OK):
            return str(candidate)
    return None


def tool_path(name: str) -> str:
    found = find_tool(name)
    if not found:
        raise ConverterError(f"Required tool not found: {name}")
    return found


def natural_key(path: Path) -> list[object]:
    parts = re.split(r"(\d+)", path.name.lower())
    return [int(part) if part.isdigit() else part for part in parts]


def scan_pdfs(folder: Path) -> list[PdfItem]:
    if not folder.exists() or not folder.is_dir():
        raise ConverterError(f"Input folder does not exist: {folder}")

    pdf_paths = sorted(
        (p for p in folder.iterdir() if p.is_file() and p.suffix.lower() == ".pdf"),
        key=natural_key,
    )
    items: list[PdfItem] = []
    for pdf_path in pdf_paths:
        try:
            items.append(PdfItem(path=pdf_path, pages=get_pdf_page_count(pdf_path)))
        except ConverterError:
            items.append(PdfItem(path=pdf_path, pages=0, enabled=False))
    return items


def get_pdf_page_count(pdf_path: Path) -> int:
    result = subprocess.run(
        [tool_path("pdfinfo"), str(pdf_path)],
        check=False,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise ConverterError(result.stderr.strip() or f"Failed to inspect {pdf_path}")

    for line in result.stdout.splitlines():
        if line.startswith("Pages:"):
            try:
                return int(line.split(":", 1)[1].strip())
            except ValueError as exc:
                raise ConverterError(f"Invalid page count for {pdf_path}") from exc
    raise ConverterError(f"pdfinfo did not report page count for {pdf_path}")


def parse_page_ranges(text: str, page_count: int) -> set[int]:
    cleaned = text.strip()
    if not cleaned:
        return set(range(1, page_count + 1))

    selected: set[int] = set()
    for raw_part in cleaned.split(","):
        part = raw_part.strip()
        if not part:
            continue
        if "-" in part:
            left, right = part.split("-", 1)
            if not left.strip().isdigit() or not right.strip().isdigit():
                raise ValueError(f"Invalid page range: {part}")
            start = int(left)
            end = int(right)
            if start > end:
                raise ValueError(f"Invalid descending page range: {part}")
            selected.update(range(start, end + 1))
        else:
            if not part.isdigit():
                raise ValueError(f"Invalid page number: {part}")
            selected.add(int(part))

    invalid = sorted(p for p in selected if p < 1 or p > page_count)
    if invalid:
        raise ValueError(f"Page out of range: {invalid[0]} (valid 1-{page_count})")
    return selected


def render_pdf_page(pdf_path: Path, page: int, output_prefix: Path, dpi: int = 300) -> Path:
    result = subprocess.run(
        [
            tool_path("pdftoppm"),
            "-png",
            "-r",
            str(dpi),
            "-f",
            str(page),
            "-l",
            str(page),
            "-singlefile",
            str(pdf_path),
            str(output_prefix),
        ],
        check=False,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise ConverterError(result.stderr.strip() or f"Failed to render page {page}")
    png_path = output_prefix.with_suffix(".png")
    if not png_path.exists():
        raise ConverterError(f"Renderer did not create {png_path}")
    return png_path


def render_pdf_page_preview(pdf_path: Path, page: int, output_prefix: Path, dpi: int = 72, quality: int = 90) -> Path:
    """Render a single page to JPEG using pdftoppm -jpeg (faster and smaller than PNG)."""
    result = subprocess.run(
        [
            tool_path("pdftoppm"),
            "-jpeg",
            "-jpegopt", f"quality={quality}",
            "-r",
            str(dpi),
            "-f",
            str(page),
            "-l",
            str(page),
            "-singlefile",
            str(pdf_path),
            str(output_prefix),
        ],
        check=False,
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if result.returncode != 0:
        raise ConverterError(result.stderr.strip() or f"Failed to render page {page}")
    jpg_path = output_prefix.with_suffix(".jpg")
    if not jpg_path.exists():
        raise ConverterError(f"Renderer did not create {jpg_path}")
    return jpg_path


def save_image(source_png: Path, target_path: Path, options: ExportOptions) -> None:
    fmt = options.image_format.upper()
    with Image.open(source_png) as image:
        if fmt == "PNG":
            image.save(target_path, format="PNG")
        elif fmt == "JPG":
            rgb = image.convert("RGB")
            quality = max(1, min(100, int(options.jpeg_quality)))
            rgb.save(target_path, format="JPEG", quality=quality, optimize=True)
        elif fmt == "BMP":
            converted = convert_for_bmp(image, options.bmp_depth)
            converted.save(target_path, format="BMP")
        else:
            raise ConverterError(f"Unsupported output format: {options.image_format}")


def convert_for_bmp(image: Image.Image, bmp_depth: str) -> Image.Image:
    if bmp_depth == "1-bit":
        return image.convert("1")
    if bmp_depth == "8-bit grayscale":
        return image.convert("L")
    if bmp_depth == "24-bit RGB":
        return image.convert("RGB")
    if bmp_depth == "32-bit RGBA":
        return image.convert("RGBA")
    raise ConverterError(f"Unsupported BMP bit depth: {bmp_depth}")


def extension_for_format(image_format: str) -> str:
    fmt = image_format.upper()
    if fmt == "JPG":
        return ".jpg"
    if fmt == "PNG":
        return ".png"
    if fmt == "BMP":
        return ".bmp"
    raise ConverterError(f"Unsupported output format: {image_format}")


def safe_filename(name: str) -> str:
    name = re.sub(r"[/:\\]+", "_", name).strip()
    name = re.sub(r"\s+", " ", name)
    return name or "page"


def build_filename(template: str, pdf_item: PdfItem, pdf_index: int, page: int, global_index: int) -> str:
    values = {
        "pdf_stem": pdf_item.stem,
        "pdf_index": str(pdf_index),
        "page": str(page),
        "global": str(global_index),
    }
    try:
        rendered = template.format(**values)
    except KeyError as exc:
        raise ConverterError(f"Unknown filename template token: {exc}") from exc
    return safe_filename(rendered)


def avoid_overwrite(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    parent = path.parent
    counter = 2
    while True:
        candidate = parent / f"{stem}_{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def reserve_unique_path(path: Path, reserved: set[Path]) -> Path:
    candidate = avoid_overwrite(path)
    if candidate not in reserved:
        reserved.add(candidate)
        return candidate

    stem = candidate.stem
    suffix = candidate.suffix
    parent = candidate.parent
    counter = 2
    while True:
        next_candidate = parent / f"{stem}_{counter}{suffix}"
        if not next_candidate.exists() and next_candidate not in reserved:
            reserved.add(next_candidate)
            return next_candidate
        counter += 1


def enabled_items(items: Iterable[PdfItem]) -> list[PdfItem]:
    return [item for item in items if item.enabled and item.pages > 0 and item.active_pages()]


def auto_worker_count(total_tasks: int) -> int:
    if total_tasks <= 1:
        return 1
    cpu_count = os.cpu_count() or 4
    return max(1, min(total_tasks, 8, max(2, cpu_count // 2)))


def export_pdfs(
    items: Iterable[PdfItem],
    options: ExportOptions,
    progress: ProgressCallback | None = None,
) -> ExportStats:
    chosen = enabled_items(items)
    stats = ExportStats(total=sum(len(item.active_pages()) for item in chosen))
    options.output_dir.mkdir(parents=True, exist_ok=True)
    ext = extension_for_format(options.image_format)
    global_index = 1
    completed = 0

    with tempfile.TemporaryDirectory(prefix="pdf_image_converter_") as tmp_dir:
        tmp_path = Path(tmp_dir)
        tasks: list[ExportTask] = []
        reserved_targets: set[Path] = set()
        for pdf_index, item in enumerate(chosen, start=1):
            if options.export_mode == "merge":
                target_dir = options.output_dir
            else:
                target_dir = options.output_dir / safe_filename(item.stem)
            target_dir.mkdir(parents=True, exist_ok=True)

            for page in item.active_pages():
                label = f"{item.path.name} page {page}"
                filename = build_filename(
                    options.filename_template,
                    item,
                    pdf_index=pdf_index,
                    page=page,
                    global_index=global_index,
                )
                target_path = reserve_unique_path(target_dir / f"{filename}{ext}", reserved_targets)
                tasks.append(
                    ExportTask(
                        item=item,
                        pdf_index=pdf_index,
                        page=page,
                        global_index=global_index,
                        source_prefix=tmp_path / f"render_{pdf_index}_{page}_{global_index}",
                        target_path=target_path,
                        label=label,
                    )
                )
                global_index += 1

        def run_task(task: ExportTask) -> None:
            source_png = render_pdf_page(task.item.path, task.page, task.source_prefix, dpi=options.dpi)
            save_image(source_png, task.target_path, options)

        workers = auto_worker_count(stats.total) if options.workers is None else max(1, min(int(options.workers), stats.total or 1))
        if workers == 1:
            for task in tasks:
                try:
                    if progress:
                        progress(completed, stats.total, task.label)
                    run_task(task)
                    stats.success += 1
                except Exception as exc:  # noqa: BLE001 - surface per-page errors to the UI.
                    stats.failed += 1
                    stats.errors.append(f"{task.label}: {exc}")
                finally:
                    completed += 1
                    if progress:
                        progress(completed, stats.total, task.label)
        else:
            with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="pdf-export") as executor:
                future_to_task = {}
                for task in tasks:
                    if progress:
                        progress(completed, stats.total, task.label)
                    future_to_task[executor.submit(run_task, task)] = task
                for future in as_completed(future_to_task):
                    task = future_to_task[future]
                    try:
                        future.result()
                        stats.success += 1
                    except Exception as exc:  # noqa: BLE001 - surface per-page errors to the UI.
                        stats.failed += 1
                        stats.errors.append(f"{task.label}: {exc}")
                    finally:
                        completed += 1
                        if progress:
                            progress(completed, stats.total, task.label)
    return stats


def format_page_set(pages: set[int], page_count: int) -> str:
    if not pages or len(pages) == page_count:
        return ""
    sorted_pages = sorted(pages)
    ranges: list[str] = []
    start = prev = sorted_pages[0]
    for page in sorted_pages[1:]:
        if page == prev + 1:
            prev = page
            continue
        ranges.append(str(start) if start == prev else f"{start}-{prev}")
        start = prev = page
    ranges.append(str(start) if start == prev else f"{start}-{prev}")
    return ",".join(ranges)


def ensure_dependency_message() -> str:
    missing = require_tools()
    if not missing:
        return ""
    return (
        "Missing required command-line tools / 缺少必要命令行工具: "
        + ", ".join(missing)
        + "\nInstall Poppler first, then restart the app. / 请先安装 Poppler 后重启应用。"
    )
