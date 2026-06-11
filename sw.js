const CACHE_NAME = 'muscle-pain-v1';
const URLS_TO_CACHE = [
  '/',
  '/muscle-pain-checker/',
  '/muscle-pain-checker/index.html',
  '/muscle-pain-checker/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log('Cache add failed (offline during install is ok)');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if(name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return new Response('Offline - service unavailable', {status: 503});
      });
    })
  );
});
