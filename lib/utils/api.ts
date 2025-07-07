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
 * Base URL: /api/
 * Authentication: Most endpoints require JWT token in Authorization header
 * Permissions: Parent/Child role-based access control implemented
 * 
 * Categories:
 * - Authentication & User Management
 * - Children Management  
 * - Task/Chore Management
 * - Family Wallet & Transactions
 * - MoneyMaze Educational System
 * - Analytics & Insights
 * - Notifications
 * - Settings (Currently not accessible - requires URL config)
 */
export const API_ENDPOINTS = {
    // Authentication endpoints
    SIGNUP: '/api/users/register/',
    LOGIN: '/api/users/login/',
    TOKEN_REFRESH: '/api/auth/token/refresh/', // Standard djangorestframework-simplejwt endpoint
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

    // Additional Family Wallet endpoints
    WALLET_SUMMARY: '/api/familywallet/wallet/wallet_summary/',
    WALLET_REWARD_BAR_CHART: '/api/familywallet/wallet/reward_bar_chart/',
    WALLET_REWARD_PIE_CHART: '/api/familywallet/wallet/reward_pie_chart/',
    WALLET_SET_PIN: '/api/familywallet/wallet/set_pin/',
    WALLET_MAKE_PAYMENT: '/api/familywallet/wallet/make_payment/',

    // Insight Tracker endpoints
    INSIGHT_DASHBOARD: '/api/insighttracker/dashboard/',
    INSIGHT_CHORES: '/api/insighttracker/chores/insights/',

    // MoneyMaze (Educational) endpoints
    MONEYMAZE_CONCEPTS: '/api/moneymaze/concepts/',
    MONEYMAZE_CONCEPTS_PROGRESS: '/api/moneymaze/concepts/progress/',
    MONEYMAZE_QUIZ_DETAIL: '/api/moneymaze/quizzes/:quizId/',
    MONEYMAZE_QUIZ_SUBMIT: '/api/moneymaze/quizzes/submit/',
    MONEYMAZE_REWARDS: '/api/moneymaze/rewards/',
    MONEYMAZE_DASHBOARD: '/api/moneymaze/dashboard/',

    // MoneyMaze Admin endpoints
    MONEYMAZE_ADMIN_CONCEPTS: '/api/moneymaze/admin/concepts/',
    MONEYMAZE_ADMIN_QUIZZES: '/api/moneymaze/admin/quizzes/',
    MONEYMAZE_ADMIN_QUESTIONS: '/api/moneymaze/admin/questions/',
    MONEYMAZE_ADMIN_ANSWER_CHOICES: '/api/moneymaze/admin/answer-choices/',
    MONEYMAZE_ADMIN_REWARDS: '/api/moneymaze/admin/rewards/',

    // ChoreQuest (Child Interface) endpoints
    CHOREQUEST_CHORES: '/api/chorequest/chores/',
    CHOREQUEST_CHORE_STATUS: '/api/chorequest/chores/:choreId/status/',
    CHOREQUEST_CHORE_REDEEM: '/api/chorequest/chores/:choreId/redeem/',

    // Notifications endpoints
    NOTIFICATIONS_LIST: '/api/parents/notifications/',
    NOTIFICATIONS_PROFILE: '/api/parents/notifications/profile/',
    NOTIFICATIONS_CHILD_PROFILE: '/api/parents/notifications/children/:childId/profile/',
    NOTIFICATIONS_RESET_PASSWORD: '/api/parents/notifications/reset-password/',
    NOTIFICATIONS_REWARDS: '/api/parents/notifications/rewards/',
    NOTIFICATIONS_MARK_READ: '/api/parents/notifications/:notificationId/read/',

    // Settings endpoints (Note: Currently not accessible - requires URL config update)
    USER_PROFILE: '/api/settings_waya/profile/',
    CHILD_PROFILE: '/api/settings_waya/children/:childId/profile/', // Note: Backend uses <int:child_id>
    SETTINGS_RESET_PASSWORD: '/api/settings_waya/reset-password/',
    NOTIFICATION_SETTINGS: '/api/settings_waya/notification-settings/',
    REWARD_SETTINGS: '/api/settings_waya/reward-settings/',

} as const;

/**
 * Helper function to replace URL parameters in endpoint paths
 * @param endpoint - The endpoint path with parameters (e.g., '/api/chores/:choreId/')
 * @param params - Object containing parameter values (e.g., { choreId: '123' })
 * @returns The endpoint path with parameters replaced
 */
export const replaceUrlParams = (endpoint: string, params: Record<string, string | number>) => {
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value));
    });
    return url;
};

