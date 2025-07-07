// Simple service worker for PWA

const CACHE_NAME = 'waya-cache-v6';

// Add list of files to cache here - EXCLUDE authentication-related paths
const urlsToCache = [
    '/offline',
    '/manifest.json',
    '/site.webmanifest',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/screenshots/screenshot1.png',
    '/screenshots/screenshot2.png',
    // From here sha
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/icons/maskable-icon.png'
];

// Paths that should NEVER be cached (authentication-related)
const NEVER_CACHE_PATHS = [
    '/api/auth',
    '/auth/',
    '/signin',
    '/signup',
    '/api/',
    '/dashboard',
    '/api/users/login',
    '/api/users/register',
    '/api/users/password-reset',
    '/api/users/email-verify'
];

// Helper function to check if a URL should never be cached
function shouldNeverCache(url) {
    return NEVER_CACHE_PATHS.some(path => url.includes(path));
}

// Helper function to check if request is authentication-related
function isAuthRequest(url) {
    return url.includes('/api/auth') ||
        url.includes('/api/users/login') ||
        url.includes('/api/users/register') ||
        url.includes('/signin') ||
        url.includes('/signup');
}

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
    // Skip caching for authentication-related requests with explicit bypassing
    if (shouldNeverCache(event.request.url) || isAuthRequest(event.request.url)) {
        event.respondWith(
            fetch(event.request, {
                cache: 'no-store',
                credentials: event.request.credentials
            })
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

                        // Don't cache authentication-related responses
                        if (shouldNeverCache(event.request.url) || isAuthRequest(event.request.url)) {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Only cache static assets
                                if (!event.request.url.includes('/api/')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    })
                    .catch(() => {
                        // If fetch fails (e.g., offline), show fallback page for navigation requests
                        if (event.request.mode === 'navigate' && !shouldNeverCache(event.request.url)) {
                            return caches.match('/offline');
                        }
                        // For auth-related requests, let them fail normally
                        throw new Error('Network error');
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
