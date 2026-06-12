/* Ward 54 INC — service worker
 * Strategy:
 *   - App shell (HTML, manifest, icons): cache-first, refreshed in background.
 *   - Data (cms.json, voter part JSON): network-first, fall back to cache
 *     so the app still opens offline with the last-seen data.
 * Bump CACHE_VERSION on every meaningful release to invalidate old caches.
 */
const CACHE_VERSION = 'ward54-v86';
const SHELL_CACHE = CACHE_VERSION + '-shell';
const DATA_CACHE  = CACHE_VERSION + '-data';

/* Core files that make the app open offline. Relative to the SW scope. */
const SHELL_ASSETS = [
  './',
  './index.html',
  './admin.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {/* ignore individual 404s during install */})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* Allow a freshly-installed worker to take over immediately when the page
   asks it to (belt-and-suspenders alongside skipWaiting() in install). */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isDataRequest(url) {
  return url.pathname.includes('/data/') && url.pathname.endsWith('.json');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Only handle same-origin requests; let the network handle CDNs, GitHub API, etc. */
  if (url.origin !== self.location.origin) return;

  /* Data: network-first → cache fallback */
  if (isDataRequest(url)) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(DATA_CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  /* Navigations (the HTML itself): NETWORK-FIRST so every page load gets
     the freshest code when online. We also refresh the cached copy so an
     offline open still serves the last-known-good HTML. This guarantees
     a reload always lands on the latest deploy — never stale JS. */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  /* Everything else (shell, icons, css/js inlined in HTML): cache-first,
     then revalidate in the background. */
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
