// Simple service worker for PWA

const CACHE_NAME = 'waya-cache-v3';

// Add list of files to cache here
const urlsToCache = [
    '/',
    '/offline',
    '/manifest.json',
    '/site.webmanifest',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png'
];

// Icon mapping for 404 icon requests
// const iconRedirects = {
//     '/icons/icon-72x72.png': '/favicon-32x32.png',
//     '/icons/icon-96x96.png': '/favicon-32x32.png',
//     '/icons/icon-128x128.png': '/favicon-32x32.png',
//     '/icons/icon-144x144.png': '/apple-touch-icon.png',
//     '/icons/icon-152x152.png': '/apple-touch-icon.png',
//     '/icons/icon-192x192.png': '/android-chrome-192x192.png',
//     '/icons/icon-384x384.png': '/android-chrome-512x512.png',
//     '/icons/icon-512x512.png': '/android-chrome-512x512.png',
//     '/icons/maskable-icon.png': '/android-chrome-512x512.png'
// };

// Install a service worker
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Handle missing icon files by redirecting to existing ones
    if (iconRedirects[url.pathname]) {
        event.respondWith(
            fetch(new Request(iconRedirects[url.pathname], {
                method: event.request.method,
                headers: event.request.headers,
                mode: event.request.mode,
                credentials: event.request.credentials,
                redirect: event.request.redirect
            }))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Don't cache API responses or dynamic data
                                if (!event.request.url.includes('/api/')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    })
                    .catch(() => {
                        // If fetch fails (e.g., offline), show fallback page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                    });
            })
    );
});

// Update a service worker
self.addEventListener('activate', event => {
    // Delete all caches that aren't named in CACHE_NAME
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
