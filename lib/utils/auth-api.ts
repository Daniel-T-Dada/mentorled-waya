import { getSession, signOut, signIn } from "next-auth/react";
import { getApiUrl } from './api';

export async function authenticatedFetch<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    const refreshToken = session?.user?.refreshToken;

    const doFetch = async (token: string) => {
        const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            cache: 'no-store'
        });
    };

    let response = await doFetch(accessToken!);

    if (response.status === 401 && refreshToken) {
        const refreshResp = await fetch(getApiUrl('/api/users/token/refresh/'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
            credentials: 'include',
            cache: 'no-store'
        });
        if (refreshResp.ok) {
            const data = await refreshResp.json();
            const newAccessToken = data.access || data.token;
            const newRefreshToken = data.refresh || refreshToken;
            await signIn("credentials", {
                redirect: false,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
            response = await doFetch(newAccessToken);
        } else {
            await signOut({ redirect: true, callbackUrl: '/auth/signin' });
            return {
                ok: false,
                status: 401,
                error: 'Session expired, please sign in again'
            };
        }
    }

    let responseData: T | undefined = undefined;
    try {
        if (response.status !== 204) {
            responseData = await response.json();
        }
    } catch { }

    return {
        ok: response.ok,
        status: response.status,
        data: responseData,
        error: !response.ok ? responseData as any || `HTTP ${response.status}` : undefined,
    };
}