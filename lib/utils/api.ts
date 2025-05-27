/**
 * Get the base API URL from environment variables
 */
export const getBaseApiUrl = () => {
    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Use Django backend by default, but allow Node backend as fallback
    return process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000'  // Django backend
        : 'http://localhost:3001'; // Node backend
};

/**
 * Construct a full API URL with the given endpoint
 */
export const getApiUrl = (endpoint: string) => {
    const baseUrl = getBaseApiUrl();
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
    ACTIVITIES: '/api/activities',
    WALLET: '/api/parents/wallet',
    TRANSACTIONS: '/api/parents/wallet/transactions',
    NOTIFICATIONS: '/api/parents/notifications',
    CHORES: '/api/chores',
    ALLOWANCES: '/api/allowances',
    PARENT_KIDS: '/api/parent/:parentId/kids',
    CREATE_KID: '/api/create-kid',
    RESEND_VERIFICATION: '/api/resend-verification',
    SIGNUP: '/api/register',
    VERIFY_EMAIL: '/api/email-verify',
    LOGIN: '/api/login',
} as const; 