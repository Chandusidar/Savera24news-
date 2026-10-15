/**
 * Savera 24 News - Service Worker
 * Provides offline caching, network-first strategy for live news,
 * safe update handling, and asset precaching.
 */

const CACHE_NAME = 'savera24-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do NOT cache non-GET requests or private/payment data
  if (event.request.method !== 'GET') return;
  if (url.pathname.includes('/auth') || url.pathname.includes('/checkout') || url.pathname.includes('/payment')) {
    return;
  }

  // Live News Feed / API Requests: Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/') || url.hostname.includes('blogger.com') || url.hostname.includes('savera24news.in')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline JSON if API feed fails completely
          if (url.pathname.startsWith('/api/')) {
            return new Response(JSON.stringify({ error: 'offline', feed: { entry: [] } }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return new Response('Offline: Content unavailable without network connection.', { status: 503 });
        })
    );
    return;
  }

  // App Shell & Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
