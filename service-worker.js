const CACHE_NAME = 'bakers-hut-cache-v3.2';
const ASSETS_TO_CACHE = [
  '/',
  // '/index.html',
  // '/assets/css/style.css',
  // '/assets/js/main.js',
  // '/manifest.json',
  // '/views/sales.html',
  // '/views/items.html',
  // '/views/restock.html',
  // '/views/expenses.html',
  // '/views/reports.html'
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