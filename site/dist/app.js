const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
const PDF_CMAP_URL = new URL('./cmaps/', document.baseURI).href;
const PDF_STANDARD_FONT_URL = new URL('./standard_fonts/', document.baseURI).href;
const state = { lang: localStorage.getItem('pdfImageLanguage') || 'zh', files: [], currentFileId: '', currentPage: 1, format: 'PNG' };
let pdfjs; let statusTimer;
let nextFileId = 1;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const translations = {
  zh: { eyebrow:'本地 Web 工具', title:'PDF 图片转换工具', checkTools:'检查工具', input:'输入文件', dropTitle:'选择或拖入 PDF', preview:'预览', emptyPreview:'上传 PDF 后在这里预览页面', settings:'导出设置', format:'格式', quality:'图片质量', jpgOptions:'图片质量', bmpDepth:'位深', pageRange:'页码范围', template:'命名方式', mode:'导出模式', separate:'按 PDF 分组', merge:'合并为连续序列', export:'导出 ZIP', ready:'准备就绪', uploading:'正在读取 PDF...', uploaded:'已载入 {count} 个 PDF', noPdf:'请先选择 PDF 文件', exporting:'正在导出，请稍候...', exportDone:'导出完成：成功 {success} 页，失败 {failed} 页', dpiAdjusted:'页面过大，已将 DPI 调整为 {dpi} 以保证文件可生成', renderFailed:'页面过大，无法生成图片，请降低 DPI 或缩小页码范围', uploadFailed:'读取失败', exportFailed:'导出失败', page:'第 {page} / {total} 页', pages:'{count} 页', templatePage:'页码', templateGlobal:'连续编号', templatePdfPage:'文件名 + 页码', templatePdfGlobal:'文件名 + 连续编号', templateCustom:'自定义', templateDescPage:'每个 PDF 独立从 1 开始', templateDescGlobal:'多个 PDF 统一连续编号', templateDescPdfPage:'文件名_页码，每组独立', templateDescPdfGlobal:'文件名_连续编号，多组连排', templateExampleLabel:'示例', tokenPage:'页码', tokenGlobal:'连续编号', tokenPdfStem:'PDF 文件名', tokenPdfIndex:'PDF 顺序', loadingPreview:'正在生成页面...', previewFailed:'预览生成失败', thumbnailSummary:'{count} 页', copyright:'©2026 那，边。版权所有。', toolCheckOk:'浏览器工具正常', toolCheckOkDesc:'PDF.js 和 ZIP 导出已就绪。' },
  zht: { eyebrow:'本地 Web 工具', title:'PDF 圖片轉換工具', checkTools:'檢查工具', input:'輸入檔案', dropTitle:'選擇或拖入 PDF', preview:'預覽', emptyPreview:'上傳 PDF 後在這裡預覽頁面', settings:'匯出設定', format:'格式', quality:'圖片品質', jpgOptions:'圖片品質', bmpDepth:'位元深度', pageRange:'頁碼範圍', template:'命名方式', mode:'匯出模式', separate:'按 PDF 分組', merge:'合併為連續序列', export:'匯出 ZIP', ready:'準備就緒', uploading:'正在讀取 PDF...', uploaded:'已載入 {count} 個 PDF', noPdf:'請先選擇 PDF 檔案', exporting:'正在匯出，請稍候...', exportDone:'匯出完成：成功 {success} 頁，失敗 {failed} 頁', dpiAdjusted:'頁面過大，已將 DPI 調整為 {dpi} 以確保檔案可生成', renderFailed:'頁面過大，無法生成圖片，請降低 DPI 或縮小頁碼範圍', uploadFailed:'讀取失敗', exportFailed:'匯出失敗', page:'第 {page} / {total} 頁', pages:'{count} 頁', templatePage:'頁碼', templateGlobal:'連續編號', templatePdfPage:'檔名 + 頁碼', templatePdfGlobal:'檔名 + 連續編號', templateCustom:'自訂', templateDescPage:'每個 PDF 獨立從 1 開始', templateDescGlobal:'多個 PDF 統一連續編號', templateDescPdfPage:'檔名_頁碼，每組獨立', templateDescPdfGlobal:'檔名_連續編號，多組連排', templateExampleLabel:'範例', tokenPage:'頁碼', tokenGlobal:'連續編號', tokenPdfStem:'PDF 檔名', tokenPdfIndex:'PDF 順序', loadingPreview:'正在生成頁面...', previewFailed:'預覽生成失敗', thumbnailSummary:'{count} 頁', copyright:'©2026 那，邊。版權所有。', toolCheckOk:'瀏覽器工具正常', toolCheckOkDesc:'PDF.js 和 ZIP 匯出已就緒。' },
  en: { eyebrow:'Local Web Tool', title:'PDF Image Converter', checkTools:'Check tools', input:'Input Files', dropTitle:'Choose or drop PDFs', preview:'Preview', emptyPreview:'Upload PDFs to preview pages here', settings:'Export Settings', format:'Format', quality:'Image quality', jpgOptions:'Image quality', bmpDepth:'Bit depth', pageRange:'Page range', template:'Naming', mode:'Export mode', separate:'Separate by PDF', merge:'Merge into sequence', export:'Export ZIP', ready:'Ready', uploading:'Reading PDFs...', uploaded:'Loaded {count} PDFs', noPdf:'Please choose a PDF first', exporting:'Exporting...', exportDone:'Export complete: {success} pages succeeded, {failed} failed', dpiAdjusted:'The page is large; DPI was adjusted to {dpi} so the file can be generated', renderFailed:'The page is too large to render. Lower the DPI or narrow the page range.', uploadFailed:'Read failed', exportFailed:'Export failed', page:'Page {page} / {total}', pages:'{count} pages', templatePage:'Page number', templateGlobal:'Continuous number', templatePdfPage:'Filename + page', templatePdfGlobal:'Filename + continuous number', templateCustom:'Custom', templateDescPage:'Each PDF starts at 1', templateDescGlobal:'One sequence across PDFs', templateDescPdfPage:'Filename_page, per PDF', templateDescPdfGlobal:'Filename_continuous, all PDFs', templateExampleLabel:'Example', tokenPage:'Page', tokenGlobal:'Global', tokenPdfStem:'PDF name', tokenPdfIndex:'PDF order', loadingPreview:'Rendering page...', previewFailed:'Preview failed', thumbnailSummary:'{count} pages', copyright:'©2026 Na, Bian. All rights reserved.', toolCheckOk:'Browser tools ready', toolCheckOkDesc:'PDF.js and ZIP export are ready.' },
};
const presets = [
  { key:'templatePage', value:'{page}', desc:'templateDescPage' }, { key:'templateGlobal', value:'{global}', desc:'templateDescGlobal' },
  { key:'templatePdfPage', value:'{pdf_stem}_{page}', desc:'templateDescPdfPage' }, { key:'templatePdfGlobal', value:'{pdf_stem}_{global}', desc:'templateDescPdfGlobal' }, { key:'templateCustom', value:'custom', desc:null },
];
const t = (key, vars = {}) => Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), (translations[state.lang] || translations.zh)[key] || key);
const MAX_EXPORT_PIXELS = 32_000_000;
const MAX_EXPORT_SIDE = 16_384;
function setStatus(message = '', error = false) { const node = $('#statusText'); node.textContent = message; node.classList.toggle('hidden', !message); node.classList.toggle('error', error); clearTimeout(statusTimer); if (message && !error) statusTimer = setTimeout(() => node.classList.add('hidden'), 4500); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function currentFile() { return state.files.find((file) => file.id === state.currentFileId); }
async function ensurePdfJs() { if (!pdfjs) { pdfjs = await import(PDFJS_URL); pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL; } return pdfjs; }
function applyLanguage() {
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : state.lang === 'zht' ? 'zh-TW' : 'en';
  $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  renderTemplateOptions();
  renderFileList();
  renderPageIndicator();
  const file = currentFile();
  if (!file) { renderEmpty(); return; }
  const header = $('#thumbnailRail .thumbnail-header');
  if (header) header.textContent = t('thumbnailSummary', {count:file.pages});
  $$('.preview-page-sheet p').forEach((node) => {
    node.textContent = t(node.closest('.preview-error') ? 'previewFailed' : 'loadingPreview');
  });
}
function renderTemplateOptions() { const select = $('#templatePreset'); const previous = select.value; select.innerHTML = presets.map((preset) => `<option value="${preset.value}">${t(preset.key)}</option>`).join(''); select.value = presets.some((preset) => preset.value === previous) ? previous : '{page}'; syncTemplateControls(); }
function selectedTemplate() { const preset = $('#templatePreset').value; return preset === 'custom' ? $('#templateInput').value || '{page}' : preset; }
function renderTemplateExample() { const file = currentFile(); const template = selectedTemplate(); $('#templateDesc').textContent = template === 'custom' ? '' : t(presets.find((preset) => preset.value === template)?.desc || 'templateDescPage'); const sample = template.replaceAll('{page}', '001').replaceAll('{global}', '007').replaceAll('{pdf_stem}', file ? file.file.name.replace(/\.pdf$/i, '') : 'document').replaceAll('{pdf_index}', '1'); $('#templateSample').textContent = `${t('templateExampleLabel')}: ${sample}.${state.format.toLowerCase()}`; }
function syncTemplateControls() { const custom = $('#templatePreset').value === 'custom'; $('#customTemplateRow').classList.toggle('hidden', !custom); $('#templateExample').classList.toggle('hidden', custom); renderTemplateExample(); }
function syncFormatControls() { $('#jpgOptions').classList.toggle('hidden', state.format !== 'JPG'); $('#bmpOptions').classList.toggle('hidden', state.format !== 'BMP'); renderTemplateExample(); }
function renderFileList() { const list = $('#fileList'); $('#fileCount').textContent = state.files.length; list.innerHTML = ''; state.files.forEach((file) => { const card = document.createElement('div'); card.className = `file-card ${file.id === state.currentFileId ? 'active' : ''}`; const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = file.enabled !== false; enabled.title = '启用'; enabled.addEventListener('change', () => { file.enabled = enabled.checked; }); const button = document.createElement('button'); button.type = 'button'; button.innerHTML = '<span class="file-name"></span><span class="file-meta"></span>'; button.querySelector('.file-name').textContent = file.file.name; button.querySelector('.file-meta').textContent = t('pages', {count:file.pages}); button.addEventListener('click', () => selectFile(file.id)); card.append(enabled, button); list.append(card); }); }
function formatBytes(bytes) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function selectFile(id) { state.currentFileId = id; state.currentPage = 1; const file = currentFile(); renderFileList(); if (file) { $('#pageRangeInput').value = file.pagesText || ''; renderThumbnails(file); renderPreviewPages(file); } }
function renderEmpty() { $('.preview-grid').classList.add('empty-state'); $('#thumbnailRail').innerHTML = ''; $('.preview-canvas').innerHTML = `<p id="emptyPreview"><span class="empty-icon">${pageIcon()}</span>${t('emptyPreview')}</p>`; $('#pageIndicator').textContent = '-'; $('#exportButton').disabled = true; }
function pageIcon() { return '<svg class="ui-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5"/><path d="M9 12h6M9 16h6"/></svg>'; }
function renderPageIndicator() { const file = currentFile(); $('#pageIndicator').textContent = file ? t('page', {page:state.currentPage, total:file.pages}) : '-'; $('#prevPage').disabled = !file || state.currentPage <= 1; $('#nextPage').disabled = !file || state.currentPage >= file.pages; }
function goToPage(page, scroll = true) { const file = currentFile(); if (!file) return; state.currentPage = Math.max(1, Math.min(file.pages, page)); renderPageIndicator(); updateActiveThumb(); if (scroll) document.querySelector(`.preview-page[data-page="${state.currentPage}"]`)?.scrollIntoView({block:'start', behavior:'smooth'}); }
function updateActiveThumb() { $$('.thumb').forEach((thumb) => thumb.classList.toggle('active', Number(thumb.dataset.page) === state.currentPage)); }
async function renderPdfToCanvas(file, pageNumber, canvas, scale = 1) { const page = await file.pdf.getPage(pageNumber); const viewport = page.getViewport({scale}); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); await page.render({canvasContext:canvas.getContext('2d', {alpha:false}), viewport, background:'#fff'}).promise; return canvas; }
function renderThumbnails(file) { const rail = $('#thumbnailRail'); rail.innerHTML = `<div class="thumbnail-header">${t('thumbnailSummary', {count:file.pages})}</div>`; const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { observer.unobserve(entry.target); renderThumb(file, Number(entry.target.dataset.page), entry.target); } }), {root:rail, rootMargin:'240px'}); for (let page = 1; page <= file.pages; page += 1) { const button = document.createElement('button'); button.type='button'; button.dataset.page=page; button.className=`thumb ${page===state.currentPage?'active':''}`; button.innerHTML=`<div class="thumb-image"><canvas></canvas><span class="thumb-fallback">${page}</span></div><span class="thumb-label">${page}</span>`; button.addEventListener('click', () => goToPage(page)); rail.append(button); observer.observe(button); } }
async function renderThumb(file, pageNumber, button) { try { await renderPdfToCanvas(file, pageNumber, button.querySelector('canvas'), .16); button.classList.add('loaded'); } catch { button.classList.add('thumb-error'); } }
function renderPreviewPages(file) { $('.preview-grid').classList.remove('empty-state'); const root = $('.preview-canvas'); root.innerHTML=''; renderPageIndicator(); $('#exportButton').disabled = false; const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { observer.unobserve(entry.target); renderPreviewPage(file, Number(entry.target.dataset.page), entry.target); } }), {root, rootMargin:'700px'}); for (let page=1; page<=file.pages; page+=1) { const node=document.createElement('section'); node.className='preview-page'; node.dataset.page=page; node.innerHTML=`<div class="preview-page-meta">${page}</div><div class="preview-page-sheet"><canvas></canvas><p>${t('loadingPreview')}</p></div>`; const sheet=node.querySelector('.preview-page-sheet'); sheet.style.aspectRatio=file.pageRatios[page-1]; sheet.style.minHeight='0'; root.append(node); observer.observe(node); } root.onscroll = () => { let best=state.currentPage; let distance=Infinity; root.querySelectorAll('.preview-page').forEach((node) => { const rect=node.getBoundingClientRect(); const rootRect=root.getBoundingClientRect(); const d=Math.abs(rect.top-rootRect.top-24); if (rect.bottom>rootRect.top && rect.top<rootRect.bottom && d<distance) { distance=d; best=Number(node.dataset.page); } }); if (best !== state.currentPage) goToPage(best, false); }; requestAnimationFrame(() => goToPage(state.currentPage, false)); }
async function renderPreviewPage(file, pageNumber, node) { try { const available = Math.max(260, $('.preview-canvas').clientWidth - 70); const page = await file.pdf.getPage(pageNumber); const base = page.getViewport({scale:1}); const scale = Math.min(1.6, available / base.width); const canvas = node.querySelector('canvas'); const viewport = page.getViewport({scale}); canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height); await page.render({canvasContext:canvas.getContext('2d', {alpha:false}), viewport, background:'#fff'}).promise; node.classList.add('loaded'); node.querySelector('p').remove(); } catch { node.classList.add('preview-error'); node.querySelector('p').textContent=t('previewFailed'); } }
function parseRange(value, max) { if (!value.trim()) return Array.from({length:max}, (_,i)=>i+1); const pages=new Set(); for (const part of value.split(',')) { const clean=part.trim(); if (/^\d+$/.test(clean)) pages.add(Number(clean)); else if (/^\d+\s*-\s*\d+$/.test(clean)) { const [a,b]=clean.split('-').map((n)=>Number(n.trim())); for (let i=Math.min(a,b); i<=Math.max(a,b); i++) pages.add(i); } else throw new Error(`无法识别页码：${clean}`); } const result=[...pages].filter((page)=>page>=1&&page<=max).sort((a,b)=>a-b); if (!result.length) throw new Error(`页码必须在 1-${max} 之间`); return result; }
function padded(number) { return String(number).padStart(3, '0'); }
function outputName(file, page, globalIndex) { const stem=file.file.name.replace(/\.pdf$/i,'').replace(/[^\w\-\u4e00-\u9fff]+/g,'_'); return selectedTemplate().replaceAll('{page}',padded(page)).replaceAll('{global}',padded(globalIndex)).replaceAll('{pdf_stem}',stem).replaceAll('{pdf_index}',String(state.files.indexOf(file)+1))+`.${state.format.toLowerCase()}`; }
function canvasToBmp(canvas) { const width=canvas.width,height=canvas.height,rowSize=Math.floor((24*width+31)/32)*4,pixelSize=rowSize*height,buffer=new ArrayBuffer(54+pixelSize),view=new DataView(buffer),data=canvas.getContext('2d').getImageData(0,0,width,height).data; view.setUint16(0,0x4d42,true); view.setUint32(2,54+pixelSize,true); view.setUint32(10,54,true); view.setUint32(14,40,true); view.setInt32(18,width,true); view.setInt32(22,-height,true); view.setUint16(26,1,true); view.setUint16(28,24,true); view.setUint32(34,pixelSize,true); const out=new Uint8Array(buffer,54); for(let y=0;y<height;y++)for(let x=0;x<width;x++){const s=(y*width+x)*4,d=y*rowSize+x*3;out[d]=data[s+2];out[d+1]=data[s+1];out[d+2]=data[s];} return buffer; }
function canvasBlob(canvas) {
  if (state.format === 'BMP') {
    try { return Promise.resolve(new Blob([canvasToBmp(canvas)], { type: 'image/bmp' })); }
    catch { return Promise.resolve(null); }
  }
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob && blob.size > 0 ? blob : null), state.format === 'JPG' ? 'image/jpeg' : 'image/png', Number($('#qualityInput').value) / 100);
    } catch { resolve(null); }
  });
}

