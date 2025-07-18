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

    TOKEN_REFRESH: '/api/users/token/refresh/',
    PASSWORD_CHANGE: '/api/users/password-change/',
    PASSWORD_RESET: '/api/users/password-reset/',
    PASSWORD_RESET_CONFIRM: '/api/users/password-reset-confirm/:uidb64/:token/',
    VERIFY_EMAIL: '/api/users/email-verify/',
    FORGOT_PASSWORD: '/api/users/forgot-password/',
    RESET_PASSWORD_CONFIRM: '/api/users/reset-password-confirm/',
    GOOGLE_SOCIAL_LOGIN: '/api/users/social-login/google/',
    RESEND_VERIFICATION_EMAIL: '/api/users/resend-email/',
    HEALTH_CHECK: '/api/users/',

    // Children endpoints
    CREATE_CHILD: '/api/children/create/',
    LIST_CHILDREN: '/api/children/list/',
    CHILD_DETAIL: '/api/children/:childId/',
    UPDATE_CHILD: '/api/children/:childId/update/',
    DELETE_CHILD: '/api/children/:childId/delete/',
    CHILD_LOGIN: '/api/children/login/',

    // Task/Chore endpoints
    CREATE_TASK: '/api/taskmaster/chores/create/',
    LIST_TASKS: '/api/taskmaster/chores/',
    TASK_DETAIL: '/api/taskmaster/chores/:taskId/',
    UPDATE_TASK: '/api/taskmaster/chores/:taskId/',
    PATCH_TASK: '/api/taskmaster/chores/:taskId/',
    DELETE_TASK: '/api/taskmaster/chores/:taskId/delete/',
    UPDATE_TASK_STATUS: '/api/taskmaster/chores/:taskId/status/',
    CHORE_SUMMARY: '/api/taskmaster/chores/summary/',

    // Child Task endpoints (for children to view and update their own tasks)
    CHILD_CHORES: '/api/chorequest/chorequest/',
    CHILD_CHORE_COMPLETE: '/api/chorequest/chorequest/complete/',
    CHILD_CHORE_REDEEM: '/api/chorequest/chorequest/redeem/',
    CHILD_CHORE_DETAIL: '/api/chorequest/chorequest/:id/',

    // Family Wallet endpoints
    WALLET: '/api/familywallet/wallet/',
    WALLET_DASHBOARD_STATS: '/api/familywallet/wallet/dashboard_stats/',
    WALLET_ADD_FUNDS: '/api/familywallet/wallet/add_funds/',
    WALLET_EARNINGS_CHART: '/api/familywallet/wallet/earnings_chart_data/',
    WALLET_SAVINGS_BREAKDOWN: '/api/familywallet/wallet/savings_breakdown/',
    WALLET_SUMMARY: '/api/familywallet/wallet/wallet_summary/',
    WALLET_TRANSFER: '/api/familywallet/wallet/transfer/',
    WALLET_REWARD_BAR_CHART: '/api/familywallet/wallet/reward_bar_chart/',
    WALLET_REWARD_PIE_CHART: '/api/familywallet/wallet/reward_pie_chart/',
    WALLET_SET_PIN: '/api/familywallet/wallet/set_pin/',
    WALLET_MAKE_PAYMENT: '/api/familywallet/wallet/make_payment/',

    // Child Wallet endpoints
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
    UPDATE_ALLOWANCE: '/api/familywallet/allowances/:allowanceId/',
    PATCH_ALLOWANCE: '/api/familywallet/allowances/:allowanceId/',
    DELETE_ALLOWANCE: '/api/familywallet/allowances/:allowanceId/',

    // Insight Tracker endpoints
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

    // Goal Getter (Child Interface) endpoints
    GOAL_GETTER: '/api/goalgetter/goals/',
    GOALGETTER_PROGRESS: '/api/goalgetter/progress/',
    GOALGETTER_LEADERBOARD: '/api/goalgetter/leaderboard/',
    GOALGETTER_REWARDS: '/api/goalgetter/rewards/',
    CHILD_BAR_CHART: '/api/goalgetter/children/:childId/bar_chart/',
    GOALGETTER_SUMMARY: '/api/goalgetter/goal/summary/',

    // Leaderboard endpoints
    LEADERBOARD: '/api/leaderboard/',
    LEADERBOARD_CHILD: '/api/leaderboard/children/:childId/',
    LEADERBOARD_FAMILY: '/api/leaderboard/family/',

    // EarningMeter endpoints
    EARNINGMETER_TOTALS: '/api/earningmeter/totals/',
    EARNINGMETER_DASHBOARD: '/api/earningmeter/dashboard/',
    EARNINGMETER_SUMMARY: '/api/earningmeter/summary/',

    // Notifications endpoints
    NOTIFICATIONS_LIST: '/api/parents/notifications/',
    NOTIFICATIONS_PROFILE: '/api/parents/notifications/profile/',
    NOTIFICATIONS_CHILD_PROFILE: '/api/parents/notifications/children/:childId/profile/',
    NOTIFICATIONS_RESET_PASSWORD: '/api/parents/notifications/reset-password/',
    NOTIFICATIONS_REWARDS: '/api/parents/notifications/rewards/',
    NOTIFICATIONS_MARK_READ: '/api/parents/notifications/:notificationId/read/',
    // Settings endpoints (settings_waya)
    USER_PROFILE: '/api/settings_waya/profile/',
    CHILD_PROFILE: '/api/settings_waya/children/:childId/',
    SETTINGS_RESET_PASSWORD: '/api/settings_waya/password-reset/',
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
 * Insight Tracker specific endpoint helpers
 */
export const InsightTrackerEndpoints = {
    getChoresInsights: () => buildApiUrl(API_ENDPOINTS.INSIGHT_CHORES),
};

/**
 * Settings specific endpoint helpers
 */
export const SettingsEndpoints = {
    getUserProfile: () => buildApiUrl(API_ENDPOINTS.USER_PROFILE),
    getChildProfile: (childId: string) => buildApiUrl(API_ENDPOINTS.CHILD_PROFILE, { childId }),
    resetPassword: () => buildApiUrl(API_ENDPOINTS.SETTINGS_RESET_PASSWORD),
    getNotificationSettings: () => buildApiUrl(API_ENDPOINTS.NOTIFICATION_SETTINGS),
    getRewardSettings: () => buildApiUrl(API_ENDPOINTS.REWARD_SETTINGS),
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
            // 'Pragma': 'no-cache',
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