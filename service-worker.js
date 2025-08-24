const CACHE = 'polished-diction-v1';
const ASSETS = [
  './polished_diction_pwa.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (ASSETS.some(a => url.pathname.endsWith(a.replace('./','/')))) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  } else {
    e.respondWith(
      fetch(e.request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, respClone)).catch(()=>{});
        return resp;
      }).catch(() => caches.match(e.request))
    );
  }
});
