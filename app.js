'use strict';

/* ================= Grundlagen ================= */

const STORE_KEY = 'shopit-v1';
const HIDE_MS = 2500; // so lange bleibt ein abgehakter Artikel sichtbar

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function sampleRecipes() {
  const ing = (name, qty = '', optional = false) => ({ id: uid(), name, qty, optional });
  return [
    {
      id: uid(), type: 'standard', name: 'Frühstück', duration: null, lastAdded: null,
      ingredients: [
        ing('Brötchen', '6'), ing('Butter'), ing('Milch', '1 l'), ing('Eier', '6'),
        ing('Marmelade', '', true), ing('Orangensaft', '', true),
      ],
    },
  ];
}

function defaultState() {
  const listId = uid();
  return {
    version: 1,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    learned: {}, // Artikelname -> Kategorie-ID (vom Nutzer festgelegt)
    lists: [{ id: listId, name: 'Einkaufsliste', items: [] }],
    activeListId: listId,
    recipes: sampleRecipes(),
    sort: { recipe: 'alpha', standard: 'alpha' },
    suggestions: null, // Vorschlagsliste für Artikel/Zutaten (wird beim Laden befüllt)
    suggestHidden: [], // vom Nutzer entfernte Vorschläge (nicht wieder automatisch aufnehmen)
    suggestAuto: true, // neue Artikel automatisch als Vorschlag übernehmen
    packs: [], // bereits importierte Rezeptsammlungen
    backup: { lastAt: 0, since: Date.now(), intervalDays: 7, snoozeUntil: 0 },
  };
}

// Importiert mitgelieferte Rezeptsammlungen genau einmal.
function importPacks(st) {
  if (typeof RECIPE_PACKS === 'undefined') return;
  for (const pack of RECIPE_PACKS) {
    if (st.packs.includes(pack.id)) continue;
    // Altes, unverändertes Beispielrezept durch die vegane Version ersetzen
    st.recipes = st.recipes.filter((r) => !(r.name === 'Spaghetti Bolognese'
      && r.ingredients.some((i) => i.name === 'Rinderhackfleisch')));
    for (const [k, cat] of Object.entries(pack.learned || {})) {
      if (!st.learned[k]) st.learned[k] = cat;
    }
    for (const r of pack.recipes) {
      if (st.recipes.some((x) => x.type === 'recipe' && norm(x.name) === norm(r.name))) continue;
      st.recipes.push({
        id: uid(), type: 'recipe', name: r.name, duration: r.duration ?? null, lastAdded: null,
        ingredients: r.ingredients.map(([name, qty = '', optional = false]) => ({ id: uid(), name, qty, optional: !!optional })),
      });
    }
    st.packs.push(pack.id);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (e) { console.error(e); }
  return normalizeState(defaultState());
}

function normalizeState(s) {
  const d = defaultState();
  const st = { ...d, ...s };
  if (!Array.isArray(st.categories) || !st.categories.length) st.categories = d.categories;
  if (!st.categories.some((c) => c.id === 'other')) st.categories.push({ id: 'other', name: 'Sonstiges' });
  if (!Array.isArray(st.lists) || !st.lists.length) st.lists = d.lists;
  if (!st.lists.some((l) => l.id === st.activeListId)) st.activeListId = st.lists[0].id;
  if (!Array.isArray(st.recipes)) st.recipes = [];
  st.learned = st.learned || {};
  st.sort = { ...d.sort, ...(st.sort || {}) };
  if (!Array.isArray(st.packs)) st.packs = [];
  if (!Array.isArray(st.suggestHidden)) st.suggestHidden = [];
  if (typeof st.suggestAuto !== 'boolean') st.suggestAuto = true;
  st.backup = { ...d.backup, ...(st.backup || {}) };
  importPacks(st);
  if (!Array.isArray(st.suggestions)) {
    // Erstbefüllung aus allen bekannten Artikeln und Zutaten
    const names = new Map();
    st.recipes.forEach((r) => r.ingredients.forEach((i) => names.set(norm(i.name), i.name.trim())));
    st.lists.forEach((l) => l.items.forEach((i) => names.set(norm(i.name), i.name.trim())));
    st.suggestions = [...names.values()].filter(Boolean).sort((a, b) => a.localeCompare(b, 'de'));
  }
  return st;
}

let state = loadState();
const ui = { view: 'list', doneOpen: false, search: { recipe: '', standard: '' } };

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { console.error(e); }
}

function commit() { save(); render(); }

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ================= Kategorien ================= */

const catById = (id) => state.categories.find((c) => c.id === id);

function categorize(name) {
  const learned = state.learned[norm(name)];
  if (learned && catById(learned)) return learned;
  const guess = guessCategory(name);
  return catById(guess) ? guess : 'other';
}

function catOptions(selected) {
  return state.categories.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
}

/* ================= Listen ================= */

const activeList = () => state.lists.find((l) => l.id === state.activeListId) || state.lists[0];

function addItemToList(list, { name, qty = '', from = '' }) {
  name = name.trim();
  if (!name) return;
  const existing = list.items.find((i) => !i.checked && norm(i.name) === norm(name));
  if (existing) {
    if (qty) existing.qty = existing.qty ? `${existing.qty} + ${qty}` : qty;
    if (from && !(existing.from || '').split(', ').includes(from)) {
      existing.from = existing.from ? `${existing.from}, ${from}` : from;
    }
    return;
  }
  list.items.push({ id: uid(), name, qty: qty.trim(), cat: categorize(name), from, checked: false, checkedAt: 0 });
}

