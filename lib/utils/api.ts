/**
 * Get the base API URL from environment variables
 */
export const getBaseApiUrl = () => {
    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Use the same backend URL for both development and production
    return 'https://waya-mentorled.onrender.com';
};

/**
 * Construct a full API URL with the given endpoint
 */
export const getApiUrl = (endpoint: string) => {
    const baseUrl = getBaseApiUrl();
    return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

/**
 * Common API endpoints - Updated to match backend API documentation
 */
export const API_ENDPOINTS = {
    // Authentication endpoints
    SIGNUP: '/api/users/register/',
    LOGIN: '/api/users/login/',
    VERIFY_EMAIL: '/api/users/email-verify/',
    PASSWORD_RESET: '/api/users/password-reset/',
    FORGOT_PASSWORD: '/api/users/forgot-password/',
    PASSWORD_CHANGE: '/api/users/password-change/',
    PASSWORD_RESET_CONFIRM: '/api/users/reset-password-confirm/',
    HEALTH_CHECK: '/api/users/',

    // Children endpoints
    CREATE_CHILD: '/api/children/create/',
    LIST_CHILDREN: '/api/children/list/',
    CHILD_DETAIL: '/api/children/:childId/',
    UPDATE_CHILD: '/api/children/:childId/update/',
    DELETE_CHILD: '/api/children/:childId/delete/',
    CHILD_LOGIN: '/api/children/login/',

    // Task endpoints
    CREATE_TASK: '/api/taskmaster/tasks/create/',
    LIST_TASKS: '/api/taskmaster/tasks/list/',
    TASK_DETAIL: '/api/taskmaster/tasks/:taskId/',
    UPDATE_TASK: '/api/taskmaster/tasks/:taskId/update/',
    UPDATE_TASK_STATUS: '/api/taskmaster/tasks/:taskId/status/',
    DELETE_TASK: '/api/taskmaster/tasks/:taskId/delete/',

    // Legacy endpoints (for backward compatibility)
    ACTIVITIES: '/api/activities',
    WALLET: '/api/parents/wallet',
    TRANSACTIONS: '/api/parents/wallet/transactions',
    NOTIFICATIONS: '/api/parents/notifications',
    CHORES: '/api/chores',
    ALLOWANCES: '/api/allowances',
    PARENT_KIDS: '/api/parent/:parentId/kids',
    CREATE_KID: '/api/create-kid',
    RESEND_VERIFICATION: '/api/resend-verification',
} as const;