
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/hooks/use-authenticated-api';
import { API_ENDPOINTS } from '@/lib/utils/api';

type UseApiQueryProps<T> = {
    endpoint: string;
    queryKey: readonly unknown[];
    enabled?: boolean;
    refetchInterval?: number;
    fetchOptions?: RequestInit;
};

const ZERO_WALLET_STATS = {
    family_wallet_balance: "0",
    total_rewards_sent: "0",
    total_rewards_pending: "0",
    children_count: 0,
    total_children_balance: "0"
};

const DEFAULT_PIN_STATUS = {
    pin_set: false
};

export function useApiQuery<T = any>({
    endpoint,
    queryKey,
    enabled = true,
    refetchInterval,
    fetchOptions,
}: UseApiQueryProps<T>) {
    const { makeAuthenticatedCall } = useAuthenticatedApi();

    return useQuery<T>({
        queryKey,
        queryFn: async () => {
            try {
                const res = await makeAuthenticatedCall({ endpoint, ...fetchOptions });
                if (!res.success) {
                    if (
                        endpoint.includes(API_ENDPOINTS.WALLET_DASHBOARD_STATS) &&
                        res.error === "Family wallet not found"
                    ) {
                        return ZERO_WALLET_STATS as T;
                    }
                    if (
                        endpoint.includes(API_ENDPOINTS.WALLET_PIN_STATUS) &&
                        res.error === "Family wallet not found"
                    ) {
                        return DEFAULT_PIN_STATUS as T;
                    }
                    throw new Error(res.error ?? 'Failed to fetch data');
                }
                return res.data;
            } catch (error) {
                console.error(`Error fetching ${endpoint}:`, error);
                throw error;
            }
        },
        enabled,
        refetchInterval,
        retry: 3, // Retry up to 3 times on failure
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff, max 30s
        staleTime: 1000 * 60, // Data considered fresh for 1 minute
    });
}