const isHidden = (item, now = Date.now()) => item.checked && now - item.checkedAt >= HIDE_MS;

let hideTimer = null;
function scheduleHideRender() {
  clearTimeout(hideTimer);
  const now = Date.now();
  const pending = activeList().items.filter((i) => i.checked && !isHidden(i, now));
  if (!pending.length) return;
  const next = Math.min(...pending.map((i) => i.checkedAt + HIDE_MS - now));
  hideTimer = setTimeout(render, Math.max(50, next + 30));
}

/* ================= Sheets & Dialoge ================= */
// Sheets nutzen die Browser-History, damit die Android-Zurück-Taste sie schließt.

const sheets = [];
let dialogs = [];

function openSheet(html, { onClose, full = false } = {}) {
  const el = document.createElement('div');
  el.className = 'backdrop';
  el.innerHTML = `<div class="sheet ${full ? 'full' : ''}">${html}</div>`;
  el.addEventListener('click', (e) => { if (e.target === el) closeSheet(); });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
  sheets.push({ el, onClose });
  history.pushState({ sheet: sheets.length }, '');
  return el.firstElementChild;
}

function closeSheet(n = 1) {
  n = Math.min(n, sheets.length);
  if (n > 0) history.go(-n);
}

function removeEl(el) {
  el.classList.remove('open');
  setTimeout(() => el.remove(), 220);
}

window.addEventListener('popstate', (e) => {
  dialogs.forEach((d) => { removeEl(d.el); d.resolve(null); });
  dialogs = [];
  const depth = (e.state && e.state.sheet) || 0;
  while (sheets.length > depth) {
    const s = sheets.pop();
    removeEl(s.el);
    if (s.onClose) s.onClose();
  }
});

