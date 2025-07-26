import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

type Fetcher<T> = (page: number) => Promise<PaginatedResponse<T>>;

export function usePaginatedApiQuery<T>(
    queryKeyBase: string,
    fetcher: Fetcher<T>,
    page: number
) {
    const queryKey = [queryKeyBase, page];
    const queryClient = useQueryClient();

    const query = useQuery<PaginatedResponse<T>>({
        queryKey,
        queryFn: () => fetcher(page),
        gcTime: 5 * 60 * 1000
    });

    // Prefetch next page
    useEffect(() => {
        if (query.data?.next) {
            queryClient.prefetchQuery({
                queryKey: [queryKeyBase, page + 1],
                queryFn: () => fetcher(page + 1),
            });
        }
    }, [query.data, page, queryClient, fetcher, queryKeyBase]);

    return query;
}