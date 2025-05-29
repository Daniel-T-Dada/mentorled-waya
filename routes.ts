/*
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 * @type {string[]}

*/

export const publicRoutes = [
    '/',
    '/about',
    '/features',
    '/contact',
    '/auth/verify-email',
    '/manifest.json',
    '/site.webmanifest',
    '/sw.js',
    '/workbox-*.js',
    '/worker-*.js',
    '/fallback-*.js',
    '/not-found',
    '/offline'
]

/**
 * An array of routes that are used for authentication.
 * These routes will redirect logged in users to /dashboard/parents or /dashboard/kids.
 * And if not logged in, they are redirected ot the login page
 * @type {string[]}

*/
export const authRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/error'
]

/** 
 * The prefix for API authentication routes.
 * Routes that start with this prefix are used for API authentiation purposes.
 * And does not need to be protected
 * @type {string}

*/
export const apiAuthPrefix = '/api/auth'


/*
 * The default redirect path after a successful login.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/dashboard/parents'