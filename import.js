'use strict';

/* ================= Rezept-Import ================= */
// Liest Rezepte von Webseiten. Die meisten Rezeptseiten (Chefkoch, Lecker,
// EatSmarter, Kitchen Stories …) enthalten das Rezept zusätzlich in einem
// maschinenlesbaren Format (schema.org/Recipe als JSON-LD). Das wird hier
// ausgewertet. Weil Browser fremde Seiten nicht direkt laden dürfen (CORS),
// geht die Anfrage über öffentliche Weiterleitungsdienste – übertragen wird
// dabei nur die Adresse der Rezeptseite, keine Daten aus der App.

const IMPORT_PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
];
const IMPORT_TIMEOUT = 15000;

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchRecipePage(url) {
  const attempts = [() => fetchWithTimeout(url, 6000), ...IMPORT_PROXIES.map((p) => () => fetchWithTimeout(p(url), IMPORT_TIMEOUT))];
  let lastErr = null;
  for (const attempt of attempts) {
    try {
      const html = await attempt();
      if (html && html.includes('<')) return html;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Seite konnte nicht geladen werden');
}

/* ---------- Hilfen ---------- */

function cleanText(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.innerHTML = String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ');
  return (div.textContent || '').replace(/\s+/g, ' ').trim();
}

// ISO-8601-Dauer (z. B. "PT1H30M") in Minuten
function isoMinutes(v) {
  if (!v || typeof v !== 'string') return null;
  const m = v.match(/^P(?:(\d+)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:\d+(?:\.\d+)?S)?)?$/i);
  if (!m) return null;
  const min = (+(m[1] || 0)) * 1440 + (+(m[2] || 0)) * 60 + Math.round(+(m[3] || 0));
  return min > 0 ? min : null;
}

const typeIs = (node, t) => {
  const ty = node && node['@type'];
  return Array.isArray(ty) ? ty.some((x) => String(x).toLowerCase() === t) : String(ty || '').toLowerCase() === t;
};

function findRecipeNode(data) {
  if (!data || typeof data !== 'object') return null;
  if (Array.isArray(data)) {
    for (const x of data) { const f = findRecipeNode(x); if (f) return f; }
    return null;
  }
  if (typeIs(data, 'recipe')) return data;
  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage', 'itemListElement', 'item']) {
    if (data[key]) { const f = findRecipeNode(data[key]); if (f) return f; }
  }
  return null;
}

function flattenInstructions(ins, out = [], section = '') {
  if (!ins) return out;
  if (typeof ins === 'string') {
    // Ein langer Text: in Absätze bzw. nummerierte Schritte teilen
    const text = ins.replace(/<\/(p|li)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
    text.split(/\n+|(?:^|\s)(?=\d{1,2}[.)]\s)/).map(cleanText)
      .map((t) => t.replace(/^\d{1,2}[.)]\s*/, '')).filter(Boolean)
      .forEach((t) => out.push({ title: section, text: t }));
    return out;
  }
  if (Array.isArray(ins)) { ins.forEach((x) => flattenInstructions(x, out, section)); return out; }
  if (typeof ins === 'object') {
    if (typeIs(ins, 'howtosection')) {
      const name = cleanText(ins.name);
      const before = out.length;
      flattenInstructions(ins.itemListElement || ins.steps, out, '');
      if (name && out[before]) out[before].title = out[before].title ? `${name}: ${out[before].title}` : name;
      return out;
    }
    const text = cleanText(ins.text || ins.description || '');
    const name = cleanText(ins.name || '');
    if (ins.itemListElement && !text) return flattenInstructions(ins.itemListElement, out, section);
    if (!text && !name) return out;
    // Viele Seiten setzen name = Anfang des Textes – dann keinen Titel
    const title = name && text && !text.startsWith(name.replace(/[.…]+$/, '')) && name.length < 80 ? name : section;
    out.push({ title, text: text || name });
  }
  return out;
}

/* ---------- Zutatenzeile zerlegen ---------- */

