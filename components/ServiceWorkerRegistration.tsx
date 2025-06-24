'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker on load
            window.addEventListener('load', function () {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then(function (registration) {
                        console.log('Service Worker registered with scope:', registration.scope);

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        // New version available, show update prompt
                                        console.log('New service worker version available');
                                    }
                                });
                            }
                        });
                    })
                    .catch(function (error) {
                        console.error('Service Worker registration failed:', error);
                    });
            });

            // Listen for service worker messages
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'SKIP_WAITING') {
                    window.location.reload();
                }
            });
        }
    }, []);

    return null;
}