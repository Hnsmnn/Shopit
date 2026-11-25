// Shopit offline support.
// App-Dateien: zuerst Netzwerk (damit Updates automatisch ankommen),
// ohne Verbindung aus dem Cache.
const CACHE = 'shopit-v4';
const ASSETS = [
  './', './index.html', './style.css', './categories.js', './recipes-vegan.js', './import.js', './app.js',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
];
const NETWORK_TIMEOUT = 3500;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('shopit-') && k !== CACHE).map((k) => caches.delete(k))))
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin === self.location.origin) event.respondWith(networkFirst(req));
});
