/**
 * Get the base API URL from environment variables
 */
export const getBaseApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
    SIGNUP: '/api/signup',
    VERIFY_EMAIL: '/api/verify-email',
    LOGIN: '/api/login',
} as const; 