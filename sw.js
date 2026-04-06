const VERSION = "v1.0.1"; // 👈 CHANGE JUSTE ÇA pour forcer une mise à jour

const CACHE_NAME = "petanque-cache-" + VERSION;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// INSTALLATION
self.addEventListener("install", event => {
  console.log("SW installé version:", VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting(); // 👈 active direct la nouvelle version
});

// ACTIVATION
self.addEventListener("activate", event => {
  console.log("SW activé version:", VERSION);

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Suppression ancien cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // 👈 prend le contrôle direct
});

// FETCH (cache + réseau)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
