import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuthenticatedApi } from '@/hooks/use-authenticated-api';

type UseApiQueryProps<T> = {
    endpoint: string;
    queryKey: readonly unknown[];
    enabled?: boolean;
    refetchInterval?: number;
    fetchOptions?: RequestInit;
    
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
            const res = await makeAuthenticatedCall({ endpoint, ...fetchOptions });
            if (!res.success) throw new Error(res.error ?? 'Failed to fetch data');
            return res.data;
        },
        enabled,
        refetchInterval,
    });
}