'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {




            // First unregister any existing service workers
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (const registration of registrations) {
                    registration.unregister().then(() => {
                        console.log('Service Worker unregistered');
                    }).catch(error => {
                        console.error('Service Worker unregistration failed:', error);
                    });
                }




                // Then register the new service worker
                window.addEventListener('load', function () {
                    navigator.serviceWorker
                        .register('/sw.js')
                        .then(function (registration) {
                            console.log('Service Worker registered with scope:', registration.scope);
                        })
                        .catch(function (error) {
                            console.error('Service Worker registration failed:', error);
                        });



                        
                });
            });
        }
    }, []);

    return null;
} 