const UNIT_WORDS = new Set(['g', 'gr', 'gramm', 'kg', 'kilo', 'mg', 'ml', 'cl', 'dl', 'l', 'liter', 'el', 'tl', 'esslöffel',
  'teelöffel', 'msp', 'messerspitze', 'prise', 'prisen', 'pck', 'päckchen', 'packung', 'packungen', 'pkt', 'paket',
  'dose', 'dosen', 'glas', 'gläser', 'becher', 'bund', 'bünde', 'zehe', 'zehen', 'stück', 'stk', 'st', 'scheibe',
  'scheiben', 'tasse', 'tassen', 'handvoll', 'zweig', 'zweige', 'blatt', 'blätter', 'stange', 'stangen', 'knolle',
  'knollen', 'kopf', 'köpfe', 'tropfen', 'schuss', 'spritzer', 'würfel', 'tüte', 'beutel', 'flasche', 'flaschen',
  'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'kleine', 'kleiner', 'kleines', 'große', 'großer', 'großes', 'mittelgroße',
  'mittelgroßer', 'gestr.', 'geh.', 'gehäufter', 'gestrichener', 'n.', 'b.']);
const OPTIONAL_RE = /\b(optional|nach belieben|nach geschmack|evtl\.?|eventuell|zum garnieren|zum bestreuen|zum servieren|für die deko)\b/i;
const STAPLE_RE = /^(salz|pfeffer|salz und pfeffer|salz & pfeffer|salz, pfeffer|öl|olivenöl|pflanzenöl|sonnenblumenöl|rapsöl|zucker|wasser|muskat|muskatnuss)$/i;
const NUM = '(?:\\d+(?:[.,]\\d+)?(?:\\s+\\d\\/\\d)?|\\d\\/\\d|[½¼¾⅓⅔⅛])';
const QTY_RE = new RegExp(`^((?:ca\\.?\\s*|etwa\\s+)?${NUM}(?:\\s*[½¼¾⅓⅔])?(?:\\s*(?:-|–|bis)\\s*${NUM})?)\\s*(.*)$`, 'i');

function parseIngredientLine(line) {
  let s = cleanText(line).replace(/^[-•*·]\s*/, '');
  if (!s) return null;
  let optional = OPTIONAL_RE.test(s);
  let qty = '';
  const m = s.match(QTY_RE);
  if (m && m[2]) {
    qty = m[1].trim();
    s = m[2].trim();
    // bis zu zwei Einheiten-Wörter übernehmen, z. B. "1 gehäufter EL", "2 kleine Zwiebeln"
    for (let k = 0; k < 2; k++) {
      const w = s.match(/^(\S+)\s+(.*)$/);
      if (!w || !UNIT_WORDS.has(w[1].toLowerCase()) && !UNIT_WORDS.has(w[1].toLowerCase().replace(/\.$/, ''))) break;
      qty += ` ${w[1]}`;
      s = w[2];
    }
  } else if (/^(etwas|einige|ein paar|1 prise|eine prise|wenig)\s+/i.test(s)) {
    const w = s.match(/^(etwas|einige|ein paar|eine prise|wenig)\s+(.*)$/i);
    if (w) { qty = w[1]; s = w[2]; }
  }
  // Zusatz nach Komma oder in Klammern am Ende als Hinweis zur Menge
  let note = '';
  const comma = s.indexOf(',');
  if (comma > 0) { note = s.slice(comma + 1).trim(); s = s.slice(0, comma).trim(); }
  s = s.replace(OPTIONAL_RE, '').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').replace(/[,;:\s]+$/, '').trim();
  note = note.replace(OPTIONAL_RE, '').replace(/^[,;\s]+|[,;\s]+$/g, '').trim();
  // Chefkoch-Schreibweise "Zwiebel(n)", "Ei(er)" je nach Menge auflösen
  const amount = parseFloat(String(qty).replace(',', '.').replace(/^(ca\.?|etwa)\s*/i, '')) || (/[½¼¾⅓⅔⅛]/.test(qty) ? 0.5 : NaN);
  const plural = !(amount <= 1);
  s = s.replace(/([a-zäöüß])\((n|s|e|en|er|nen|r)\)(?=[\s,]|$)/gi, (m0, c, suf) => (plural ? c + suf : c));
  if (!s) return null;
  if (STAPLE_RE.test(s)) optional = true;
  return { name: s, qty: [qty, note].filter(Boolean).join(', '), optional };
}

/* ---------- Seite auswerten ---------- */