function openDialog(html, setup) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'backdrop dialog-backdrop';
    el.innerHTML = `<div class="dialog">${html}</div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('open'));
    const entry = { el, resolve };
    dialogs.push(entry);
    const done = (val) => {
      dialogs = dialogs.filter((d) => d !== entry);
      removeEl(el);
      resolve(val);
    };
    el.addEventListener('click', (e) => { if (e.target === el) done(null); });
    setup(el.firstElementChild, done);
  });
}

function askText(title, initial = '', placeholder = '') {
  return openDialog(`
    <h3>${esc(title)}</h3>
    <form><input class="input" name="v" value="${esc(initial)}" placeholder="${esc(placeholder)}" autocomplete="off">
    <div class="btn-row"><button type="button" class="btn ghost" data-x>Abbrechen</button>
    <button class="btn primary">OK</button></div></form>`, (box, done) => {
    const input = $('input', box);
    setTimeout(() => { input.focus(); input.select(); }, 50);
    $('[data-x]', box).onclick = () => done(null);
    $('form', box).onsubmit = (e) => { e.preventDefault(); done(input.value.trim() || null); };
  });
}

function confirmDialog(message, okLabel = 'OK', danger = false) {
  return openDialog(`
    <p>${esc(message)}</p>
    <div class="btn-row"><button class="btn ghost" data-x>Abbrechen</button>
    <button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(okLabel)}</button></div>`, (box, done) => {
    $('[data-x]', box).onclick = () => done(false);
    $('[data-ok]', box).onclick = () => done(true);
  });
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ================= Vorschläge ================= */
// Eigene Vorschlagsleiste statt <datalist>: Die Android-Vorschlagsliste
// verdeckt die Tastatur, diese Chips sitzen direkt am Eingabefeld.

function learnSuggestion(name) {
  name = String(name || '').trim();
  if (!name || !state.suggestAuto) return;
  const k = norm(name);
  if (state.suggestHidden.includes(k)) return;
  if (!state.suggestions.some((x) => norm(x) === k)) state.suggestions.push(name);
}

function findSuggestions(q) {
  q = norm(q);
  if (!q) return [];
  const starts = [];
  const contains = [];
  for (const sug of state.suggestions) {
    const n = norm(sug);
    if (n === q) continue;
    if (n.startsWith(q) || n.split(/[\s(-]+/).some((w) => w.startsWith(q))) starts.push(sug);
    else if (q.length >= 3 && n.includes(q)) contains.push(sug);
  }
  const by = (a, b) => a.localeCompare(b, 'de');
  return [...starts.sort(by), ...contains.sort(by)].slice(0, 15);
}

function updateSuggest(input) {
  const scope = input.closest('[data-suggest-scope]');
  const bar = scope && $('.suggest', scope);
  if (!bar) return;
  const items = document.activeElement === input ? findSuggestions(input.value) : [];
  bar.innerHTML = items.map((x) => `<button type="button" class="chip" data-pick="${esc(x)}">${esc(x)}</button>`).join('');
  bar.hidden = !items.length;
  bar.scrollLeft = 0;
}

function hideSuggest(scope) {
  const bar = scope && $('.suggest', scope);
  if (bar) { bar.hidden = true; bar.innerHTML = ''; }
}

document.addEventListener('input', (e) => {
  if (e.target.matches && e.target.matches('[data-suggest]')) updateSuggest(e.target);
});
document.addEventListener('focusout', (e) => {
  if (!e.target.matches || !e.target.matches('[data-suggest]')) return;
  const scope = e.target.closest('[data-suggest-scope]');
  setTimeout(() => {
    if (!scope.contains(document.activeElement) || !document.activeElement.matches('[data-suggest]')) hideSuggest(scope);
  }, 250);
});
// Fokus beim Antippen eines Chips behalten, damit die Tastatur offen bleibt
['pointerdown', 'mousedown'].forEach((type) => document.addEventListener(type, (e) => {
  if (e.target.closest && e.target.closest('[data-pick]')) e.preventDefault();
}));
document.addEventListener('click', (e) => {
  const chip = e.target.closest && e.target.closest('[data-pick]');
  if (!chip) return;
  const scope = chip.closest('[data-suggest-scope]');
  const input = $('[data-suggest]', scope);
  input.value = chip.dataset.pick;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  hideSuggest(scope);
  const next = $('[data-suggest-next]', scope);
  (next || input).focus();
});

// Eingabefelder in Sheets über die Tastatur scrollen
document.addEventListener('focusin', (e) => {
  if (e.target.matches && e.target.matches('.sheet input, .sheet select')) {
    setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
  }
});

/* ================= Backup ================= */
// Backup als Datei: über das Teilen-Menü (z. B. Google Drive) oder als Download.
// Eine Web-App darf nicht still im Hintergrund Dateien schreiben – deshalb
// erinnert die App nach dem eingestellten Intervall und sichert mit einem Tipp.

const DAY = 86400000;

function backupDue(now = Date.now()) {
  const b = state.backup;
  if (!b.intervalDays) return false;
  if (now < (b.snoozeUntil || 0)) return false;
  return now - Math.max(b.lastAt || 0, b.since || 0) >= b.intervalDays * DAY;
}

function backupFile() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const name = `shopit-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.txt`;
  // .txt statt .json: Chrome auf Android teilt nur bestimmte Dateitypen
  return new File([JSON.stringify(state, null, 1)], name, { type: 'text/plain' });
}

function markBackupDone() {
  state.backup.lastAt = Date.now();
  state.backup.snoozeUntil = 0;
  save();
  render();
}

function downloadBackup() {
  const file = backupFile();
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  markBackupDone();
  toast('Backup wird heruntergeladen (Ordner „Downloads“)');
}

async function shareBackup() {
  const file = backupFile();
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Shopit-Backup' });
      markBackupDone();
      toast('Backup gesichert ✓');
    } catch (err) {
      if (err && err.name === 'AbortError') return; // abgebrochen
      downloadBackup();
    }
  } else {
    downloadBackup();
  }
}

function relAgo(ts) {
  if (!ts) return 'noch nie';
  const days = Math.floor((Date.now() - ts) / DAY);
  if (days <= 0) return 'heute';
  if (days === 1) return 'gestern';
  return `vor ${days} Tagen`;
}

function renderBackupBanner() {
  if (!backupDue()) return '';
  return `
    <div class="banner">
      <div class="banner-text"><b>Backup fällig</b><span>Letztes Backup: ${relAgo(state.backup.lastAt)}</span></div>
      <button class="btn ghost small" data-act="backupLater">Später</button>
      <button class="btn primary small" data-act="backupNow">Jetzt sichern</button>
    </div>`;
}

function restoreFromText(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.lists)) throw new Error('invalid');
  const keepBackup = state.backup;
  state = normalizeState(parsed);
  state.backup = { ...keepBackup, lastAt: Date.now(), snoozeUntil: 0 };
  commit();
}

/* ================= Rendering ================= */

const TITLES = { list: 'Einkaufsliste', recipe: 'Gerichte', standard: 'Standardeinkäufe', settings: 'Mehr' };

function render() {
  // Fokus & Eingabe erhalten, damit Tippen beim Neuzeichnen nicht unterbrochen wird.
  const active = document.activeElement;
  const focusId = active && active.id && $('#main').contains(active) ? active.id : null;
  const selStart = focusId && active.selectionStart;

  $('#title').textContent = TITLES[ui.view];
  $$('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.view === ui.view));
  const main = $('#main');
  const banner = ui.view === 'settings' ? '' : renderBackupBanner();
  if (ui.view === 'list') main.innerHTML = banner + renderListView();
  else if (ui.view === 'settings') main.innerHTML = renderSettings();
  else main.innerHTML = banner + renderRecipeView(ui.view);

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) {
      el.focus();
      try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch (e) { /* ignore */ }
      if (el.matches('[data-suggest]')) updateSuggest(el);
    }
  }
  if (ui.view === 'list') scheduleHideRender();
}

function renderListView() {
  const list = activeList();
  const now = Date.now();
  const visible = list.items.filter((i) => !isHidden(i, now));
  const done = list.items.filter((i) => isHidden(i, now));

  const groups = state.categories
    .map((c) => ({ c, items: visible.filter((i) => (catById(i.cat) ? i.cat : 'other') === c.id) }))
    .filter((g) => g.items.length);

  const itemRow = (i) => `
    <div class="item ${i.checked ? 'checked' : ''}" data-id="${i.id}">
      <button class="check" data-act="toggle" aria-label="Abhaken"></button>
      <div class="item-main" data-act="edit">
        <span class="name">${esc(i.name)}</span>
        ${i.qty ? `<span class="qty">${esc(i.qty)}</span>` : ''}
        ${i.from ? `<span class="from">${esc(i.from)}</span>` : ''}
      </div>
    </div>`;

  return `
    <div class="listbar">
      <select id="listSelect" class="input">
        ${state.lists.map((l) => `<option value="${l.id}" ${l.id === list.id ? 'selected' : ''}>${esc(l.name)} (${l.items.filter((i) => !i.checked).length})</option>`).join('')}
        <option value="__new">＋ Neue Liste…</option>
      </select>
      <button class="icon-btn" data-act="listMenu" aria-label="Liste bearbeiten">⋯</button>
    </div>
    <div class="add-wrap" data-suggest-scope>
      <form id="addForm" class="addrow">
        <input id="addName" class="input" placeholder="Artikel hinzufügen" autocomplete="off" autocorrect="off" data-suggest enterkeyhint="done">
        <input id="addQty" class="input qty-input" placeholder="Menge" autocomplete="off" data-suggest-next>
        <button class="btn primary add-btn" aria-label="Hinzufügen">＋</button>
      </form>
      <div class="suggest" hidden></div>
    </div>
    ${groups.length ? groups.map((g) => `
      <section class="group">
        <h2 class="group-title">${esc(g.c.name)}</h2>
        ${g.items.map(itemRow).join('')}
      </section>`).join('') : `
      <div class="empty">
        <div class="empty-ico">🧺</div>
        <p>${done.length ? 'Alles erledigt!' : 'Die Liste ist leer.'}</p>
        <p class="muted">Füge oben Artikel hinzu oder übernimm Zutaten aus deinen Gerichten.</p>
      </div>`}
    ${done.length ? `
      <section class="done">
        <button class="done-toggle" data-act="toggleDone">
          ${ui.doneOpen ? '▾' : '▸'} Erledigt (${done.length})
          <span class="muted">– antippen zum Wiederherstellen</span>
        </button>
        ${ui.doneOpen ? done.map(itemRow).join('') : ''}
        <button class="btn danger wide" data-act="finish">Einkauf abschließen</button>
      </section>` : ''}
  `;
}

function relDays(ts) {
  if (!ts) return 'noch nie hinzugefügt';
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days <= 0) return 'heute hinzugefügt';
  if (days === 1) return 'gestern hinzugefügt';
  return `vor ${days} Tagen hinzugefügt`;
}

const SORTS = {
  alpha: { label: 'A–Z', fn: (a, b) => a.name.localeCompare(b.name, 'de') },
  duration: {
    label: 'Dauer',
    fn: (a, b) => (a.duration ?? Infinity) - (b.duration ?? Infinity) || a.name.localeCompare(b.name, 'de'),
  },
  last: {
    label: 'Lange nicht',
    fn: (a, b) => (a.lastAdded || 0) - (b.lastAdded || 0) || a.name.localeCompare(b.name, 'de'),
  },
};

function sortKeys(type) { return type === 'recipe' ? ['alpha', 'duration', 'last'] : ['alpha', 'last']; }

function renderRecipeView(type) {
  let sort = state.sort[type];
  if (!sortKeys(type).includes(sort)) sort = 'alpha';
  const q = norm(ui.search[type]);
  const items = state.recipes
    .filter((r) => r.type === type)
    .filter((r) => !q || norm(r.name).includes(q) || r.ingredients.some((i) => norm(i.name).includes(q)))
    .sort(SORTS[sort].fn);
  const noun = type === 'recipe' ? 'Gericht' : 'Standardeinkauf';

  return `
    <input id="search-${type}" class="input search" type="search" placeholder="Suchen…" value="${esc(ui.search[type])}" data-search="${type}">
    <div class="segmented">
      ${sortKeys(type).map((k) => `<button data-sort="${k}" class="${k === sort ? 'active' : ''}">${SORTS[k].label}</button>`).join('')}
    </div>
    ${items.length ? items.map((r) => `
      <div class="card" data-id="${r.id}">
        <div class="card-main" data-act="addRecipe">
          <div class="card-title">${esc(r.name)}</div>
          <div class="card-meta">
            ${type === 'recipe' ? `<span>⏱ ${r.duration ? `${r.duration} min` : '–'}</span>` : ''}
            <span>${r.ingredients.length} ${type === 'recipe' ? 'Zutaten' : 'Artikel'}</span>
            <span>${relDays(r.lastAdded)}</span>
          </div>
        </div>
        <button class="icon-btn" data-act="editRecipe" aria-label="Bearbeiten">✎</button>
      </div>`).join('') : `
      <div class="empty">
        <div class="empty-ico">${type === 'recipe' ? '🍲' : '📦'}</div>
        <p>${q ? 'Nichts gefunden.' : `Noch kein ${noun} gespeichert.`}</p>
        ${q ? '' : `<p class="muted">Tippe auf ＋, um ${type === 'recipe' ? 'ein Gericht' : 'einen Standardeinkauf'} anzulegen.</p>`}
      </div>`}
    <button class="fab" data-act="newRecipe" aria-label="${noun} anlegen">＋</button>
  `;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function renderSettings() {
  const cats = state.categories;
  return `
    <section class="panel">
      <h2>Kategorien</h2>
      <p class="muted">Die Einkaufsliste wird in dieser Reihenfolge sortiert. Ordne sie am besten so an wie die Gänge in deinem Supermarkt.</p>
      ${cats.map((c, idx) => `
        <div class="cat-row" data-id="${c.id}">
          <span class="cat-name">${esc(c.name)}</span>
          <button class="icon-btn" data-act="catUp" ${idx === 0 ? 'disabled' : ''} aria-label="Nach oben">↑</button>
          <button class="icon-btn" data-act="catDown" ${idx === cats.length - 1 ? 'disabled' : ''} aria-label="Nach unten">↓</button>
          <button class="icon-btn" data-act="catRename" aria-label="Umbenennen">✎</button>
          ${c.id === 'other' ? '<span class="icon-btn placeholder"></span>' : '<button class="icon-btn" data-act="catDelete" aria-label="Löschen">🗑</button>'}
        </div>`).join('')}
      <button class="btn ghost wide" data-act="catAdd">＋ Kategorie hinzufügen</button>
    </section>
    <section class="panel">
      <h2>Vorschläge</h2>
      <p class="muted">Beim Eintippen von Artikeln und Zutaten erscheinen passende Vorschläge (${state.suggestions.length} Einträge). Du kannst sie hier bearbeiten.</p>
      <button class="btn ghost wide" data-act="suggestManage">Vorschläge bearbeiten</button>
    </section>
    <section class="panel">
      <h2>Datensicherung</h2>
      <p class="muted">Deine Daten liegen nur auf diesem Handy. Sichere sie regelmäßig als Datei – am besten in Google Drive –, damit nichts verloren geht, wenn Browserdaten gelöscht werden oder du das Handy wechselst.</p>
      <p class="backup-status ${backupDue() ? 'due' : ''}">Letztes Backup: <b>${relAgo(state.backup.lastAt)}</b></p>
      <button class="btn primary wide" data-act="backupNow">Backup jetzt sichern (Teilen, z. B. Drive)</button>
      <button class="btn ghost wide" data-act="backupDownload">Backup als Datei herunterladen</button>
      <label class="field reminder"><span>Erinnerung an Backup</span>
        <select class="input" data-backup-interval>
          ${[[0, 'Aus'], [3, 'alle 3 Tage'], [7, 'jede Woche'], [14, 'alle 2 Wochen'], [30, 'jeden Monat']]
            .map(([v, l]) => `<option value="${v}" ${state.backup.intervalDays === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      <h3 class="subhead">Wiederherstellen</h3>
      <label class="btn ghost wide file-btn">Backup aus Datei laden
        <input type="file" accept=".txt,.json,text/plain,application/json" data-restore-file hidden></label>
      <button class="btn ghost wide" data-act="backupImport">Backup-Text einfügen</button>
      <button class="btn ghost wide" data-act="backupExport">Backup als Text kopieren</button>
    </section>
    ${isStandalone() ? '' : `
    <section class="panel">
      <h2>Als App installieren</h2>
      <p class="muted"><b>iPhone (Safari):</b> Unten auf „Teilen“ <span aria-hidden="true">⬆︎</span> tippen → „Zum Home-Bildschirm“.<br>
      <b>Android (Chrome):</b> Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</p>
      <p class="muted">Danach startet Shopit wie eine normale App und funktioniert auch offline.</p>
    </section>`}
    <p class="muted center">Shopit 2.0</p>
  `;
}

/* ================= Rezept: zur Liste hinzufügen ================= */

function openAddRecipeSheet(recipe) {
  const box = openSheet(`
    <h2>${esc(recipe.name)}</h2>
    <label class="field"><span>Zu Liste hinzufügen</span>
      <select class="input" name="target">${state.lists.map((l) => `<option value="${l.id}" ${l.id === state.activeListId ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
    </label>
    <div class="ing-pick">
      ${recipe.ingredients.map((i, idx) => `
        <label class="pick ${i.optional ? 'optional' : ''}">
          <input type="checkbox" data-i="${idx}" ${i.optional ? '' : 'checked'}>
          <span class="pick-name">${esc(i.name)}</span>
          ${i.qty ? `<span class="qty">${esc(i.qty)}</span>` : ''}
          ${i.optional ? '<span class="tag">optional</span>' : ''}
        </label>`).join('') || '<p class="muted">Keine Zutaten hinterlegt.</p>'}
    </div>
    <div class="btn-row sticky">
      <button class="btn ghost" data-x>Abbrechen</button>
      <button class="btn primary" data-add></button>
    </div>`);

  const update = () => {
    const n = $$('input[data-i]:checked', box).length;
    const btn = $('[data-add]', box);
    btn.textContent = n === 1 ? '1 Artikel hinzufügen' : `${n} Artikel hinzufügen`;
    btn.disabled = n === 0;
  };
  box.addEventListener('change', update);
  update();
  $('[data-x]', box).onclick = () => closeSheet();
  $('[data-add]', box).onclick = () => {
    const list = state.lists.find((l) => l.id === $('select[name=target]', box).value) || activeList();
    const chosen = $$('input[data-i]:checked', box).map((c) => recipe.ingredients[+c.dataset.i]);
    chosen.forEach((i) => addItemToList(list, { name: i.name, qty: i.qty, from: recipe.name }));
    recipe.lastAdded = Date.now();
    save();
    closeSheet();
    render();
    toast(`${chosen.length} Artikel zu „${list.name}“ hinzugefügt`);
  };
}

/* ================= Rezept-Editor ================= */

function ingredientRow(i = { name: '', qty: '', optional: false }) {
  const cat = i.name ? categorize(i.name) : 'other';
  return `
    <div class="ing-row" data-suggest-scope>
      <div class="suggest" hidden></div>
      <div class="ing-line">
        <input class="input" name="name" placeholder="Zutat" value="${esc(i.name)}" autocomplete="off" autocorrect="off" data-suggest>
        <input class="input qty-input" name="qty" placeholder="Menge" value="${esc(i.qty)}" autocomplete="off" data-suggest-next>
        <button type="button" class="icon-btn" data-del aria-label="Entfernen">✕</button>
      </div>
      <div class="ing-line small">
        <select class="input" name="cat" data-touched="">${catOptions(cat)}</select>
        <label class="switch"><input type="checkbox" name="optional" ${i.optional ? 'checked' : ''}> optional</label>
      </div>
    </div>`;
}

function openRecipeEditor(type, recipe = null) {
  const isNew = !recipe;
  const r = recipe || { type, name: '', duration: null, ingredients: [] };
  const box = openSheet(`
    <form class="editor">
      <h2>${isNew ? (type === 'recipe' ? 'Neues Gericht' : 'Neuer Standardeinkauf') : 'Bearbeiten'}</h2>
      <label class="field"><span>Name</span>
        <input class="input" name="rname" value="${esc(r.name)}" required autocomplete="off"
          placeholder="${type === 'recipe' ? 'z. B. Gemüsecurry' : 'z. B. Grillabend'}"></label>
      ${type === 'recipe' ? `
      <label class="field"><span>Zubereitungsdauer (Minuten)</span>
        <input class="input" name="duration" type="number" inputmode="numeric" min="0" value="${r.duration ?? ''}" placeholder="z. B. 30"></label>` : ''}
      <h3>${type === 'recipe' ? 'Zutaten' : 'Artikel'}</h3>
      <p class="muted small-text">„optional“ = beim Hinzufügen zunächst nicht ausgewählt.</p>
      <div class="ing-rows">${r.ingredients.map(ingredientRow).join('')}</div>
      <button type="button" class="btn ghost wide" data-addrow>＋ ${type === 'recipe' ? 'Zutat' : 'Artikel'} hinzufügen</button>
      <div class="btn-row sticky">
        ${isNew ? '' : '<button type="button" class="btn danger" data-delete>Löschen</button>'}
        <button type="button" class="btn ghost" data-x>Abbrechen</button>
        <button class="btn primary">Speichern</button>
      </div>
    </form>`, { full: true });

  const rows = $('.ing-rows', box);
  const addRow = (focus) => {
    rows.insertAdjacentHTML('beforeend', ingredientRow());
    if (focus) $('input[name=name]', rows.lastElementChild).focus();
  };
  if (isNew) addRow(false);

  $('[data-addrow]', box).onclick = () => addRow(true);
  rows.addEventListener('click', (e) => {
    if (e.target.closest('[data-del]')) e.target.closest('.ing-row').remove();
  });
  rows.addEventListener('input', (e) => {
    if (e.target.name !== 'name') return;
    const sel = $('select[name=cat]', e.target.closest('.ing-row'));
    if (!sel.dataset.touched) sel.value = categorize(e.target.value);
  });
  rows.addEventListener('change', (e) => {
    if (e.target.name === 'cat') e.target.dataset.touched = '1';
  });
  rows.addEventListener('keydown', (e) => {
    // Enter in einer Zutat springt zur nächsten Zeile statt zu speichern
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      const row = e.target.closest('.ing-row');
      if (row === rows.lastElementChild) addRow(true);
      else $('input[name=name]', row.nextElementSibling).focus();
    }
  });
  $('[data-x]', box).onclick = () => closeSheet();
  const delBtn = $('[data-delete]', box);
  if (delBtn) {
    delBtn.onclick = async () => {
      if (!(await confirmDialog(`„${r.name}“ wirklich löschen?`, 'Löschen', true))) return;
      state.recipes = state.recipes.filter((x) => x.id !== r.id);
      save();
      closeSheet();
      render();
    };
  }
  $('form', box).onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.rname.value.trim();
    if (!name) { f.rname.focus(); return; }
    const old = new Map(r.ingredients.map((i) => [norm(i.name), i.id]));
    const ingredients = $$('.ing-row', rows).map((row) => {
      const iname = $('input[name=name]', row).value.trim();
      if (!iname) return null;
      const sel = $('select[name=cat]', row);
      if (sel.dataset.touched) state.learned[norm(iname)] = sel.value;
      learnSuggestion(iname);
      return {
        id: old.get(norm(iname)) || uid(),
        name: iname,
        qty: $('input[name=qty]', row).value.trim(),
        optional: $('input[name=optional]', row).checked,
      };
    }).filter(Boolean);
    const duration = f.duration && f.duration.value !== '' ? Math.max(0, parseInt(f.duration.value, 10) || 0) : null;
    if (isNew) {
      state.recipes.push({ id: uid(), type, name, duration, lastAdded: null, ingredients });
    } else {
      Object.assign(r, { name, duration, ingredients });
    }
    save();
    closeSheet();
    render();
    toast('Gespeichert');
  };
  if (isNew) setTimeout(() => $('input[name=rname]', box).focus(), 250);
}

/* ================= Artikel bearbeiten ================= */

function openItemEditor(list, item) {
  const box = openSheet(`
    <form>
      <h2>Artikel bearbeiten</h2>
      <label class="field"><span>Name</span><input class="input" name="name" value="${esc(item.name)}" autocomplete="off"></label>
      <label class="field"><span>Menge</span><input class="input" name="qty" value="${esc(item.qty)}" autocomplete="off"></label>
      <label class="field"><span>Kategorie</span><select class="input" name="cat">${catOptions(catById(item.cat) ? item.cat : 'other')}</select></label>
      ${item.from ? `<p class="muted">Aus: ${esc(item.from)}</p>` : ''}
      <div class="btn-row">
        <button type="button" class="btn danger" data-delete>Löschen</button>
        <button type="button" class="btn ghost" data-x>Abbrechen</button>
        <button class="btn primary">Speichern</button>
      </div>
    </form>`);
  $('[data-x]', box).onclick = () => closeSheet();
  $('[data-delete]', box).onclick = () => {
    list.items = list.items.filter((i) => i.id !== item.id);
    save(); closeSheet(); render();
  };
  $('form', box).onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    if (!name) return;
    if (f.cat.value !== item.cat) state.learned[norm(name)] = f.cat.value; // merken
    Object.assign(item, { name, qty: f.qty.value.trim(), cat: f.cat.value });
    save(); closeSheet(); render();
  };
}

function openListMenu() {
  const list = activeList();
  const box = openSheet(`
    <h2>${esc(list.name)}</h2>
    <button class="btn ghost wide" data-a="rename">Umbenennen</button>
    <button class="btn ghost wide" data-a="clear">Alle Artikel entfernen</button>
    ${state.lists.length > 1 ? '<button class="btn danger wide" data-a="delete">Liste löschen</button>' : ''}
    <button class="btn ghost wide" data-a="close">Schließen</button>`);
  box.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const act = a.dataset.a;
    if (act === 'rename') {
      const name = await askText('Liste umbenennen', list.name);
      if (!name) return;
      list.name = name;
    } else if (act === 'clear') {
      if (!(await confirmDialog('Alle Artikel aus dieser Liste entfernen?', 'Entfernen', true))) return;
      list.items = [];
    } else if (act === 'delete') {
      if (!(await confirmDialog(`Liste „${list.name}“ löschen?`, 'Löschen', true))) return;
      state.lists = state.lists.filter((l) => l.id !== list.id);
      state.activeListId = state.lists[0].id;
    }
    save();
    closeSheet();
    render();
  });
}

/* ================= Vorschläge verwalten ================= */

function openSuggestManager() {
  const box = openSheet(`
    <h2>Vorschläge</h2>
    <label class="switch-row"><input type="checkbox" data-auto ${state.suggestAuto ? 'checked' : ''}>
      <span>Neue Artikel und Zutaten automatisch als Vorschlag übernehmen</span></label>
    <form class="addrow" data-addform>
      <input class="input" name="v" placeholder="Neuen Vorschlag eingeben" autocomplete="off">
      <button class="btn primary add-btn" aria-label="Hinzufügen">＋</button>
    </form>
    <input class="input search" type="search" placeholder="Filtern…" data-filter>
    <div class="sg-list"></div>
    <div class="btn-row sticky"><button class="btn primary" data-x>Fertig</button></div>`,
  { full: true, onClose: () => { save(); render(); } });

  const listEl = $('.sg-list', box);
  const draw = () => {
    const q = norm($('[data-filter]', box).value);
    const items = state.suggestions
      .filter((x) => !q || norm(x).includes(q))
      .sort((a, b) => a.localeCompare(b, 'de'));
    listEl.innerHTML = items.length ? items.map((x) => `
      <div class="sg-row"><span>${esc(x)}</span>
      <button type="button" class="icon-btn" data-remove="${esc(x)}" aria-label="Entfernen">✕</button></div>`).join('')
      : `<p class="muted center">${q ? 'Nichts gefunden.' : 'Keine Vorschläge vorhanden.'}</p>`;
  };
  draw();
  $('[data-filter]', box).addEventListener('input', draw);
  $('[data-auto]', box).onchange = (e) => { state.suggestAuto = e.target.checked; save(); };
  $('[data-addform]', box).onsubmit = (e) => {
    e.preventDefault();
    const input = e.target.v;
    const name = input.value.trim();
    if (!name) return;
    const k = norm(name);
    state.suggestHidden = state.suggestHidden.filter((h) => h !== k);
    if (!state.suggestions.some((x) => norm(x) === k)) state.suggestions.push(name);
    input.value = '';
    save();
    draw();
    toast(`„${name}“ hinzugefügt`);
  };
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    const k = norm(b.dataset.remove);
    state.suggestions = state.suggestions.filter((x) => norm(x) !== k);
    if (!state.suggestHidden.includes(k)) state.suggestHidden.push(k);
    save();
    draw();
  });
  $('[data-x]', box).onclick = () => closeSheet();
}

/* ================= Events ================= */

$('.tabbar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-view]');
  if (!b) return;
  ui.view = b.dataset.view;
  render();
  window.scrollTo(0, 0);
});

const main = $('#main');

main.addEventListener('submit', (e) => {
  if (e.target.id !== 'addForm') return;
  e.preventDefault();
  const name = $('#addName').value.trim();
  if (!name) return;
  addItemToList(activeList(), { name, qty: $('#addQty').value });
  learnSuggestion(name);
  $('#addName').value = '';
  $('#addQty').value = '';
  save();
  render();
  $('#addName').focus();
});

main.addEventListener('change', async (e) => {
  if (e.target.matches('[data-backup-interval]')) {
    state.backup.intervalDays = Number(e.target.value);
    state.backup.snoozeUntil = 0;
    commit();
    return;
  }
  if (e.target.matches('[data-restore-file]')) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!(await confirmDialog(`„${file.name}“ wiederherstellen? Alle aktuellen Daten werden ersetzt.`, 'Wiederherstellen', true))) return;
    try {
      restoreFromText(await file.text());
      toast('Backup wiederhergestellt');
    } catch (err) {
      toast('Diese Datei ist kein gültiges Shopit-Backup');
    }
    return;
  }
  if (e.target.id === 'listSelect') {
    const v = e.target.value;
    if (v === '__new') {
      e.target.value = state.activeListId;
      const name = await askText('Neue Liste', '', 'z. B. Drogerie');
      if (!name) return;
      const l = { id: uid(), name, items: [] };
      state.lists.push(l);
      state.activeListId = l.id;
    } else {
      state.activeListId = v;
    }
    ui.doneOpen = false;
    commit();
  }
});

main.addEventListener('input', (e) => {
  const type = e.target.dataset.search;
  if (type) { ui.search[type] = e.target.value; render(); }
});

main.addEventListener('click', async (e) => {
  const sortBtn = e.target.closest('[data-sort]');
  if (sortBtn) { state.sort[ui.view] = sortBtn.dataset.sort; commit(); return; }

  const t = e.target.closest('[data-act]');
  if (!t) return;
  const act = t.dataset.act;
  const rowId = t.closest('[data-id]') && t.closest('[data-id]').dataset.id;
  const list = activeList();

  switch (act) {
    case 'toggle': {
      const item = list.items.find((i) => i.id === rowId);
      if (!item) return;
      item.checked = !item.checked;
      item.checkedAt = item.checked ? Date.now() : 0;
      commit();
      break;
    }
    case 'edit': {
      const item = list.items.find((i) => i.id === rowId);
      if (item) openItemEditor(list, item);
      break;
    }
    case 'toggleDone': ui.doneOpen = !ui.doneOpen; render(); break;
    case 'finish': {
      const n = list.items.filter((i) => i.checked).length;
      if (!(await confirmDialog(`Einkauf abschließen? ${n} erledigte Artikel werden endgültig gelöscht.`, 'Abschließen', true))) return;
      list.items = list.items.filter((i) => !i.checked);
      ui.doneOpen = false;
      commit();
      toast('Einkauf abgeschlossen 🎉');
      break;
    }
    case 'listMenu': openListMenu(); break;
    case 'addRecipe': {
      const r = state.recipes.find((x) => x.id === rowId);
      if (r) openAddRecipeSheet(r);
      break;
    }
    case 'editRecipe': {
      const r = state.recipes.find((x) => x.id === rowId);
      if (r) openRecipeEditor(r.type, r);
      break;
    }
    case 'newRecipe': openRecipeEditor(ui.view); break;
    case 'catUp':
    case 'catDown': {
      const idx = state.categories.findIndex((c) => c.id === rowId);
      const j = act === 'catUp' ? idx - 1 : idx + 1;
      if (idx < 0 || j < 0 || j >= state.categories.length) return;
      [state.categories[idx], state.categories[j]] = [state.categories[j], state.categories[idx]];
      commit();
      break;
    }
    case 'catRename': {
      const c = catById(rowId);
      const name = c && await askText('Kategorie umbenennen', c.name);
      if (name) { c.name = name; commit(); }
      break;
    }
    case 'catDelete': {
      const c = catById(rowId);
      if (!c || c.id === 'other') return;
      if (!(await confirmDialog(`Kategorie „${c.name}“ löschen? Artikel darin landen unter „Sonstiges“.`, 'Löschen', true))) return;
      state.categories = state.categories.filter((x) => x.id !== c.id);
      state.lists.forEach((l) => l.items.forEach((i) => { if (i.cat === c.id) i.cat = 'other'; }));
      Object.keys(state.learned).forEach((k) => { if (state.learned[k] === c.id) delete state.learned[k]; });
      commit();
      break;
    }
    case 'suggestManage': openSuggestManager(); break;
    case 'catAdd': {
      const name = await askText('Neue Kategorie', '', 'z. B. Asia-Regal');
      if (!name) return;
      const otherIdx = state.categories.findIndex((c) => c.id === 'other');
      state.categories.splice(otherIdx < 0 ? state.categories.length : otherIdx, 0, { id: uid(), name });
      commit();
      break;
    }
    case 'backupNow': await shareBackup(); break;
    case 'backupDownload': downloadBackup(); break;
    case 'backupLater':
      state.backup.snoozeUntil = Date.now() + DAY;
      commit();
      toast('Erinnerung morgen wieder');
      break;
    case 'backupExport': {
      const data = JSON.stringify(state);
      try {
        await navigator.clipboard.writeText(data);
        toast('Backup in die Zwischenablage kopiert');
      } catch (err) {
        openDialog(`<h3>Backup</h3><p class="muted">Text markieren und kopieren:</p>
          <textarea class="input backup" readonly>${esc(data)}</textarea>
          <div class="btn-row"><button class="btn primary" data-x>Fertig</button></div>`,
        (box, done) => { $('[data-x]', box).onclick = () => done(null); });
      }
      break;
    }
    case 'backupImport': {
      const text = await openDialog(`<h3>Backup wiederherstellen</h3>
        <p class="muted">Füge den Backup-Text ein. Achtung: Alle aktuellen Daten werden ersetzt.</p>
        <textarea class="input backup" placeholder="Backup hier einfügen"></textarea>
        <div class="btn-row"><button class="btn ghost" data-x>Abbrechen</button><button class="btn danger" data-ok>Wiederherstellen</button></div>`,
      (box, done) => {
        $('[data-x]', box).onclick = () => done(null);
        $('[data-ok]', box).onclick = () => done($('textarea', box).value);
      });
      if (!text) return;
      try {
        restoreFromText(text);
        toast('Backup wiederhergestellt');
      } catch (err) {
        toast('Ungültiges Backup');
      }
      break;
    }
    default: break;
  }
});

save(); // Migrationen (z. B. importierte Rezepte) direkt sichern
render();

// Offline-Unterstützung
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
