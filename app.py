from __future__ import annotations

import queue
import threading
import tempfile
from pathlib import Path
from tkinter import (
    BOTH,
    BOTTOM,
    END,
    HORIZONTAL,
    LEFT,
    RIGHT,
    TOP,
    VERTICAL,
    X,
    Y,
    BooleanVar,
    DoubleVar,
    IntVar,
    StringVar,
    Tk,
    Toplevel,
    filedialog,
    messagebox,
)
from tkinter import ttk

from PIL import Image, ImageTk

from converter_core import (
    SUPPORTED_BMP_DEPTHS,
    SUPPORTED_FORMATS,
    ExportOptions,
    PdfItem,
    ensure_dependency_message,
    export_pdfs,
    format_page_set,
    get_pdf_page_count,
    parse_page_ranges,
    render_pdf_page,
    scan_pdfs,
)


APP_TITLE = "PDF Image Converter / PDF 转图片"


class ScrollableFrame(ttk.Frame):
    def __init__(self, parent):
        super().__init__(parent)
        self.canvas = None
        self.inner = ttk.Frame(self)
        self._build()

    def _build(self) -> None:
        import tkinter as tk

        self.canvas = tk.Canvas(self, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient=VERTICAL, command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=RIGHT, fill=Y)
        self.canvas.pack(side=LEFT, fill=BOTH, expand=True)
        window = self.canvas.create_window((0, 0), window=self.inner, anchor="nw")

        def on_configure(_event):
            self.canvas.configure(scrollregion=self.canvas.bbox("all"))

        def on_canvas_configure(event):
            self.canvas.itemconfigure(window, width=event.width)

        self.inner.bind("<Configure>", on_configure)
        self.canvas.bind("<Configure>", on_canvas_configure)


