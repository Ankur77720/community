// Service Worker code (service-worker.js)
const cacheName = 'your-pwa-cache-v1';
const cacheFiles = [
  '/', // Add the root URL of your PWA
  '/offline', // Add the offline page
  // Add JavaScript files
  // Add other static assets like images, fonts, etc.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(cacheFiles);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== cacheName)
            .map(name => caches.delete(name))
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response since it can only be consumed once
        const clonedResponse = response.clone();

        caches.open(cacheName)
          .then(cache => {
            cache.put(event.request, clonedResponse);
          });

        return response;
      })
      .catch(() => {
        // If the request fails, return the offline page
        return caches.match('/offline');
      })
  );
});
