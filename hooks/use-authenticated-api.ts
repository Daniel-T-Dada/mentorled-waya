'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { authenticatedFetch } from '@/lib/utils/auth-api';

interface UseAuthenticatedApiOptions {
    onUnauthorized?: () => void;
    onError?: (error: string) => void;
}

interface ApiCallOptions extends RequestInit {
    endpoint: string;
    showErrors?: boolean;
}

/**
 * Hook for making authenticated API calls with automatic token refresh
 */
export function useAuthenticatedApi(options: UseAuthenticatedApiOptions = {}) {
    const { data: session, status } = useSession();

    const makeAuthenticatedCall = useCallback(async <T = any>({
        endpoint,
        showErrors = true,
        ...fetchOptions
    }: ApiCallOptions) => {
        if (status === 'loading') {
            return { success: false, error: 'Session loading', data: null };
        }

        if (!session?.user?.accessToken) {
            const error = 'No access token available';
            if (showErrors) {
                options.onUnauthorized?.();
            }
            return { success: false, error, data: null };
        }

        try {
            const response = await authenticatedFetch<T>(endpoint, fetchOptions);

            if (response.ok) {
                return { success: true, error: null, data: response.data };
            } else {
                if (response.status === 401) {
                    options.onUnauthorized?.();
                }
                if (showErrors) {
                    options.onError?.(response.error || `HTTP ${response.status}`);
                }
                return { success: false, error: response.error || `HTTP ${response.status}`, data: null };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            if (showErrors) {
                options.onError?.(errorMessage);
            }
            return { success: false, error: errorMessage, data: null };
        }
    }, [session, status, options]);

    return {
        makeAuthenticatedCall,
        isAuthenticated: !!session?.user?.accessToken,
        isLoading: status === 'loading'
    };
}

/**
 * Hook specifically for dashboard data fetching
 */
export function useDashboardApi() {
    return useAuthenticatedApi({
        onUnauthorized: () => {
            console.warn('User session expired, redirecting to login...');
            window.location.href = '/auth/signin';
        },
        onError: (error) => {
            console.error('Dashboard API error:', error);
            // Could show toast notification here
        }
    });
}

/**
 * Hook for wallet operations
 */
export function useWalletApi() {
    return useAuthenticatedApi({
        onUnauthorized: () => {
            console.warn('Authentication required for wallet operations');
            window.location.href = '/auth/signin';
        },
        onError: (error) => {
            console.error('Wallet API error:', error);
        }
    });
}

/**
 * Hook for chore management
 */
export function useChoreApi() {
    return useAuthenticatedApi({
        onUnauthorized: () => {
            console.warn('Authentication required for chore management');
            window.location.href = '/auth/signin';
        },
        onError: (error) => {
            console.error('Chore API error:', error);
        }
    });
}