const CACHE_NAME = 'bakers-hut-cache-v3.2';
const ASSETS_TO_CACHE = [
  '/'
];

// During development, skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Implement network-first strategy with no caching during development
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});