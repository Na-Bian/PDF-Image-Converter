# PDF Image Converter

一个轻量级本地 Web 工具，用于将单个或多个 PDF 转换为 PNG、JPG 或 BMP 图片。

## 功能

- 上传 PDF 并预览页面
- 支持 PNG、JPG、BMP 三种导出格式
- 可配置 DPI、JPG 质量、BMP 位深
- 支持页码范围选择（如 `1,3,5-8`）
- 自定义文件命名模板
- 按 PDF 分组合并导出为 ZIP
- 多语言支持：简体中文、繁體中文、English
- 工具状态检查，支持一键安装 Poppler

## 环境要求

- **Python 3.9+**
- **Poppler** 命令行工具（`pdfinfo` 和 `pdftoppm`）
- **Pillow 12.0.0+**

支持 **Windows**、**macOS**、**Linux**。

### 安装 Poppler

**Windows**（winget）：

```bash
winget install --id oschwartz10612.Poppler -e
```

**Windows**（Chocolatey）：

```bash
choco install poppler -y
```

**macOS**（Homebrew）：

```bash
brew install poppler
```

**Linux**（Debian / Ubuntu）：

```bash
sudo apt install poppler-utils
```

### 安装 Python 依赖

```bash
pip install -r requirements.txt
```

## 运行

```bash
python web_server.py
```

然后打开 http://127.0.0.1:8765

局域网多设备访问：

```bash
python web_server.py --host 0.0.0.0 --port 8765
```

## 默认设置

| 项目 | 默认值 |
|------|--------|
| DPI | 300 |
| 格式 | PNG |
| JPG 质量 | 90 |
| BMP 位深 | 24-bit RGB |
| 导出模式 | 按 PDF 分组 |
| 命名模板 | `{page}` |
