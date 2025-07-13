import useSWR, { SWRConfig } from 'swr';

// Global fetcher function using fetch API
export const fetcher = async (url: string) => {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to error object
        (error as any).info = await response.json();
        (error as any).status = response.status;
        throw error;
    }
    return response.json();
};

// Global SWR configuration
export const swrGlobalConfig = {
    fetcher,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    dedupingInterval: 2000,
    onError: (err: unknown, key: string) => {
        // Optionally log errors globally
        if (process.env.NODE_ENV === 'development') {
            console.error('SWR error:', err, 'Key:', key);
        }
    },
};

// Usage: Wrap your app with <SWRConfig value={swrGlobalConfig}> in _app.tsx or layout.tsx
export { useSWR, SWRConfig };
