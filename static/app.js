/* ─── SVG Icon System ─────────────────────────────── */
const icons = {
  pdf: '<path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
  input: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  preview: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.5 1.2.67 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  chevronLeft: '<polyline points="15,18 9,12 15,6"/>',
  chevronRight: '<polyline points="9,6 15,12 9,18"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  page: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  spinner: '<path d="M21 12a9 9 0 1 1-6.22-8.56"/>',
};

function uiIcon(name, size = 16) {
  return `<svg class="ui-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg>`;
}

const translations = {
  zh: {
    eyebrow: "本地 Web 工具",
    title: "PDF 图片转换工具",
    language: "语言",
    checkTools: "检查工具",
    installTools: "一键安装",
    input: "输入文件",
    dropTitle: "选择或拖入 PDF",
    preview: "预览",
    emptyPreview: "上传 PDF 后在这里预览页面",
    settings: "导出设置",
    format: "格式",
    quality: "图片质量",
    jpgOptions: "图片质量",
    bmpDepth: "位深",
    pageRange: "页码范围",
    template: "命名方式",
    mode: "导出模式",
    separate: "按 PDF 分组",
    merge: "合并为连续序列",
    export: "导出 ZIP",
    zipping: "正在打包 ZIP...",
    progress: "{done} / {total} 页",
    ready: "准备就绪",
    uploading: "正在上传 PDF...",
    uploaded: "已载入 {count} 个 PDF",
    noPdf: "请先选择 PDF 文件",
    exporting: "正在导出，请稍候...",
    exportDone: "导出完成：成功 {success} 页，失败 {failed} 页",
    toolOk: "工具正常：pdfinfo 和 pdftoppm 已找到",
    toolMissing: "缺少工具：{tools}",
    installUnavailable: "当前主机没有检测到支持的一键安装方式，请手动安装 Poppler。",
    installingTools: "正在安装 Poppler，请稍候...",
    installOk: "安装完成，请重新检查工具。",
    installFailed: "安装失败",
    page: "第 {page} / {total} 页",
    pages: "{count} 页",
    enabled: "启用",
    uploadFailed: "上传失败",
    exportFailed: "导出失败",
    templatePage: "页码",
    templateGlobal: "连续编号",
    templatePdfPage: "文件名 + 页码",
    templatePdfGlobal: "文件名 + 连续编号",
    templateCustom: "自定义",
    templateDescPage: "每个 PDF 独立从 1 开始",
    templateDescGlobal: "多个 PDF 统一连续编号",
    templateDescPdfPage: "文件名_页码，每组独立",
    templateDescPdfGlobal: "文件名_连续编号，多组连排",
    templateExampleLabel: "示例",
    tokenPage: "页码",
    tokenGlobal: "连续编号",
    tokenPdfStem: "PDF 文件名",
    tokenPdfIndex: "PDF 顺序",
    loadingPreview: "正在生成页面...",
    previewFailed: "预览生成失败，点击页码可重试",
    thumbnailSummary: "{count} 页",
    copyright: "©2026 那，边。版权所有。",
    toolCheckTitle: "检查结果",
    toolCheckOk: "工具正常",
    toolCheckOkDesc: "pdfinfo 和 pdftoppm 均已就绪，可以正常使用。",
    toolCheckMissing: "缺少工具",
    toolCheckMissingDesc: "缺少以下工具：{tools}",
    toolCheckNoInstaller: "当前系统未检测到支持的安装方式，请手动安装 Poppler。",
    toolCheckInstall: "一键安装",
    toolCheckInstalling: "正在安装…",
    toolCheckInstallOk: "安装完成，请重新检查。",
    toolCheckInstallFail: "安装失败",
    toolCheckClose: "关闭",
    toolCheckRetry: "重新检查",
    toolCheckRestarting: "安装完成，服务器正在重启以加载新工具…",
    toolCheckRestartWait: "等待服务器重启…",
  },
  zht: {
    eyebrow: "本地 Web 工具",
    title: "PDF 圖片轉換工具",
    language: "語言",
    checkTools: "檢查工具",
    installTools: "一鍵安裝",
    input: "輸入檔案",
    dropTitle: "選擇或拖入 PDF",
    preview: "預覽",
    emptyPreview: "上傳 PDF 後在這裡預覽頁面",
    settings: "匯出設定",
    format: "格式",
    quality: "圖片品質",
    jpgOptions: "圖片品質",
    bmpDepth: "位元深度",
    pageRange: "頁碼範圍",
    template: "命名方式",
    mode: "匯出模式",
    separate: "按 PDF 分組",
    merge: "合併為連續序列",
    export: "匯出 ZIP",
    zipping: "正在封裝 ZIP...",
    progress: "{done} / {total} 頁",
    ready: "準備就緒",
    uploading: "正在上傳 PDF...",
    uploaded: "已載入 {count} 個 PDF",
    noPdf: "請先選擇 PDF 檔案",
    exporting: "正在匯出，請稍候...",
    exportDone: "匯出完成：成功 {success} 頁，失敗 {failed} 頁",
    toolOk: "工具正常：pdfinfo 和 pdftoppm 已找到",
    toolMissing: "缺少工具：{tools}",
    installUnavailable: "當前主機沒有偵測到支援的一鍵安裝方式，請手動安裝 Poppler。",
    installingTools: "正在安裝 Poppler，請稍候...",
    installOk: "安裝完成，請重新檢查工具。",
    installFailed: "安裝失敗",
    page: "第 {page} / {total} 頁",
    pages: "{count} 頁",
    enabled: "啟用",
    uploadFailed: "上傳失敗",
    exportFailed: "匯出失敗",
    templatePage: "頁碼",
    templateGlobal: "連續編號",
    templatePdfPage: "檔名 + 頁碼",
    templatePdfGlobal: "檔名 + 連續編號",
    templateCustom: "自訂",
    templateDescPage: "每個 PDF 獨立從 1 開始",
    templateDescGlobal: "多個 PDF 統一連續編號",
    templateDescPdfPage: "檔名_頁碼，每組獨立",
    templateDescPdfGlobal: "檔名_連續編號，多組連排",
    templateExampleLabel: "範例",
    tokenPage: "頁碼",
    tokenGlobal: "連續編號",
    tokenPdfStem: "PDF 檔名",
    tokenPdfIndex: "PDF 順序",
    loadingPreview: "正在生成頁面...",
    previewFailed: "預覽生成失敗，點擊頁碼可重試",
    thumbnailSummary: "{count} 頁",
    copyright: "©2026 那，邊。版權所有。",
    toolCheckTitle: "檢查結果",
    toolCheckTitle: "檢查結果",
    toolCheckOk: "工具正常",
    toolCheckOkDesc: "pdfinfo 和 pdftoppm 均已就緒，可以正常使用。",
    toolCheckMissing: "缺少工具",
    toolCheckMissingDesc: "缺少以下工具：{tools}",
    toolCheckNoInstaller: "當前系統未偵測到支援的安裝方式，請手動安裝 Poppler。",
    toolCheckInstall: "一鍵安裝",
    toolCheckInstalling: "正在安裝…",
    toolCheckInstallOk: "安裝完成，請重新檢查。",
    toolCheckInstallFail: "安裝失敗",
    toolCheckClose: "關閉",
    toolCheckRetry: "重新檢查",
    toolCheckRestarting: "安裝完成，伺服器正在重啟以載入新工具…",
    toolCheckRestartWait: "等待伺服器重啟…",
  },
  en: {
    eyebrow: "Local Web Tool",
    title: "PDF Image Converter",
    language: "Language",
    checkTools: "Check tools",
    installTools: "Install",
    input: "Input Files",
    dropTitle: "Choose or drop PDFs",
    preview: "Preview",
    emptyPreview: "Upload PDFs to preview pages here",
    settings: "Export Settings",
    format: "Format",
    quality: "Image Quality",
    jpgOptions: "Image Quality",
    bmpDepth: "Bit Depth",
    pageRange: "Page Range",
    template: "Naming",
    mode: "Export Mode",
    separate: "Group by PDF",
    merge: "Merge as one sequence",
    export: "Export ZIP",
    zipping: "Creating ZIP...",
    progress: "{done} / {total} pages",
    ready: "Ready",
    uploading: "Uploading PDFs...",
    uploaded: "Loaded {count} PDF files",
    noPdf: "Choose PDF files first",
    exporting: "Exporting, please wait...",
    exportDone: "Export complete: {success} pages succeeded, {failed} failed",
    toolOk: "Tools ready: pdfinfo and pdftoppm were found",
    toolMissing: "Missing tools: {tools}",
    installUnavailable: "No supported one-click installer was detected on this host. Please install Poppler manually.",
    installingTools: "Installing Poppler, please wait...",
    installOk: "Install finished. Check tools again.",
    installFailed: "Install failed",
    page: "Page {page} / {total}",
    pages: "{count} pages",
    enabled: "Enabled",
    uploadFailed: "Upload failed",
    exportFailed: "Export failed",
    templatePage: "Page number",
    templateGlobal: "Continuous number",
    templatePdfPage: "File + page",
    templatePdfGlobal: "File + continuous",
    templateCustom: "Custom",
    templateDescPage: "Each PDF restarts from 1",
    templateDescGlobal: "Sequential across all PDFs",
    templateDescPdfPage: "name_page, resets per PDF",
    templateDescPdfGlobal: "name_number, continuous",
    templateExampleLabel: "Example",
    tokenPage: "Page",
    tokenGlobal: "Continuous",
    tokenPdfStem: "PDF name",
    tokenPdfIndex: "PDF order",
    loadingPreview: "Rendering page...",
    previewFailed: "Preview failed. Click a page to retry",
    thumbnailSummary: "{count} pages",
    copyright: "©2026 Na, Bian. All rights reserved.",
    toolCheckTitle: "Tool Check",
    toolCheckOk: "All tools ready",
    toolCheckOkDesc: "pdfinfo and pdftoppm are both available.",
    toolCheckMissing: "Missing tools",
    toolCheckMissingDesc: "The following tools are missing: {tools}",
    toolCheckNoInstaller: "No supported installer was detected on this system. Please install Poppler manually.",
    toolCheckInstall: "Install now",
    toolCheckInstalling: "Installing…",
    toolCheckInstallOk: "Install complete. Please check again.",
    toolCheckInstallFail: "Install failed",
    toolCheckClose: "Close",
    toolCheckRetry: "Check again",
    toolCheckRestarting: "Install complete. Server is restarting to load new tools…",
    toolCheckRestartWait: "Waiting for server to restart…",
  },
};