class PdfImageConverterApp:
    def __init__(self, root: Tk):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("1180x760")
        self.root.minsize(980, 640)

        self.input_dir = StringVar()
        self.output_dir = StringVar()
        self.format_var = StringVar(value="PNG")
        self.export_mode = StringVar(value="separate")
        self.filename_template = StringVar(value="{page}")
        self.dpi = IntVar(value=300)
        self.jpeg_quality = IntVar(value=90)
        self.bmp_depth = StringVar(value="24-bit RGB")
        self.page_range = StringVar()
        self.zoom = DoubleVar(value=1.0)
        self.status = StringVar(value="Ready / 就绪")
        self.current_page = IntVar(value=1)

        self.pdfs: list[PdfItem] = []
        self.pdf_vars: list[BooleanVar] = []
        self.current_pdf_index: int | None = None
        self.thumbnail_images: list[ImageTk.PhotoImage] = []
        self.thumbnail_vars: list[BooleanVar] = []
        self.preview_image: ImageTk.PhotoImage | None = None
        self.preview_temp = tempfile.TemporaryDirectory(prefix="pdf_image_preview_")
        self.worker_queue: queue.Queue[tuple[str, object]] = queue.Queue()
        self.exporting = False

        self._build_ui()
        self._check_dependencies()
        self.root.protocol("WM_DELETE_WINDOW", self.close)
        self.root.after(120, self._drain_worker_queue)

    def _build_ui(self) -> None:
        top = ttk.Frame(self.root, padding=10)
        top.pack(side=TOP, fill=X)

        ttk.Label(top, text="输入文件夹 / Input").grid(row=0, column=0, sticky="w")
        ttk.Entry(top, textvariable=self.input_dir).grid(row=0, column=1, sticky="ew", padx=6)
        ttk.Button(top, text="选择... / Choose", command=self.choose_input).grid(row=0, column=2)
        ttk.Button(top, text="扫描 / Scan", command=self.scan_input).grid(row=0, column=3, padx=(6, 0))

        ttk.Label(top, text="输出文件夹 / Output").grid(row=1, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(top, textvariable=self.output_dir).grid(row=1, column=1, sticky="ew", padx=6, pady=(6, 0))
        ttk.Button(top, text="选择... / Choose", command=self.choose_output).grid(row=1, column=2, pady=(6, 0))
        top.columnconfigure(1, weight=1)

        main = ttk.PanedWindow(self.root, orient=HORIZONTAL)
        main.pack(fill=BOTH, expand=True, padx=10, pady=(0, 10))

        self.pdf_panel = ttk.Frame(main, width=270)
        main.add(self.pdf_panel, weight=1)
        self._build_pdf_panel()

        self.preview_panel = ttk.Frame(main)
        main.add(self.preview_panel, weight=3)
        self._build_preview_panel()

        self.settings_panel = ttk.Frame(main, width=300)
        main.add(self.settings_panel, weight=1)
        self._build_settings_panel()

        bottom = ttk.Frame(self.root, padding=(10, 0, 10, 10))
        bottom.pack(side=BOTTOM, fill=X)
        self.progress = ttk.Progressbar(bottom, mode="determinate")
        self.progress.pack(side=TOP, fill=X, pady=(0, 6))
        ttk.Label(bottom, textvariable=self.status).pack(side=LEFT)
        self.export_button = ttk.Button(bottom, text="开始导出 / Export", command=self.start_export)
        self.export_button.pack(side=RIGHT)

    def _build_pdf_panel(self) -> None:
        header = ttk.Frame(self.pdf_panel)
        header.pack(fill=X, pady=(0, 6))
        ttk.Label(header, text="PDF 文件 / PDF Files").pack(side=LEFT)
        ttk.Button(header, text="全选 / All", command=lambda: self.set_all_pdfs(True)).pack(side=RIGHT)
        ttk.Button(header, text="全不选 / None", command=lambda: self.set_all_pdfs(False)).pack(side=RIGHT, padx=4)

        self.pdf_list = ttk.Frame(self.pdf_panel)
        self.pdf_list.pack(fill=BOTH, expand=True)

    def _build_preview_panel(self) -> None:
        toolbar = ttk.Frame(self.preview_panel)
        toolbar.pack(fill=X)
        ttk.Button(toolbar, text="上一页 / Prev", command=lambda: self.move_page(-1)).pack(side=LEFT)
        ttk.Label(toolbar, text="页 / Page").pack(side=LEFT, padx=(8, 2))
        ttk.Spinbox(toolbar, from_=1, to=1, textvariable=self.current_page, width=6, command=self.load_current_page).pack(side=LEFT)
        ttk.Button(toolbar, text="下一页 / Next", command=lambda: self.move_page(1)).pack(side=LEFT, padx=(4, 12))
        ttk.Label(toolbar, text="缩放 / Zoom").pack(side=LEFT)
        ttk.Scale(toolbar, from_=0.4, to=2.0, variable=self.zoom, command=lambda _v: self.load_current_page()).pack(side=LEFT, fill=X, expand=True, padx=6)

        body = ttk.PanedWindow(self.preview_panel, orient=HORIZONTAL)
        body.pack(fill=BOTH, expand=True, pady=(6, 0))
        thumb_outer = ttk.Frame(body, width=190)
        body.add(thumb_outer, weight=1)
        ttk.Label(thumb_outer, text="缩略图 / Thumbnails").pack(anchor="w")
        self.thumb_frame = ScrollableFrame(thumb_outer)
        self.thumb_frame.pack(fill=BOTH, expand=True)

        preview_outer = ttk.Frame(body)
        body.add(preview_outer, weight=4)
        self.preview_label = ttk.Label(preview_outer, text="选择 PDF 预览 / Select a PDF to preview", anchor="center")
        self.preview_label.pack(fill=BOTH, expand=True)

    def _build_settings_panel(self) -> None:
        ttk.Label(self.settings_panel, text="导出设置 / Export Settings", font=("", 13, "bold")).pack(anchor="w")

        form = ttk.Frame(self.settings_panel)
        form.pack(fill=X, pady=(8, 0))
        ttk.Label(form, text="格式 / Format").grid(row=0, column=0, sticky="w")
        ttk.Combobox(form, textvariable=self.format_var, values=SUPPORTED_FORMATS, state="readonly").grid(row=0, column=1, sticky="ew")

        ttk.Label(form, text="DPI").grid(row=1, column=0, sticky="w", pady=5)
        ttk.Spinbox(form, from_=36, to=600, textvariable=self.dpi, width=8).grid(row=1, column=1, sticky="ew", pady=5)

        ttk.Label(form, text="JPG 质量 / Quality").grid(row=2, column=0, sticky="w")
        ttk.Scale(form, from_=1, to=100, variable=self.jpeg_quality, orient=HORIZONTAL).grid(row=2, column=1, sticky="ew")
        ttk.Label(form, textvariable=self.jpeg_quality).grid(row=2, column=2, padx=(5, 0))

        ttk.Label(form, text="BMP 位深 / Depth").grid(row=3, column=0, sticky="w", pady=5)
        ttk.Combobox(form, textvariable=self.bmp_depth, values=SUPPORTED_BMP_DEPTHS, state="readonly").grid(row=3, column=1, columnspan=2, sticky="ew", pady=5)

        ttk.Label(form, text="页码 / Pages").grid(row=4, column=0, sticky="w")
        page_entry = ttk.Entry(form, textvariable=self.page_range)
        page_entry.grid(row=4, column=1, columnspan=2, sticky="ew")
        ttk.Button(form, text="应用 / Apply", command=self.apply_page_range).grid(row=5, column=1, sticky="ew", pady=(4, 8))
        ttk.Button(form, text="全页 / All Pages", command=self.select_all_pages).grid(row=5, column=2, sticky="ew", pady=(4, 8), padx=(4, 0))

        ttk.Label(form, text="命名模板 / Template").grid(row=6, column=0, sticky="w")
        ttk.Entry(form, textvariable=self.filename_template).grid(row=6, column=1, columnspan=2, sticky="ew")
        form.columnconfigure(1, weight=1)

        mode_box = ttk.LabelFrame(self.settings_panel, text="导出模式 / Export Mode", padding=8)
        mode_box.pack(fill=X, pady=10)
        ttk.Radiobutton(mode_box, text="分别建文件夹 / Separate folders", variable=self.export_mode, value="separate").pack(anchor="w")
        ttk.Radiobutton(mode_box, text="合并到一个文件夹 / Merge into one folder", variable=self.export_mode, value="merge").pack(anchor="w")

        help_text = (
            "模板变量 / Template tokens:\n"
            "{pdf_stem}, {pdf_index}, {page}, {global}\n"
            "默认不覆盖已有文件 / Existing files are not overwritten."
        )
        ttk.Label(self.settings_panel, text=help_text, justify=LEFT).pack(anchor="w", pady=(4, 0))

    def _check_dependencies(self) -> None:
        message = ensure_dependency_message()
        if message:
            messagebox.showerror(APP_TITLE, message)
            self.status.set(message.splitlines()[0])

    def choose_input(self) -> None:
        folder = filedialog.askdirectory(title="Choose input folder / 选择输入文件夹")
        if folder:
            self.input_dir.set(folder)
            if not self.output_dir.get():
                self.output_dir.set(str(Path(folder) / "converted_images"))
            self.scan_input()

    def choose_output(self) -> None:
        folder = filedialog.askdirectory(title="Choose output folder / 选择输出文件夹")
        if folder:
            self.output_dir.set(folder)

    def scan_input(self) -> None:
        folder_text = self.input_dir.get().strip()
        if not folder_text:
            messagebox.showinfo(APP_TITLE, "请选择输入文件夹 / Please choose an input folder.")
            return
        try:
            self.pdfs = scan_pdfs(Path(folder_text))
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        self.pdf_vars = [BooleanVar(value=item.enabled) for item in self.pdfs]
        self.render_pdf_list()
        self.status.set(f"Found {len(self.pdfs)} PDFs / 找到 {len(self.pdfs)} 个 PDF")
        if self.pdfs:
            self.select_pdf(0)

    def render_pdf_list(self) -> None:
        for child in self.pdf_list.winfo_children():
            child.destroy()
        if not self.pdfs:
            ttk.Label(self.pdf_list, text="No PDFs / 没有 PDF").pack(anchor="w")
            return
        for index, item in enumerate(self.pdfs):
            row = ttk.Frame(self.pdf_list)
            row.pack(fill=X, pady=2)
            check = ttk.Checkbutton(
                row,
                variable=self.pdf_vars[index],
                command=lambda i=index: self.toggle_pdf(i),
            )
            check.pack(side=LEFT)
            label_text = f"{item.path.name}\n{item.pages} pages / 页"
            ttk.Button(row, text=label_text, command=lambda i=index: self.select_pdf(i)).pack(side=LEFT, fill=X, expand=True)

    def set_all_pdfs(self, value: bool) -> None:
        for index, var in enumerate(self.pdf_vars):
            var.set(value)
            self.pdfs[index].enabled = value

    def toggle_pdf(self, index: int) -> None:
        self.pdfs[index].enabled = self.pdf_vars[index].get()

    def select_pdf(self, index: int) -> None:
        if index < 0 or index >= len(self.pdfs):
            return
        self.current_pdf_index = index
        item = self.pdfs[index]
        self.current_page.set(1 if item.pages else 0)
        self.page_range.set(format_page_set(item.selected_pages, item.pages))
        self.load_thumbnails()
        self.load_current_page()

    def current_pdf(self) -> PdfItem | None:
        if self.current_pdf_index is None:
            return None
        if self.current_pdf_index >= len(self.pdfs):
            return None
        return self.pdfs[self.current_pdf_index]

    def move_page(self, delta: int) -> None:
        item = self.current_pdf()
        if not item or item.pages < 1:
            return
        page = max(1, min(item.pages, self.current_page.get() + delta))
        self.current_page.set(page)
        self.load_current_page()

    def load_current_page(self) -> None:
        item = self.current_pdf()
        if not item or item.pages < 1:
            return
        page = max(1, min(item.pages, self.current_page.get()))
        self.current_page.set(page)
        try:
            prefix = Path(self.preview_temp.name) / f"preview_{self.current_pdf_index}_{page}"
            png = render_pdf_page(item.path, page, prefix, dpi=72)
            with Image.open(png) as image:
                image.thumbnail((int(720 * self.zoom.get()), int(900 * self.zoom.get())))
                self.preview_image = ImageTk.PhotoImage(image.copy())
            self.preview_label.configure(image=self.preview_image, text="")
        except Exception as exc:
            self.preview_label.configure(image="", text=f"Preview failed / 预览失败\n{exc}")

    def load_thumbnails(self) -> None:
        for child in self.thumb_frame.inner.winfo_children():
            child.destroy()
        self.thumbnail_images.clear()
        self.thumbnail_vars.clear()
        item = self.current_pdf()
        if not item or item.pages < 1:
            return
        for page in range(1, item.pages + 1):
            selected = not item.selected_pages or page in item.selected_pages
            row = ttk.Frame(self.thumb_frame.inner)
            row.pack(fill=X, pady=3)
            try:
                prefix = Path(self.preview_temp.name) / f"thumb_{self.current_pdf_index}_{page}"
                png = render_pdf_page(item.path, page, prefix, dpi=28)
                with Image.open(png) as image:
                    image.thumbnail((95, 130))
                    photo = ImageTk.PhotoImage(image.copy())
                self.thumbnail_images.append(photo)
                button = ttk.Button(row, image=photo, command=lambda p=page: self.goto_page(p))
                button.pack(side=LEFT)
            except Exception:
                ttk.Button(row, text=str(page), command=lambda p=page: self.goto_page(p)).pack(side=LEFT)
            page_var = BooleanVar(value=selected)
            self.thumbnail_vars.append(page_var)
            check = ttk.Checkbutton(row, text=str(page), variable=page_var, command=lambda p=page, v=page_var: self.toggle_page(p, v))
            check.pack(side=LEFT, padx=4)

    def goto_page(self, page: int) -> None:
        self.current_page.set(page)
        self.load_current_page()

    def toggle_page(self, page: int, var: BooleanVar) -> None:
        item = self.current_pdf()
        if not item:
            return
        if not item.selected_pages:
            item.selected_pages = set(range(1, item.pages + 1))
        if var.get():
            item.selected_pages.add(page)
        else:
            item.selected_pages.discard(page)
        self.page_range.set(format_page_set(item.selected_pages, item.pages))

    def apply_page_range(self) -> None:
        item = self.current_pdf()
        if not item:
            return
        try:
            item.selected_pages = parse_page_ranges(self.page_range.get(), item.pages)
        except ValueError as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        if len(item.selected_pages) == item.pages:
            item.selected_pages = set()
        self.page_range.set(format_page_set(item.selected_pages, item.pages))
        self.load_thumbnails()

    def select_all_pages(self) -> None:
        item = self.current_pdf()
        if not item:
            return
        item.selected_pages = set()
        self.page_range.set("")
        self.load_thumbnails()

    def start_export(self) -> None:
        if self.exporting:
            return
        if not self.pdfs:
            messagebox.showinfo(APP_TITLE, "请先扫描 PDF / Please scan PDFs first.")
            return
        output = self.output_dir.get().strip()
        if not output:
            messagebox.showinfo(APP_TITLE, "请选择输出文件夹 / Please choose an output folder.")
            return
        try:
            dpi = int(self.dpi.get())
            if dpi < 36 or dpi > 600:
                raise ValueError
        except Exception:
            messagebox.showerror(APP_TITLE, "DPI must be between 36 and 600 / DPI 必须在 36 到 600 之间。")
            return
        for index, var in enumerate(self.pdf_vars):
            self.pdfs[index].enabled = var.get()
        options = ExportOptions(
            output_dir=Path(output),
            image_format=self.format_var.get(),
            dpi=dpi,
            jpeg_quality=int(self.jpeg_quality.get()),
            bmp_depth=self.bmp_depth.get(),
            export_mode=self.export_mode.get(),
            filename_template=self.filename_template.get().strip() or "{page}",
        )
        self.exporting = True
        self.export_button.configure(state="disabled")
        self.progress.configure(value=0, maximum=1)
        self.status.set("Exporting... / 正在导出...")
        thread = threading.Thread(target=self._export_worker, args=(options,), daemon=True)
        thread.start()

    def _export_worker(self, options: ExportOptions) -> None:
        def progress(done: int, total: int, label: str) -> None:
            self.worker_queue.put(("progress", (done, total, label)))

        try:
            stats = export_pdfs(self.pdfs, options, progress=progress)
            self.worker_queue.put(("done", stats))
        except Exception as exc:
            self.worker_queue.put(("error", exc))

    def _drain_worker_queue(self) -> None:
        try:
            while True:
                event, payload = self.worker_queue.get_nowait()
                if event == "progress":
                    done, total, label = payload
                    self.progress.configure(maximum=max(total, 1), value=done)
                    self.status.set(f"{done}/{total}: {label}")
                elif event == "done":
                    self.exporting = False
                    self.export_button.configure(state="normal")
                    stats = payload
                    self.progress.configure(maximum=max(stats.total, 1), value=stats.total)
                    self.status.set(f"Done / 完成: {stats.success} success, {stats.failed} failed")
                    self.show_export_result(stats)
                elif event == "error":
                    self.exporting = False
                    self.export_button.configure(state="normal")
                    messagebox.showerror(APP_TITLE, str(payload))
                    self.status.set("Export failed / 导出失败")
        except queue.Empty:
            pass
        self.root.after(120, self._drain_worker_queue)

    def show_export_result(self, stats) -> None:
        if not stats.errors:
            messagebox.showinfo(APP_TITLE, f"导出完成 / Export complete\n成功 / Success: {stats.success}")
            return
        window = Toplevel(self.root)
        window.title("Export Result / 导出结果")
        window.geometry("680x420")
        ttk.Label(window, text=f"成功 / Success: {stats.success}    失败 / Failed: {stats.failed}").pack(anchor="w", padx=10, pady=8)
        text = None
        import tkinter as tk

        text = tk.Text(window, wrap="word")
        text.pack(fill=BOTH, expand=True, padx=10, pady=(0, 10))
        text.insert("1.0", "\n".join(stats.errors))
        text.configure(state="disabled")

    def close(self) -> None:
        try:
            self.preview_temp.cleanup()
        finally:
            self.root.destroy()


def main() -> None:
    root = Tk()
    try:
        root.call("tk", "scaling", 1.2)
    except Exception:
        pass
    PdfImageConverterApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
