/**
 * Authentication utilities for handling provider switches and session cleanup
 */

export function clearAuthCache() {
    if (typeof window !== 'undefined') {
        // Clear any stored authentication data
        localStorage.removeItem('auth-provider');
        sessionStorage.removeItem('auth-provider');

        // Clear any cached authentication responses
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('auth') || cacheName.includes('session')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }
}

export function setAuthProvider(provider: 'google' | 'facebook' | 'credentials') {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth-provider', provider);
    }
}

export function getAuthProvider(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth-provider');
    }
    return null;
}

export function handleProviderSwitch(newProvider: 'google' | 'facebook' | 'credentials') {
    const currentProvider = getAuthProvider();

    if (currentProvider && currentProvider !== newProvider) {
        // User is switching providers - clear cache
        clearAuthCache();
        console.log(`Switching from ${currentProvider} to ${newProvider} - clearing auth cache`);
    }

    setAuthProvider(newProvider);
}

export function clearAllAuthData() {
    if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('auth-provider');
        localStorage.removeItem('nextauth.message');

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear all auth-related cookies
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.includes('next-auth') || name.includes('auth') || name.includes('session')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            }
        });

        // Clear service worker caches
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }
    }
}