const templatePresets = [
  { key: "templatePage", value: "{page}", labelKey: "templateDescPage" },
  { key: "templateGlobal", value: "{global}", labelKey: "templateDescGlobal" },
  { key: "templatePdfPage", value: "{pdf_stem}_{page}", labelKey: "templateDescPdfPage" },
  { key: "templatePdfGlobal", value: "{pdf_stem}_{global}", labelKey: "templateDescPdfGlobal" },
  { key: "templateCustom", value: "custom", labelKey: null },
];

const state = {
  lang: localStorage.getItem("pdfImageLanguage") || "zh",
  sessionId: "",
  files: [],
  currentFileId: "",
  currentPage: 1,
  format: "PNG",
  previewScrollTimer: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showToolCheckModal(payload) {
  const existing = $("#toolCheckModal");
  if (existing) existing.remove();

  const missing = payload.missingTools || [];
  const hasInstaller = Boolean(payload.installer?.available);
  const ok = missing.length === 0;

  const overlay = document.createElement("div");
  overlay.id = "toolCheckModal";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon ${ok ? "modal-icon-ok" : "modal-icon-warn"}">
        ${ok ? "✓" : "!"}
      </div>
      <h3 class="modal-title">${ok ? t("toolCheckOk") : t("toolCheckMissing")}</h3>
      <p class="modal-desc">
        ${ok ? t("toolCheckOkDesc") : (hasInstaller ? t("toolCheckMissingDesc", { tools: missing.join(", ") }) : `${t("toolCheckMissingDesc", { tools: missing.join(", ") })}<br>${t("toolCheckNoInstaller")}`)}
      </p>
      <div class="modal-actions">
        ${!ok && hasInstaller ? `<button class="primary-button modal-install-btn" type="button">${t("toolCheckInstall")}</button>` : ""}
        ${!ok ? `<button class="ghost-button modal-retry-btn" type="button">${t("toolCheckRetry")}</button>` : ""}
        <button class="ghost-button modal-close-btn" type="button">${t("toolCheckClose")}</button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.querySelector(".modal-close-btn")?.addEventListener("click", () => overlay.remove());

  overlay.querySelector(".modal-retry-btn")?.addEventListener("click", async () => {
    overlay.remove();
    $("#healthButton").click();
  });

  overlay.querySelector(".modal-install-btn")?.addEventListener("click", async () => {
    const btn = overlay.querySelector(".modal-install-btn");
    btn.disabled = true;
    btn.textContent = t("toolCheckInstalling");
    try {
      const response = await fetch("/api/tools/install", { method: "POST" });
      const result = await response.json();
      if (result.needsRestart) {
        const box = overlay.querySelector(".modal-box");
        box.innerHTML = `
          <div class="modal-icon modal-icon-ok">✓</div>
          <h3 class="modal-title">${t("toolCheckRestarting")}</h3>
          <p class="modal-desc">${t("toolCheckRestartWait")}</p>
        `;
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            const res = await fetch("/api/health", { signal: AbortSignal.timeout(2000) });
            if (res.ok) { overlay.remove(); $("#healthButton").click(); return; }
          } catch { /* server still restarting */ }
        }
        overlay.remove();
      } else {
        overlay.remove();
        showToolCheckModal({ missingTools: result.missingTools, installer: result.plan });
      }
    } catch {
      overlay.remove();
      showToolCheckModal({ missingTools: missing, installer: payload.installer });
    }
  });

  document.body.appendChild(overlay);
  overlay.addEventListener("keydown", (e) => { if (e.key === "Escape") overlay.remove(); });
  overlay.focus();
}

