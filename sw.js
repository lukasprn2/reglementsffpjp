const VERSION = "v1.0.2";
const CACHE_NAME = "petanque-cache-" + VERSION;

// Détecte le chemin de base dynamiquement (compatible GitHub Pages)
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');

const ASSETS = [
  BASE_PATH + "/",
  BASE_PATH + "/index.html",
  BASE_PATH + "/manifest.json",
  BASE_PATH + "/reglements.json"
];

// INSTALLATION
self.addEventListener("install", event => {
  console.log("SW installé version:", VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
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
  self.clients.claim();
});

// FETCH — réseau d'abord, cache en fallback, ne stocke que les réponses valides
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
