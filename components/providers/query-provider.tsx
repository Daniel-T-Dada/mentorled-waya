'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Prevent automatic refetching during hydration mismatch
                        refetchOnWindowFocus: false,
                        retry: false,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}