function t(key, values = {}) {
  let text = translations[state.lang][key] || key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

function applyLanguage() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : state.lang === "zht" ? "zh-TW" : "en";
  $$("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  $("#languageSelect").value = state.lang;
  renderFiles();
  renderPageIndicator();
  if (!state.currentFileId) {
    const emptyPreview = $("#emptyPreview");
    if (emptyPreview) emptyPreview.textContent = t("emptyPreview");
  }
  renderTemplateOptions();
}

let statusTimer = null;
function setStatus(message, isError = false) {
  const node = $("#statusText");
  if (!message) {
    node.classList.add("hidden");
    return;
  }
  node.textContent = message;
  node.classList.remove("hidden");
  node.classList.toggle("error", isError);
  clearTimeout(statusTimer);
  if (!isError) {
    statusTimer = setTimeout(() => node.classList.add("hidden"), 4000);
  }
}

function currentFile() {
  return state.files.find((file) => file.id === state.currentFileId);
}

function renderFiles() {
  const list = $("#fileList");
  list.innerHTML = "";
  $("#fileCount").textContent = state.files.length;
  state.files.forEach((file) => {
    const card = document.createElement("div");
    card.className = `file-card ${file.id === state.currentFileId ? "active" : ""}`;

    const enabled = document.createElement("input");
    enabled.type = "checkbox";
    enabled.checked = file.enabled !== false;
    enabled.title = t("enabled");
    enabled.addEventListener("change", () => {
      file.enabled = enabled.checked;
    });

    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span class="file-name"></span><span class="file-meta"></span>`;
    button.querySelector(".file-name").textContent = file.name;
    button.querySelector(".file-meta").textContent = t("pages", { count: file.pages });
    button.addEventListener("click", () => selectFile(file.id, 1));

    card.append(enabled, button);
    list.append(card);
  });
}

function renderPageIndicator() {
  const file = currentFile();
  $("#pageIndicator").textContent = file ? t("page", { page: state.currentPage, total: file.pages }) : "-";
}

function fileExt() {
  const fmt = (state.format || "PNG").toUpperCase();
  if (fmt === "JPG") return ".jpg";
  if (fmt === "BMP") return ".bmp";
  return ".png";
}

function renderTemplateExample() {
  const descEl = $("#templateDesc");
  const sampleEl = $("#templateSample");
  if (!descEl || !sampleEl) return;
  const preset = $("#templatePreset").value;
  const ext = fileExt();
  const pdfStem = currentFile()?.name?.replace(/\.pdf$/i, "") || "讲义";
  const label = t("templateExampleLabel");

  const descMap = {
    "{page}": "templateDescPage",
    "{global}": "templateDescGlobal",
    "{pdf_stem}_{page}": "templateDescPdfPage",
    "{pdf_stem}_{global}": "templateDescPdfGlobal",
  };

  if (preset === "custom") {
    descEl.textContent = "";
    const tpl = $("#templateInput").value.trim() || "{page}";
    const s1 = tpl.replaceAll("{page}", "1").replaceAll("{global}", "1").replaceAll("{pdf_stem}", pdfStem).replaceAll("{pdf_index}", "1");
    const s2 = tpl.replaceAll("{page}", "2").replaceAll("{global}", "2").replaceAll("{pdf_stem}", pdfStem).replaceAll("{pdf_index}", "1");
    const s3 = tpl.replaceAll("{page}", "3").replaceAll("{global}", "3").replaceAll("{pdf_stem}", pdfStem).replaceAll("{pdf_index}", "1");
    sampleEl.textContent = `${label}: ${s1}${ext}, ${s2}${ext}, ${s3}${ext}, …`;
    return;
  }

  descEl.textContent = descMap[preset] ? t(descMap[preset]) : "";
  if (preset === "{page}") {
    sampleEl.textContent = `${label}: 1${ext}, 2${ext}, 3${ext}, …`;
  } else if (preset === "{global}") {
    sampleEl.textContent = `${label}: 1${ext}, 2${ext}, 3${ext}, …`;
  } else if (preset === "{pdf_stem}_{page}") {
    sampleEl.textContent = `${label}: ${pdfStem}_1${ext}, ${pdfStem}_2${ext}, ${pdfStem}_3${ext}, …`;
  } else if (preset === "{pdf_stem}_{global}") {
    sampleEl.textContent = `${label}: ${pdfStem}_1${ext}, ${pdfStem}_2${ext}, ${pdfStem}_3${ext}, …`;
  } else {
    sampleEl.textContent = "";
  }
}

function renderTemplateOptions() {
  const preset = $("#templatePreset");
  const current = preset.value || "{page}";
  preset.innerHTML = "";
  templatePresets.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = t(item.key);
    preset.append(option);
  });
  preset.value = templatePresets.some((item) => item.value === current) ? current : "custom";
  syncTemplateControls();
}

function selectedTemplate() {
  const preset = $("#templatePreset").value;
  if (preset === "custom") return $("#templateInput").value.trim() || "{page}";
  return preset;
}

function syncTemplateControls() {
  const custom = $("#templatePreset").value === "custom";
  $("#customTemplateRow").classList.toggle("hidden", !custom);
  if (!custom) {
    $("#templateInput").value = $("#templatePreset").value;
  }
  renderTemplateExample();
}

function syncFormatControls() {
  $("#jpgOptions").classList.toggle("hidden", state.format !== "JPG");
  $("#bmpOptions").classList.toggle("hidden", state.format !== "BMP");
}

async function uploadFiles(files) {
  const pdfs = [...files].filter((file) => file.name.toLowerCase().endsWith(".pdf"));
  if (!pdfs.length) {
    setStatus(t("noPdf"), true);
    return;
  }
  setStatus(t("uploading"));
  const form = new FormData();
  pdfs.forEach((file) => form.append("files", file));
  const uploadUrl = state.sessionId ? `/api/upload?session=${encodeURIComponent(state.sessionId)}` : "/api/upload";
  const response = await fetch(uploadUrl, { method: "POST", body: form });
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(payload.error || t("uploadFailed"));
  }
  state.sessionId = payload.sessionId;
  const incomingFiles = payload.files.map((file) => ({ ...file, enabled: true, pagesText: "" }));
  state.files = [...state.files, ...incomingFiles];
  if (!state.currentFileId && incomingFiles.length) {
    state.currentFileId = incomingFiles[0].id;
    state.currentPage = 1;
  }
  renderFiles();
  renderThumbnails();
  renderPreviewPages();
  setStatus(t("uploaded", { count: state.files.length }));
  $("#fileInput").value = "";
}

function previewUrl(fileId, page, kind = "preview") {
  const params = new URLSearchParams({
    session: state.sessionId,
    file: fileId,
    page: String(page),
    kind,
  });
  return `/api/preview?${params.toString()}`;
}

function loadImage(img, url, onTimeout) {
  if (!url) return;
  img.src = url;
  const timer = window.setTimeout(() => {
    if (!img.complete) {
      onTimeout?.();
    }
  }, 60000);
  img.addEventListener(
    "load",
    () => {
      window.clearTimeout(timer);
    },
    { once: true },
  );
  img.addEventListener(
    "error",
    () => {
      window.clearTimeout(timer);
    },
    { once: true },
  );
}

function selectFile(fileId, page = 1) {
  state.currentFileId = fileId;
  state.currentPage = page;
  const file = currentFile();
  $("#pageRangeInput").value = file?.pagesText || "";
  renderFiles();
  renderThumbnails();
  renderPreviewPages();
  renderTemplateExample();
}

function renderThumbnails() {
  const rail = $("#thumbnailRail");
  rail.innerHTML = "";
  const file = currentFile();
  if (!file) return;
  const sidebarHeader = document.createElement("div");
  sidebarHeader.className = "thumbnail-header";
  sidebarHeader.textContent = t("thumbnailSummary", { count: file.pages });
  rail.append(sidebarHeader);

  // --- Thumbnail preload queue ---
  const THUMB_CONCURRENT = 6;
  let thumbActive = 0;
  const thumbQueue = [];

  function drainThumbQueue() {
    while (thumbActive < THUMB_CONCURRENT && thumbQueue.length) {
      const { button, resolve } = thumbQueue.shift();
      thumbActive++;
      const img = button.querySelector("img");
      const url = previewUrl(file.id, Number(button.dataset.page), "thumb");
      img.src = url;
      img.onload = () => {
        button.classList.add("loaded");
        thumbActive--;
        drainThumbQueue();
        resolve();
      };
      img.onerror = () => {
        button.classList.add("thumb-error");
        thumbActive--;
        drainThumbQueue();
        resolve();
      };
      setTimeout(() => {
        if (!button.classList.contains("loaded") && !button.classList.contains("thumb-error")) {
          button.classList.add("thumb-error");
          thumbActive--;
          drainThumbQueue();
          resolve();
        }
      }, 30000);
    }
  }

  function enqueueThumb(button) {
    return new Promise((resolve) => {
      thumbQueue.push({ button, resolve });
      drainThumbQueue();
    });
  }

  // --- IntersectionObserver for thumbnails ---
  const thumbObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          thumbObserver.unobserve(entry.target);
          enqueueThumb(entry.target);
        }
      });
    },
    { root: rail, rootMargin: "300px 0px" },
  );

  for (let page = 1; page <= file.pages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.page = String(page);
    button.className = `thumb ${page === state.currentPage ? "active" : ""}`;
    button.innerHTML = `<div class="thumb-image"><img alt=""><span class="thumb-fallback"></span></div><span class="thumb-label"></span>`;
    const img = button.querySelector("img");
    img.alt = `Page ${page}`;
    button.querySelector(".thumb-fallback").textContent = page;
    button.querySelector(".thumb-label").textContent = page;
    button.addEventListener("click", () => {
      goToPage(page);
    });
    rail.append(button);
    thumbObserver.observe(button);
  }
  requestAnimationFrame(() => {
    rail.querySelector(".thumb.active")?.scrollIntoView({ block: "nearest" });
  });
}

function updateActiveThumb() {
  $$(".thumb").forEach((thumb) => {
    thumb.classList.toggle("active", Number(thumb.dataset.page) === state.currentPage);
  });
  $("#thumbnailRail .thumb.active")?.scrollIntoView({ block: "nearest" });
}

function goToPage(page, shouldScroll = true) {
  const file = currentFile();
  if (!file) return;
  state.currentPage = Math.max(1, Math.min(file.pages, page));
  renderPageIndicator();
  updateActiveThumb();
  if (shouldScroll) {
    document.querySelector(`.preview-page[data-page="${state.currentPage}"]`)?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }
}

function renderPreviewPages() {
  const canvas = $(".preview-canvas");
  canvas.innerHTML = "";
  const file = currentFile();
  renderPageIndicator();
  if (!file) {
    const empty = document.createElement("p");
    empty.id = "emptyPreview";
    empty.innerHTML = `<span class="empty-icon">${uiIcon("page", 48)}</span>${t("emptyPreview")}`;
    canvas.append(empty);
    return;
  }

  // --- Preload queue with concurrency control ---
  const MAX_CONCURRENT = 8;
  const PRELOAD_BUFFER = 20;
  let activeLoads = 0;
  const pendingQueue = [];

  function drainQueue() {
    while (activeLoads < MAX_CONCURRENT && pendingQueue.length) {
      const { pageNode, resolve } = pendingQueue.shift();
      activeLoads++;
      const img = pageNode.querySelector("img");
      const message = pageNode.querySelector("p");
      const url = previewUrl(file.id, Number(pageNode.dataset.page), "preview");
      img.src = url;
      img.onload = () => {
        pageNode.classList.add("loaded");
        message.style.display = "none";
        activeLoads--;
        drainQueue();
        resolve();
      };
      img.onerror = () => {
        pageNode.classList.add("preview-error");
        message.textContent = t("previewFailed");
        activeLoads--;
        drainQueue();
        resolve();
      };
      // 60s timeout — lazy loading prevents queue pileup so we can be generous
      setTimeout(() => {
        if (!pageNode.classList.contains("loaded") && !pageNode.classList.contains("preview-error")) {
          pageNode.classList.add("preview-error");
          message.textContent = t("previewFailed");
          activeLoads--;
          drainQueue();
          resolve();
        }
      }, 60000);
    }
  }

  function enqueuePreview(pageNode) {
    return new Promise((resolve) => {
      pendingQueue.push({ pageNode, resolve });
      drainQueue();
    });
  }

  // --- IntersectionObserver for lazy loading ---
  const pendingObserver = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pendingObserver.add(entry.target);
        }
      });
      // Sort by page number so visible pages load first
      const sorted = [...pendingObserver].sort(
        (a, b) => Number(a.dataset.page) - Number(b.dataset.page),
      );
      pendingObserver.clear();
      sorted.forEach((node) => enqueuePreview(node));
      scheduleBatchPreload();
    },
    { root: canvas, rootMargin: "600px 0px" },
  );

  // --- Batch preload via /api/preview/batch ---
  let batchTimer = null;
  function scheduleBatchPreload() {
    clearTimeout(batchTimer);
    batchTimer = setTimeout(() => {
      const visible = [...canvas.querySelectorAll(".preview-page")]
        .filter((n) => n.classList.contains("loaded"))
        .map((n) => Number(n.dataset.page));
      if (!visible.length) return;
      const maxLoaded = Math.max(...visible);
      const batchStart = maxLoaded + 1;
      const batchEnd = Math.min(file.pages, maxLoaded + PRELOAD_BUFFER);
      if (batchStart > batchEnd) return;
      fetch(
        `/api/preview/batch?${new URLSearchParams({
          session: state.sessionId,
          file: file.id,
          start: String(batchStart),
          end: String(batchEnd),
          kind: "preview",
        }).toString()}`,
      ).catch(() => {});
    }, 300);
  }

  // --- Create DOM sections and observe them ---
  for (let page = 1; page <= file.pages; page += 1) {
    const pageNode = document.createElement("section");
    pageNode.className = "preview-page";
    pageNode.dataset.page = String(page);
    pageNode.innerHTML = `
      <div class="preview-page-meta">${page}</div>
      <div class="preview-page-sheet">
        <img alt="Page ${page}">
        <p>${t("loadingPreview")}</p>
      </div>
    `;
    canvas.append(pageNode);
    observer.observe(pageNode);
  }

  canvas.onscroll = () => {
    clearTimeout(state.previewScrollTimer);
    state.previewScrollTimer = setTimeout(() => {
      syncCurrentPageFromScroll();
    }, 40);
  };

  requestAnimationFrame(() => {
    goToPage(state.currentPage, false);
    syncCurrentPageFromScroll();
  });
}

function syncCurrentPageFromScroll() {
  const canvas = $(".preview-canvas");
  const root = canvas.getBoundingClientRect();
  let bestPage = state.currentPage;
  let bestDistance = Number.POSITIVE_INFINITY;
  $$(".preview-page").forEach((pageNode) => {
    const rect = pageNode.getBoundingClientRect();
    const distance = Math.abs(rect.top - root.top - 24);
    if (rect.bottom > root.top && rect.top < root.bottom && distance < bestDistance) {
      bestDistance = distance;
      bestPage = Number(pageNode.dataset.page);
    }
  });
  if (bestPage && bestPage !== state.currentPage) {
    state.currentPage = bestPage;
    renderPageIndicator();
    updateActiveThumb();
  }
}

function collectExportPayload() {
  const activeFile = currentFile();
  if (activeFile) activeFile.pagesText = $("#pageRangeInput").value.trim();
  return {
    sessionId: state.sessionId,
    files: state.files.map((file) => ({
      id: file.id,
      enabled: file.enabled !== false,
      pages: file.pagesText || "",
    })),
    format: state.format,
    dpi: Number($("#dpiInput").value || 300),
    jpegQuality: Number($("#qualityInput").value || 90),
    bmpDepth: $("#bmpDepth").value,
    filenameTemplate: selectedTemplate(),
    exportMode: document.querySelector("input[name='exportMode']:checked").value,
  };
}

async function exportZip() {
  if (!state.sessionId || !state.files.length) {
    setStatus(t("noPdf"), true);
    return;
  }
  setStatus(t("exporting"));
  $("#exportButton").disabled = true;
  setExportProgress(0, 1, "");
  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectExportPayload()),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || t("exportFailed"));
    }
    const payload = await response.json();
    await pollExportJob(payload.jobId);
  } catch (error) {
    setStatus(`${t("exportFailed")}: ${error.message}`, true);
    hideExportProgress();
    $("#exportButton").disabled = false;
  }
}

function setExportProgress(done, total, label) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  $("#exportProgress").classList.remove("hidden");
  $("#exportProgressBar").style.width = `${Math.max(0, Math.min(100, percent))}%`;
  $("#exportProgressMeta").textContent = `${t("progress", { done, total })}${label ? ` · ${label}` : ""}`;
}

function hideExportProgress() {
  $("#exportProgress").classList.add("hidden");
}

async function pollExportJob(jobId) {
  while (true) {
    const response = await fetch(`/api/export/status?job=${encodeURIComponent(jobId)}`);
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error || t("exportFailed"));
    }
    setExportProgress(payload.done || 0, payload.total || 1, payload.status === "zipping" ? t("zipping") : payload.label || "");
    if (payload.status === "done") {
      await downloadExport(jobId, payload);
      return;
    }
    if (payload.status === "error") {
      throw new Error(payload.errors?.[0] || t("exportFailed"));
    }
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  }
}

async function downloadExport(jobId, statusPayload) {
  const response = await fetch(`/api/export/download?job=${encodeURIComponent(jobId)}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || t("exportFailed"));
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "PDFImageConverter.zip";
  link.click();
  URL.revokeObjectURL(url);
  setStatus(
    t("exportDone", {
      success: statusPayload.success ?? "?",
      failed: statusPayload.failed ?? "0",
    }),
  );
  $("#exportButton").disabled = false;
  window.setTimeout(hideExportProgress, 1800);
}

function wireEvents() {
  $("#languageSelect").addEventListener("change", (event) => {
    state.lang = event.target.value;
    localStorage.setItem("pdfImageLanguage", state.lang);
    applyLanguage();
  });

  $("#fileInput").addEventListener("change", (event) => uploadFiles(event.target.files).catch((error) => setStatus(`${t("uploadFailed")}: ${error.message}`, true)));

  const dropZone = $("#dropZone");
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragging");
    });
  });
  dropZone.addEventListener("drop", (event) => uploadFiles(event.dataTransfer.files).catch((error) => setStatus(`${t("uploadFailed")}: ${error.message}`, true)));

  $("#prevPage").addEventListener("click", () => {
    const file = currentFile();
    if (!file) return;
    goToPage(state.currentPage - 1);
  });

  $("#nextPage").addEventListener("click", () => {
    const file = currentFile();
    if (!file) return;
    goToPage(state.currentPage + 1);
  });

  $("#pageRangeInput").addEventListener("input", (event) => {
    const file = currentFile();
    if (file) file.pagesText = event.target.value;
  });

  $$("#formatGroup button").forEach((button) => {
    button.addEventListener("click", () => {
      state.format = button.dataset.format;
      $$("#formatGroup button").forEach((node) => node.classList.toggle("active", node === button));
      syncFormatControls();
      renderTemplateExample();
    });
  });

  $("#templatePreset").addEventListener("change", syncTemplateControls);
  $("#templateInput").addEventListener("input", renderTemplateExample);
  $$(".token-row button").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $("#templateInput");
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = `${input.value.slice(0, start)}${button.dataset.token}${input.value.slice(end)}`;
      input.focus();
      input.selectionStart = input.selectionEnd = start + button.dataset.token.length;
      renderTemplateExample();
    });
  });

  $("#qualityInput").addEventListener("input", (event) => {
    $("#qualityValue").textContent = event.target.value;
  });

  $("#healthButton").addEventListener("click", async () => {
    try {
      const response = await fetch("/api/health");
      const payload = await response.json();
      showToolCheckModal(payload);
    } catch (error) {
      setStatus(`${t("toolCheckTitle")}: ${error.message}`, true);
    }
  });

  $("#exportButton").addEventListener("click", exportZip);
}

wireEvents();
renderTemplateOptions();
syncFormatControls();
applyLanguage();
