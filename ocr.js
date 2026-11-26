'use strict';

/* ================= Texterkennung aus Fotos ================= */
// Liest Text aus Screenshots (z. B. Instagram-Beschreibungen) und Fotos von
// Rezepten (Kochbuch, Zettel). Dafür wird Tesseract.js verwendet; alle Dateien
// liegen im Ordner ocr/ dieser App, die Bilder verlassen das Handy nicht.
// Die Texterkennung wird erst beim ersten Gebrauch geladen (ca. 6 MB).

const OCR_BASE = new URL('ocr/', document.baseURI).href;
const OCR_MAX_SIDE = 2400;
let ocrScriptPromise = null;

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (!ocrScriptPromise) {
    ocrScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${OCR_BASE}tesseract.min.js`;
      s.onload = () => resolve(window.Tesseract);
      s.onerror = () => { ocrScriptPromise = null; reject(new Error('Texterkennung konnte nicht geladen werden')); };
      document.head.appendChild(s);
    });
  }
  return ocrScriptPromise;
}

// Bild verkleinern und bei dunklem Hintergrund (Dark Mode) umkehren,
// weil die Erkennung dunkle Schrift auf hellem Grund am besten liest.
async function prepareImage(file) {
  let src;
  try {
    src = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch (e) {
    src = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Bild konnte nicht geöffnet werden'));
      img.src = URL.createObjectURL(file);
    });
  }
  const w0 = src.width || src.naturalWidth;
  const h0 = src.height || src.naturalHeight;
  const scale = Math.min(1, OCR_MAX_SIDE / Math.max(w0, h0));
  const w = Math.round(w0 * scale);
  const h = Math.round(h0 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(src, 0, 0, w, h);
  if (src.close) src.close();
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  let sum = 0;
  for (let i = 0; i < px.length; i += 4) {
    const y = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    px[i] = px[i + 1] = px[i + 2] = y;
    sum += y;
  }
  if (sum / (px.length / 4) < 110) {
    for (let i = 0; i < px.length; i += 4) px[i] = px[i + 1] = px[i + 2] = 255 - px[i];
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

// files: Liste von Bilddateien; onProgress(text) für Statusmeldungen
async function recognizeImages(files, onProgress = () => {}) {
  onProgress('⏳ Texterkennung wird geladen …');
  const T = await loadTesseract();
  let current = 0;
  const total = files.length;
  const worker = await T.createWorker('deu', 1, {
    workerPath: `${OCR_BASE}worker.min.js`,
    corePath: OCR_BASE,
    langPath: OCR_BASE,
    workerBlobURL: false,
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round((m.progress || 0) * 100);
        onProgress(`🔎 Text wird erkannt${total > 1 ? ` (Bild ${current} von ${total})` : ''} … ${pct} %`);
      } else if (/loading|initializ/.test(m.status || '')) {
        onProgress('⏳ Texterkennung wird geladen … (beim ersten Mal etwas länger)');
      }
    },
  });
  try {
    const texts = [];
    for (const file of files) {
      current += 1;
      onProgress(`🔎 Bild ${current} von ${total} wird vorbereitet …`);
      const canvas = await prepareImage(file);
      const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
      texts.push(data.blocks ? linesFromBlocks(data.blocks) : (data.text || ''));
    }
    return cleanOcrText(texts.join('\n'));
  } finally {
    worker.terminate();
  }
}

/* ---------- Erkannten Text aufräumen ---------- */

// Emojis werden oft als zufällige Zeichen erkannt ("8 1 Dose", "EM Zwiebel").
// Solche kurzen, unsicher erkannten Wörter werden anhand der Erkennungs-
// sicherheit verworfen.
function linesFromBlocks(blocks) {
  const out = [];
  const isNum = (t) => /^[\d½¼¾⅓⅔⅛]+([.,/]\d+)?$/.test(t);
  for (const block of blocks) {
    for (const para of block.paragraphs || []) {
      for (const line of para.lines || []) {
        const words = [];
        (line.words || []).forEach((w, i, all) => {
          let t = (w.text || '').trim();
          if (!t) return;
          const prev = words[words.length - 1];
          if (prev && isNum(prev) && /^(mi|mI|m1|rnl|mL)!?[.,]?$/.test(t)) t = 'ml';
          const short = t.length <= 3;
          const unsure = w.confidence < 60 || (words.length === 0 && w.confidence < 70);
          if (short && unsure && !(prev && isNum(prev)) && t !== 'ml') return;
          // einzelne Ziffer vor einer Mengenangabe am Zeilenanfang: Emoji
          const next = all[i + 1] && (all[i + 1].text || '').trim();
          if (words.length === 0 && /^\d$/.test(t) && next && isNum(next)) return;
          if (!/[\p{L}\p{N}]/u.test(t) && w.confidence < 85) return;
          words.push(t);
        });
        out.push(words.join(' '));
      }
      out.push('');
    }
  }
  return out.join('\n');
}

// Zeilen aus der Instagram-Oberfläche, die nicht zum Rezept gehören
const OCR_JUNK_RE = new RegExp([
  '^gefällt\\b', '^\\S+\\s+[-·•]?\\s*(folgen|abonnieren|gefolgt)$', 'original(-|\\s)?audio', '\\bgefällt\\s+[\\d.,]+\\s*(mal|personen)', '^[\\d.,]+\\s*(tsd\\.?|mio\\.?)?\\s*(mal gefällt|likes?|kommentare?|comments?|aufrufe|views)\\b',
  '^alle\\s+[\\d.,]+\\s+kommentare', '^kommentar(e)?\\s+(hinzufügen|ansehen)', '^antworten$', '^übersetzung anzeigen', '^see translation',
  '^original(-|\\s)?audio', '^mehr ansehen$', '^(…|\\.\\.\\.)?\\s*mehr$', '^vor\\s+\\d+\\s+(sekunden|minuten|stunden|tagen|wochen)',
  '^\\d+\\s*(sek|min|std|t|w|wo)\\.?$', '^gesponsert$', '^folgen$', '^abonniert$', '^speichern\\b.*(nicht vergessen|für später)',
  '^(link|rezept)\\s+(in|im)\\s+(der\\s+)?bio\\b',
].join('|'), 'i');

function cleanOcrText(text) {
  const raw = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+/g, ' ').trim());
  // Silbentrennung am Zeilenende wieder zusammenfügen ("Zwie-" + "beln")
  const lines = [];
  for (const l of raw) {
    const prev = lines[lines.length - 1];
    if (prev && /[a-zäöüß]-$/.test(prev) && /^[a-zäöüß]/.test(l)) lines[lines.length - 1] = prev.slice(0, -1) + l;
    else lines.push(l);
  }
  const seen = new Set();
  const out = [];
  for (let l of lines) {
    l = stripRecipeNoise(l);
    if (!l) { if (out.length && out[out.length - 1] !== '') out.push(''); continue; }
    if ((l.match(/[\p{L}\p{N}½¼¾⅓⅔⅛]/gu) || []).length < 2) continue;
    if (OCR_JUNK_RE.test(l)) continue;
    // Überlappende Screenshots: doppelte Zeilen nur einmal übernehmen
    const key = l.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (key.length >= 4 && seen.has(key)) continue;
    seen.add(key);
    out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