function parseRecipeHtml(html, sourceUrl = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let node = null;
  for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      node = findRecipeNode(JSON.parse(s.textContent.trim().replace(/^\s*<!--|-->\s*$/g, '')));
    } catch (e) { node = null; }
    if (node) break;
  }

  let name = '';
  let ingLines = [];
  let steps = [];
  let duration = null;
  let yieldTxt = '';

  if (node) {
    name = cleanText(node.name);
    ingLines = [].concat(node.recipeIngredient || node.ingredients || []);
    steps = flattenInstructions(node.recipeInstructions);
    duration = isoMinutes(node.totalTime)
      || ((isoMinutes(node.prepTime) || 0) + (isoMinutes(node.cookTime) || 0)) || null;
    const y = [].concat(node.recipeYield || [])[0];
    yieldTxt = y != null ? cleanText(y) : '';
  } else {
    // Ersatz: Mikrodaten (itemprop) auswerten
    const q = (sel) => [...doc.querySelectorAll(sel)];
    const scope = doc.querySelector('[itemtype*="schema.org/Recipe" i]') || doc;
    ingLines = q('[itemprop="recipeIngredient"], [itemprop="ingredients"]').map((e) => e.textContent);
    const ins = q('[itemprop="recipeInstructions"]');
    steps = ins.length === 1 && ins[0].querySelectorAll('li, p').length > 1
      ? [...ins[0].querySelectorAll('li, p')].map((e) => ({ title: '', text: cleanText(e.textContent) }))
      : ins.map((e) => ({ title: '', text: cleanText(e.textContent) }));
    const n = scope.querySelector('[itemprop="name"]');
    name = cleanText(n ? n.textContent : '');
    const tt = scope.querySelector('[itemprop="totalTime"]');
    duration = tt ? isoMinutes(tt.getAttribute('content') || tt.getAttribute('datetime')) : null;
  }

  if (!name) {
    const og = doc.querySelector('meta[property="og:title"]');
    name = cleanText(og ? og.getAttribute('content') : (doc.title || ''));
  }
  const ingredients = ingLines.map(parseIngredientLine).filter(Boolean);
  steps = steps.filter((x) => x.text || x.title);
  if (!ingredients.length && !steps.length) return null;
  return {
    name: name || 'Importiertes Rezept',
    duration,
    ingredients,
    steps,
    tip: yieldTxt ? `Menge laut Rezept: ${yieldTxt}.` : '',
    source: sourceUrl,
  };
}

/* ---------- Eingefügter Text ---------- */
// Für Seiten, die nicht geladen werden können: Rezept auf der Webseite
// markieren, kopieren und hier einfügen. Wird auch für Text aus Fotos und
// Instagram-Beschreibungen verwendet.