async function renderExportImage(page, dpi) {
  const baseViewport = page.getViewport({ scale: 1 });
  const requestedScale = dpi / 72;
  let scale = Math.min(requestedScale, MAX_EXPORT_SIDE / baseViewport.width, MAX_EXPORT_SIDE / baseViewport.height, Math.sqrt(MAX_EXPORT_PIXELS / (baseViewport.width * baseViewport.height)));
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const canvas = document.createElement('canvas');
    try {
      const viewport = page.getViewport({ scale });
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      if (canvas.width < 1 || canvas.height < 1 || canvas.width * canvas.height > MAX_EXPORT_PIXELS) throw new Error(t('renderFailed'));
      await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, background: '#fff' }).promise;
      const blob = await canvasBlob(canvas);
      if (blob && blob.size > 0) return { blob, effectiveDpi: scale * 72 };
      lastError = new Error(t('renderFailed'));
    } catch (error) { lastError = error; }
    finally { canvas.width = 0; canvas.height = 0; }
    scale *= 0.75;
  }
  throw lastError || new Error(t('renderFailed'));
}

async function exportZip() {
  const Zip = window.JSZip;
  if (!Zip || !state.files.length) return setStatus(t('noPdf'), true);
  let entries;
  try { entries = state.files.filter((file) => file.enabled !== false).map((file) => ({ file, pages: parseRange(file.pagesText || '', file.pages) })); }
  catch (error) { return setStatus(error.message, true); }
  if (!entries.length) return setStatus(t('noPdf'), true);
  const dpi = Math.max(36, Math.min(600, Number($('#dpiInput').value) || 300));
  const total = entries.reduce((sum, entry) => sum + entry.pages.length, 0);
  const zip = new Zip(); let done = 0; let globalIndex = 1; let effectiveDpi = dpi;
  $('#exportButton').disabled = true; $('#exportProgress').classList.remove('hidden'); setStatus(t('exporting'));
  try {
    for (const entry of entries) {
      const folder = document.querySelector('input[name="exportMode"]:checked').value === 'separate' ? zip.folder(entry.file.file.name.replace(/\.pdf$/i, '')) : zip;
      for (const pageNumber of entry.pages) {
        const page = await entry.file.pdf.getPage(pageNumber);
        const rendered = await renderExportImage(page, dpi);
        effectiveDpi = Math.min(effectiveDpi, rendered.effectiveDpi);
        folder.file(outputName(entry.file, pageNumber, globalIndex), rendered.blob);
        done += 1; globalIndex += 1; setExportProgress(done, total, '');
      }
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'PDFImageConverter.zip'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    const adjusted = effectiveDpi < dpi - 0.5 ? ` · ${t('dpiAdjusted', { dpi: Math.max(1, Math.floor(effectiveDpi)) })}` : '';
    setStatus(`${t('exportDone', { success: done, failed: 0 })}${adjusted}`); setTimeout(() => $('#exportProgress').classList.add('hidden'), 1800);
  } catch (error) { console.error(error); setStatus(`${t('exportFailed')}: ${error.message}`, true); }
  finally { $('#exportButton').disabled = false; }
}

function setExportProgress(done,total,label) { $('#exportProgressBar').style.width=`${Math.round(done/Math.max(1,total)*100)}%`; $('#exportProgressMeta').textContent=`${done} / ${total} 页${label?` · ${label}`:''}`; }
async function addFiles(fileList) { const files=[...fileList].filter((file)=>file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')); if(!files.length)return setStatus(t('noPdf'),true); setStatus(t('uploading')); const api=await ensurePdfJs(); for(const file of files){ if(state.files.some((item)=>item.file.name===file.name&&item.file.size===file.size))continue; const pdf=await api.getDocument({data:new Uint8Array(await file.arrayBuffer()),cMapUrl:PDF_CMAP_URL,cMapPacked:true,standardFontDataUrl:PDF_STANDARD_FONT_URL,useSystemFonts:true}).promise; const pageRatios=await Promise.all(Array.from({length:pdf.numPages},async(_,index)=>{const page=await pdf.getPage(index+1);const viewport=page.getViewport({scale:1});return `${viewport.width} / ${viewport.height}`;})); state.files.push({id:nextFileId++,file,pdf,pages:pdf.numPages,pageRatios,pagesText:''}); } if(!state.currentFileId)state.currentFileId=state.files[0].id; renderFileList(); selectFile(state.currentFileId); setStatus(t('uploaded',{count:state.files.length})); }
function wireEvents() { $('#languageSelect').value=state.lang; $('#languageSelect').addEventListener('change',(event)=>{state.lang=event.target.value;localStorage.setItem('pdfImageLanguage',state.lang);applyLanguage();}); $('#fileInput').addEventListener('change',(event)=>addFiles(event.target.files).catch((error)=>setStatus(`${t('uploadFailed')}: ${error.message}`,true))); const drop=$('#dropZone'); ['dragenter','dragover'].forEach((name)=>drop.addEventListener(name,(event)=>{event.preventDefault();drop.classList.add('dragging');})); ['dragleave','drop'].forEach((name)=>drop.addEventListener(name,(event)=>{event.preventDefault();drop.classList.remove('dragging');})); drop.addEventListener('drop',(event)=>addFiles(event.dataTransfer.files).catch((error)=>setStatus(`${t('uploadFailed')}: ${error.message}`,true))); $('#prevPage').addEventListener('click',()=>goToPage(state.currentPage-1)); $('#nextPage').addEventListener('click',()=>goToPage(state.currentPage+1)); $('#pageRangeInput').addEventListener('input',(event)=>{const file=currentFile();if(file)file.pagesText=event.target.value;}); $$('#formatGroup button').forEach((button)=>button.addEventListener('click',()=>{state.format=button.dataset.format;$$('#formatGroup button').forEach((node)=>node.classList.toggle('active',node===button));syncFormatControls();})); $('#templatePreset').addEventListener('change',syncTemplateControls); $('#templateInput').addEventListener('input',renderTemplateExample); $$('.token-row button').forEach((button)=>button.addEventListener('click',()=>{const input=$('#templateInput'),start=input.selectionStart??input.value.length;input.value=`${input.value.slice(0,start)}${button.dataset.token}${input.value.slice(input.selectionEnd??start)}`;input.focus();renderTemplateExample();})); $('#qualityInput').addEventListener('input',(event)=>$('#qualityValue').textContent=event.target.value); $('#healthButton').addEventListener('click',showToolCheck); $('#exportButton').addEventListener('click',exportZip); }
function showToolCheck() { const modal=document.createElement('div'); modal.className='modal-overlay'; modal.innerHTML=`<div class="modal-box"><div class="modal-icon modal-icon-ok">✓</div><h3 class="modal-title">${t('toolCheckOk')}</h3><p class="modal-desc">${t('toolCheckOkDesc')}</p><div class="modal-actions"><button class="ghost-button modal-close-btn" type="button">关闭</button></div></div>`; modal.addEventListener('click',(event)=>{if(event.target===modal||event.target.closest('.modal-close-btn'))modal.remove();}); document.body.append(modal); }
wireEvents(); renderTemplateOptions(); syncFormatControls(); applyLanguage(); renderEmpty();
