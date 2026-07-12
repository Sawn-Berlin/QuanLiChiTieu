// sw.js - Service Worker cho PWA
const CACHE_NAME = 'spending-app-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'renderer.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Cài đặt cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache đã được mở');
        return cache.addAll(urlsToCache);
      })
  );
});

// Lấy dữ liệu từ cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Cập nhật cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});