// Hashtags, @Erwähnungen und Emojis/Aufzählungszeichen am Zeilenanfang entfernen
function stripRecipeNoise(line) {
  return String(line || '')
    .replace(/[\uFE0F\u20E3\u200D]/g, '')
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, ' ')
    .replace(/(^|\s)@[\w.]+/g, ' ')
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/^[^\p{L}\p{N}½¼¾⅓⅔⅛(„"]+/u, '')
    .replace(/(\d)\s*mi!?(?=\s)/g, '$1 ml')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const ING_HEAD_RE = /^(?:\S{1,2}\s+)?(zutaten|zutatenliste|einkaufsliste|das brauchst du|du brauchst|was du brauchst|ingredients|you need)\b/i;
const STEP_HEAD_RE = /^(?:\S{1,2}\s+)?(zubereitung|anleitung|so geht'?s|so wird'?s gemacht|so gehts|schritte|arbeitsschritte|und so geht'?s|instructions|directions|method|preparation)\b/i;

function findDuration(text) {
  const t = String(text || '');
  let m = t.match(/(?:zubereitungszeit|gesamtzeit|arbeitszeit|kochzeit|dauer|zeit|in\s+nur|fertig\s+in|time)\s*:?\s*(?:ca\.?\s*)?(\d{1,2})\s*(?:std\.?|stunden?|h)\b(?:\s*(\d{1,2})\s*min)?/i);
  if (m) return (+m[1]) * 60 + (+(m[2] || 0));
  m = t.match(/(?:zubereitungszeit|gesamtzeit|arbeitszeit|kochzeit|dauer|zeit|in\s+nur|fertig\s+in|time)\s*:?\s*(?:ca\.?\s*)?(\d{1,3})\s*(?:min\.?|minuten|minutes)\b/i);
  if (m) return +m[1];
  // "Pasta in 15 Minuten" nur im Titelbereich, nicht in den Schritten
  const head = t.split(/\n/).filter((l) => l.trim()).slice(0, 3).join(' ');
  m = head.match(/\bin\s+(\d{1,3})\s*(?:min\.?|minuten|minutes)\b/i);
  return m ? +m[1] : null;
}

function parseRecipeText(text, sourceUrl = '', { fromPhoto = false } = {}) {
  // Bei Fotos/Screenshots ist der Zeilenumbruch nur Layout; bei kopiertem Text meist ein neuer Absatz
  const userRe = fromPhoto ? /^[a-z0-9._]{5,30}\s+(?=\p{Lu})/u : /^[a-z0-9]*[._][a-z0-9._]*\s+(?=\p{Lu})/u;
  const lines = String(text || '').split(/\r?\n/).map(stripRecipeNoise);
  const isIngHead = (l) => ING_HEAD_RE.test(l);
  const isStepHead = (l) => STEP_HEAD_RE.test(l);
  const isQtyLine = (l) => QTY_RE.test(l) && l.length < 80 && !/[.!?]$/.test(l);
  const isSubHead = (l) => /:$/.test(l) && l.length < 50 && !QTY_RE.test(l);
  let name = '';
  const ing = [];
  const steps = [];
  let mode = 'head';
  let headDone = false;
  let stepStart = false; // neuer Schritt beginnt (Nummer/Aufzählung oder Leerzeile)
  const addStep = (l) => {
    const numbered = /^(schritt\s*)?\d{1,2}[.):]\s*/i.test(l);
    const t = l.replace(/^(schritt\s*)?\d{1,2}[.):]\s*/i, '').replace(/^schritt\s*\d{1,2}\s+/i, '');
    if (t.length < 3) { stepStart = true; return; }
    const last = steps[steps.length - 1];
    // Zeilenumbrüche mitten im Satz (Fotos, Screenshots) wieder zusammenfügen
    if (last && !numbered && !stepStart && (/^[a-zäöüß(,]/.test(t) || (fromPhoto && !/[.!?:)]$/.test(last.text)))) {
      last.text = `${last.text} ${t}`;
    } else {
      steps.push({ title: '', text: t.charAt(0).toUpperCase() + t.slice(1) });
    }
    stepStart = false;
  };
  for (const l of lines) {
    if (!l) { stepStart = true; continue; }
    if (isIngHead(l)) { mode = 'ing'; continue; }
    if (isStepHead(l)) { mode = 'steps'; stepStart = true; continue; }
    if (mode === 'head') {
      if (isQtyLine(l) && name) { mode = 'ing'; } else {
        if (!name) { name = l.replace(userRe, ''); continue; } // Instagram-Name davor
        if (!headDone && /^[a-zäöüß]/.test(l) && !/[.!?]$/.test(name)) name = `${name} ${l.replace(userRe, '')}`;
        headDone = true;
        continue;
      }
    }
    if (mode === 'ing') {
      if (isSubHead(l)) continue; // z. B. "Für die Soße:"
      if (!QTY_RE.test(l) && l.length > 60 && /[.!?]$/.test(l)) { mode = 'steps'; addStep(l); continue; }
      // "Salz, Pfeffer, Basilikum" ohne Mengen: einzelne Zutaten
      const parts = l.split(/\s*[,;]\s*|\s+(?:und|&)\s+/);
      if (!QTY_RE.test(l) && parts.length > 1 && parts.every((x) => x && x.split(' ').length <= 2 && !/\d/.test(x))) {
        parts.forEach((x) => { const p = parseIngredientLine(x); if (p) ing.push(p); });
        continue;
      }
      const p = parseIngredientLine(l);
      if (p) ing.push(p);
    } else {
      addStep(l);
    }
  }
  if (!ing.length && !steps.length) {
    // Ohne Überschriften: Zeilen mit Mengenangabe = Zutaten, längere Sätze = Schritte
    let first = true;
    for (const l of lines) {
      if (!l) continue;
      if (first) { name = l; first = false; continue; }
      if (isQtyLine(l)) { const p = parseIngredientLine(l); if (p) ing.push(p); }
      else if (l.length > 40) steps.push({ title: '', text: l });
    }
  }
  name = name.split(/[.!?](?:\s|$)/)[0]
    .replace(/\s+(?:in nur|in|fertig in|in unter)\s+\d+\s*(?:min\.?|minuten)\b.*$/i, '')
    .replace(/[\s:,;.!-]+$/, '');
  return { name: name.slice(0, 120) || 'Importiertes Rezept', duration: findDuration(text), ingredients: ing, steps, tip: '', source: sourceUrl };
}

function firstUrl(s) {
  const m = String(s || '').match(/https?:\/\/[^\s"'<>]+/i);
  return m ? m[0].replace(/[).,;]+$/, '') : '';
}
