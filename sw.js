// Shopit offline support.
// App-Dateien: zuerst Netzwerk (damit Updates automatisch ankommen),
// ohne Verbindung aus dem Cache.
const CACHE = 'shopit-v6';
const ASSETS = [
  './', './index.html', './style.css', './categories.js', './recipes-vegan.js', './import.js', './ocr.js', './app.js',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
];
const NETWORK_TIMEOUT = 3500;
const SHARE_CACHE = 'shopit-share';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('shopit-') && k !== CACHE && k !== SHARE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((r) => { clearTimeout(t); resolve(r); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then((res) => {
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  });
  try {
    return await withTimeout(network, NETWORK_TIMEOUT);
  } catch (e) {
    const hit = await cache.match(request, { ignoreSearch: true })
      || (request.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (hit) return hit;
    return network;
  }
}

// Teilen → Shopit (Android): Bilder kommen per POST. Sie werden kurz
// zwischengespeichert, danach öffnet sich die App und liest sie aus.
async function handleShare(request) {
  const back = new URL('./', self.registration.scope);
  try {
    const form = await request.formData();
    for (const key of ['title', 'text', 'url']) {
      const v = form.get(key);
      if (v) back.searchParams.set(key, String(v));
    }
    const images = form.getAll('images').filter((f) => f && typeof f !== 'string' && f.size);
    if (images.length) {
      const cache = await caches.open(SHARE_CACHE);
      await Promise.all(images.slice(0, 10).map((f, i) => cache.put(`./shared-image-${i}`, new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } }))));
      back.searchParams.set('shared-images', String(Math.min(images.length, 10)));
    }
  } catch (e) { /* ungültige Daten: App trotzdem öffnen */ }
  return Response.redirect(back.href, 303);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method === 'POST' && url.origin === self.location.origin && url.pathname.endsWith('/share-target')) {
    event.respondWith(handleShare(req));
    return;
  }
  if (req.method !== 'GET') return;
  if (url.origin === self.location.origin) event.respondWith(networkFirst(req));
});
