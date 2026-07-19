const CACHE_NAME = 'sql-wiki-v135';
const urlsToCache = [
  './',  './css/style.css',
  './css/chat.css',
  './css/messenger.css',
  './js/theme.js',
  './js/mobile.js',
  './js/search.js',
  './js/messenger-core.js',
  './js/erd-drag.js',
  './js/interactive.js',
  './js/sql-sandbox.js',
  './js/toc.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Bỏ qua các request có query string v=... để lấy mới
  if (event.request.url.indexOf('?v=') !== -1) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
