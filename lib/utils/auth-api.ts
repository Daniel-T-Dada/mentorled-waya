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
        const response = await fetch(getApiUrl('/api/users/token/refresh/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh: refreshToken
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                ok: true,
                accessToken: data.access,
                refreshToken: data.refresh || refreshToken // Some APIs return new refresh token
            };
        } else {
            console.error('Token refresh failed:', response.status, await response.text());
            return { ok: false };
        }
    } catch (error) {
        console.error('Token refresh request failed:', error);
        return { ok: false };
    }
}
