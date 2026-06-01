#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
python3 -m PyInstaller --noconfirm --windowed --name PDFImageConverter app.py

echo "Built dist/PDFImageConverter.app"
