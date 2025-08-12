const CACHE_NAME = `booker-${new Date().getTime()}`;
const STATIC_CACHE_NAME = 'booker-static-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Cache statique ouvert');
        return cache.addAll(urlsToCache);
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache dynamique ouvert');
      })
    ]).then(() => {
      // Force le nouveau service worker à devenir actif immédiatement
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle de tous les clients immédiatement
      self.clients.claim(),
      // Informer les clients de la mise à jour
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE'
          });
        });
      })
    ])
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Stratégie stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Mise en cache de la nouvelle réponse
          if (networkResponse && networkResponse.status === 200) {
            const cache = caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          // En cas d'erreur réseau, retourner la page hors ligne pour les requêtes de document
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          throw error;
        });

      // Retourner la réponse en cache immédiatement si disponible,
      // sinon attendre la réponse réseau
      return cachedResponse || fetchPromise;
    })
  );
});

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 