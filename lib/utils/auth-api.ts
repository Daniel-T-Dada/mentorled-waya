/**
 * Authenticated API utilities with automatic token refresh
 */

import { getSession, signOut } from "next-auth/react";
import { getApiUrl } from './api';

interface ApiResponse<T = any> {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}

/**
 * Make an authenticated API call with automatic token refresh
 */
export async function authenticatedFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const session = await getSession();

    if (!session?.user?.accessToken) {
        return {
            ok: false,
            status: 401,
            error: 'No access token available'
        };
    }

    // First attempt with current access token
    const response = await makeRequest(endpoint, options, session.user.accessToken);

    if (response.status === 401 && session.user.refreshToken) {
        // Token expired, attempt to refresh
        console.log('Access token expired, attempting refresh...');

        try {
            const refreshResponse = await refreshAccessToken(session.user.refreshToken);

            if (refreshResponse.ok && refreshResponse.accessToken) {
                // Update session with new token 
                console.log('Token refreshed successfully, retrying request...');

                // Retry the original request with new token
                return await makeRequest(endpoint, options, refreshResponse.accessToken);
            }
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
        }

        // If refresh fails, sign out the user
        console.warn('Token refresh failed, signing out user...');
        await signOut({ redirect: true, callbackUrl: '/auth/signin' });

        return {
            ok: false,
            status: 401,
            error: 'Authentication failed - please sign in again'
        };
    }

    return response as ApiResponse<T>;
}

/**
 * Make the actual HTTP request
 */
async function makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    accessToken: string
): Promise<ApiResponse<T>> {
    try {
        const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                ...options.headers,
            },
        });

        if (response.ok) {
            const data = response.status === 204 ? null : await response.json();
            return {
                ok: true,
                status: response.status,
                data
            };
        } else {
            const errorText = await response.text();
            return {
                ok: false,
                status: response.status,
                error: errorText || `HTTP ${response.status}`
            };
        }
    } catch (error) {
        console.error('API request failed:', error);
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
    ok: boolean;
    accessToken?: string;
    refreshToken?: string;
}> {
    try {
        // Note: This endpoint might not exist in the current backend
        // Check API documentation and update if needed
        const response = await fetch(getApiUrl('/api/users/token/refresh/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            },
            cache: 'no-store',
            body: JSON.stringify({
                refresh: refreshToken
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token refreshed successfully');
            return {
                ok: true,
                accessToken: data.access || data.token, // Handle different response formats
                refreshToken: data.refresh || refreshToken // Some APIs return new refresh token
            };
        } else {
            const errorText = await response.text();
            console.error('Token refresh failed:', response.status, errorText);
            return { ok: false };
        }
    } catch (error) {
        console.error('Token refresh request failed:', error);
        return { ok: false };
    }
}

/**
 * Token utility functions
 */
export const TokenUtils = {
    /**
     * Check if a JWT token is expired
     */
    isTokenExpired: (token?: string): boolean => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    },

    /**
     * Get token expiry time
     */
    getTokenExpiry: (token?: string): Date | null => {
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return new Date(payload.exp * 1000);
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    },

    /**
     * Check if token will expire within specified minutes
     */
    willExpireSoon: (token?: string, minutesThreshold = 5): boolean => {
        const expiry = TokenUtils.getTokenExpiry(token);
        if (!expiry) return true;

        const now = new Date();
        const diffInMinutes = (expiry.getTime() - now.getTime()) / (1000 * 60);
        return diffInMinutes <= minutesThreshold;
    }
};
