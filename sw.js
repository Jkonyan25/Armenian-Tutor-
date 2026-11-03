/* Offline support: cache the app shell, cache audio as it is played. */
const VERSION = 'armenian-tutor-v2';
const SHELL = [
  './', 'index.html', 'css/styles.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png',
  'js/data.js', 'js/audio-manifest.js', 'js/config.js', 'js/core.js', 'js/audio.js', 'js/cloud.js',
  'js/exercises.js', 'js/lesson.js', 'js/account.js', 'js/views.js', 'js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// App files: network first (so updates show up right away), cache when offline.
// Audio and fonts: cache first (they never change).
// Account requests to Supabase are never touched.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;
  const cacheFirst = fonts || url.pathname.includes('/audio/');
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: sameOrigin });
    if (cacheFirst && cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }));
});
