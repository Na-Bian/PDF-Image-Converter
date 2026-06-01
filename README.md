# PDF Image Converter / PDF 转图片

A lightweight web app for converting one or more PDF files to PNG, JPG, or BMP images.

一个轻量级 Web 工具，用于将单个或多个 PDF 转换为 PNG、JPG 或 BMP 图片。

## Features / 功能

- Scan a folder for PDF files. / 扫描文件夹中的 PDF。
- Select which PDFs to export. / 勾选要导出的 PDF。
- Preview PDF pages with thumbnails. / 缩略图和大图预览。
- Export specific pages by range expression or thumbnail checks. / 支持页码范围和缩略图勾选。
- Export PNG, JPG, and BMP. / 支持 PNG、JPG、BMP。
- Adjust JPG quality. / 可调 JPG 压缩质量。
- Choose BMP bit depth: 1-bit, 8-bit grayscale, 24-bit RGB, 32-bit RGBA. / 可选 BMP 位深。
- Export each PDF to its own folder or merge all pages into one folder. / 支持分别导出或合并导出。
- Configure file name templates with `{pdf_stem}`, `{pdf_index}`, `{page}`, `{global}`. / 支持命名模板。
- Switch UI language between Chinese and English. / 支持中文和英文界面切换。

## Requirements / 依赖

- macOS
- Python 3
- Poppler command-line tools: `pdfinfo` and `pdftoppm`
- Python packages in `requirements.txt`

Install Python dependencies:

```bash
python3 -m pip install -r requirements.txt
```

If Poppler is missing, install it with Homebrew:

```bash
brew install poppler
```

## Run Web App / 运行 Web 应用

Local-only:

```bash
cd /Users/nabian/Documents/数字电路与逻辑设计/pdf_image_converter_app
python3 web_server.py
```

Then open:

```text
http://127.0.0.1:8765
```

Same-network multi-device access:

```bash
cd /Users/nabian/Documents/数字电路与逻辑设计/pdf_image_converter_app
python3 web_server.py --host 0.0.0.0 --port 8765
```

Then open `http://<your-mac-lan-ip>:8765` from another device on the same network.

## Run Desktop Prototype / 运行桌面原型

```bash
cd /Users/nabian/Documents/数字电路与逻辑设计/pdf_image_converter_app
python3 app.py
```

## Build macOS App / 打包为 .app

```bash
cd /Users/nabian/Documents/数字电路与逻辑设计/pdf_image_converter_app
./build_app.sh
```

The app will be created at:

```text
dist/PDFImageConverter.app
```

## Default Settings / 默认设置

- DPI: `300`
- Format: `PNG`
- JPG quality: `90`
- BMP depth: `24-bit RGB`
- Export mode: separate folders
- Filename template: `{page}`

Existing files are never overwritten. The app appends `_2`, `_3`, and so on when needed.