/**
 * Helper function to build full API URL with parameters replaced
 * @param endpoint - The endpoint path with parameters
 * @param params - Object containing parameter values
 * @returns Full API URL with parameters replaced
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
    const finalEndpoint = params ? replaceUrlParams(endpoint, params) : endpoint;
    return getApiUrl(finalEndpoint);
};

/**
 * MoneyMaze specific endpoint helpers
 */
export const MoneyMazeEndpoints = {
    getQuizDetail: (quizId: string) => buildApiUrl(API_ENDPOINTS.MONEYMAZE_QUIZ_DETAIL, { quizId }),
    getConcepts: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_CONCEPTS),
    getConceptsProgress: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_CONCEPTS_PROGRESS),
    submitQuiz: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_QUIZ_SUBMIT),
    getRewards: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_REWARDS),
    getDashboard: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_DASHBOARD),

    // Admin endpoints
    admin: {
        createConcept: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_ADMIN_CONCEPTS),
        createQuiz: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_ADMIN_QUIZZES),
        createQuestion: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_ADMIN_QUESTIONS),
        createAnswerChoice: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_ADMIN_ANSWER_CHOICES),
        createReward: () => buildApiUrl(API_ENDPOINTS.MONEYMAZE_ADMIN_REWARDS),
    }
};

/**
 * ChoreQuest specific endpoint helpers
 */
export const ChoreQuestEndpoints = {
    getChores: () => buildApiUrl(API_ENDPOINTS.CHOREQUEST_CHORES),
    updateChoreStatus: (choreId: string) => buildApiUrl(API_ENDPOINTS.CHOREQUEST_CHORE_STATUS, { choreId }),
    redeemChore: (choreId: string) => buildApiUrl(API_ENDPOINTS.CHOREQUEST_CHORE_REDEEM, { choreId }),
};

/**
 * Family Wallet specific endpoint helpers
 */
export const WalletEndpoints = {
    getWallet: () => buildApiUrl(API_ENDPOINTS.WALLET),
    getDashboardStats: () => buildApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS),
    getEarningsChart: () => buildApiUrl(API_ENDPOINTS.WALLET_EARNINGS_CHART),
    getSavingsBreakdown: () => buildApiUrl(API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN),
    getRewardBarChart: () => buildApiUrl(API_ENDPOINTS.WALLET_REWARD_BAR_CHART),
    getRewardPieChart: () => buildApiUrl(API_ENDPOINTS.WALLET_REWARD_PIE_CHART),
    addFunds: () => buildApiUrl(API_ENDPOINTS.WALLET_ADD_FUNDS),
    transfer: () => buildApiUrl(API_ENDPOINTS.WALLET_TRANSFER),
    setPin: () => buildApiUrl(API_ENDPOINTS.WALLET_SET_PIN),
    makePayment: () => buildApiUrl(API_ENDPOINTS.WALLET_MAKE_PAYMENT),
};

/**
 * Cache management utilities
 */
export const CacheUtils = {
    /**
     * Clear all browser caches (useful for troubleshooting authentication issues)
     */
    clearAllCaches: async () => {
        if (typeof window !== 'undefined') {
            // Clear service worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }

            // Clear localStorage
            localStorage.clear();

            // Clear sessionStorage
            sessionStorage.clear();

            console.log('All caches cleared');
        }
    },

    /**
     * Force refresh service worker
     */
    refreshServiceWorker: async () => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                console.log('Service worker refreshed');
            }
        }
    },

    /**
     * Check if response is valid JSON
     */
    isJsonResponse: (response: Response) => {
        const contentType = response.headers.get('content-type');
        return contentType && contentType.includes('application/json');
    }
};

/**
 * Enhanced fetch wrapper with better error handling for authentication
 */
export const authFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            ...options.headers,
        },
        cache: 'no-store',
        credentials: 'include',
    });

    // Check if response is actually JSON before parsing
    if (!CacheUtils.isJsonResponse(response)) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            responseText: responseText.substring(0, 200) + '...'
        });
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
    }

    return response;
};

/**
 * Common endpoint patterns used throughout the app
 */
export const EndpointPatterns = {
    // Pattern for detail endpoints that require an ID
    getDetailEndpoint: (baseEndpoint: string, id: string) =>
        buildApiUrl(baseEndpoint.replace(':id', id) || `${baseEndpoint}${id}/`),

    // Pattern for status update endpoints
    getStatusEndpoint: (baseEndpoint: string, id: string) =>
        buildApiUrl(baseEndpoint, { id }),

    // Pattern for child-specific endpoints
    getChildEndpoint: (baseEndpoint: string, childId: string) =>
        buildApiUrl(baseEndpoint, { childId }),
};