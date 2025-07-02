/**
 * Get the base API URL from environment variables
 */
export const getBaseApiUrl = () => {
    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }    // Use the same backend URL for both development and production
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
    RESEND_VERIFICATION_EMAIL: '/api/users/resend-email/',
    GOOGLE_SOCIAL_LOGIN: '/api/users/social-login/google/',

    // Children endpoints
    CREATE_CHILD: '/api/children/create/',
    LIST_CHILDREN: '/api/children/list/',
    CHILD_DETAIL: '/api/children/:childId/',
    UPDATE_CHILD: '/api/children/:childId/update/',
    DELETE_CHILD: '/api/children/:childId/delete/',
    CHILD_LOGIN: '/api/children/login/',

    // Task/Chore endpoints - Updated to match latest backend
    CREATE_TASK: '/api/taskmaster/chores/create/',
    LIST_TASKS: '/api/taskmaster/chores/',
    TASK_DETAIL: '/api/taskmaster/chores/:taskId/',
    UPDATE_TASK: '/api/taskmaster/chores/:taskId/',
    UPDATE_TASK_STATUS: '/api/taskmaster/chores/:taskId/status/',
    DELETE_TASK: '/api/taskmaster/chores/:taskId/',
    CHORE_SUMMARY: '/api/taskmaster/chores/summary/',

    // Child Task endpoints (for children to view and update their own tasks)
    CHILD_CHORES: '/api/taskmaster/children/chores/',
    CHILD_CHORE_STATUS: '/api/taskmaster/children/chores/:taskId/status/',

    // Family Wallet endpoints - Updated to match latest backend structure
    WALLET: '/api/familywallet/wallet/',
    WALLET_DASHBOARD_STATS: '/api/familywallet/wallet/dashboard_stats/',
    WALLET_ADD_FUNDS: '/api/familywallet/wallet/add_funds/',
    WALLET_EARNINGS_CHART: '/api/familywallet/wallet/earnings_chart_data/',
    WALLET_SAVINGS_BREAKDOWN: '/api/familywallet/wallet/savings_breakdown/',
    WALLET_TRANSFER: '/api/familywallet/wallet/transfer/',
    CHILDREN_WALLETS: '/api/familywallet/child-wallets/',
    CHILDREN_WALLETS_ANALYSIS: '/api/familywallet/child-wallets/analysis/',

    // Transaction endpoints
    TRANSACTIONS: '/api/familywallet/transactions/',
    TRANSACTION_DETAIL: '/api/familywallet/transactions/:transactionId/',
    TRANSACTION_COMPLETE: '/api/familywallet/transactions/:transactionId/complete/',
    TRANSACTION_CANCEL: '/api/familywallet/transactions/:transactionId/cancel/',
    TRANSACTIONS_COMPLETE_MULTIPLE: '/api/familywallet/transactions/complete_multiple/',
    TRANSACTIONS_RECENT: '/api/familywallet/transactions/recent_activities/',

    // Allowance endpoints
    CREATE_ALLOWANCE: '/api/familywallet/allowances/',
    ALLOWANCES: '/api/familywallet/allowances/',
    ALLOWANCE_DETAIL: '/api/familywallet/allowances/:allowanceId/',

    // Insight Tracker endpoints
    INSIGHT_DASHBOARD: '/api/insighttracker/dashboard/',

    // Settings endpoints
    USER_PROFILE: '/api/settings_waya/profile/',
    CHILD_PROFILE: '/api/settings_waya/children/:childId/profile/', // Note: Backend uses <int:child_id>
    SETTINGS_RESET_PASSWORD: '/api/settings_waya/reset-password/',
    NOTIFICATION_SETTINGS: '/api/settings_waya/notifications/',
    REWARD_SETTINGS: '/api/settings_waya/rewards/',

    // Legacy endpoints (for backward compatibility)
    ACTIVITIES: '/api/activities', // Non-existent in backend - should be INSIGHT_DASHBOARD
    NOTIFICATIONS: '/api/parents/notifications', // Non-existent in backend
    CHORES: '/api/taskmaster/chores/', // Legacy - use LIST_TASKS instead
    RESEND_VERIFICATION: '/api/resend-verification', // Legacy - use RESEND_VERIFICATION_EMAIL
} as const;