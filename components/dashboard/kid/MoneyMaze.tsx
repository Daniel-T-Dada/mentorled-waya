'use client'

import KidLearn from "./KidLearn"
import KidStartLevel from "./KidStartLevel"
import { useApiQuery } from "@/hooks/useApiQuery"
import { API_ENDPOINTS, getApiUrl } from "@/lib/utils/api"

const MoneyMaze = () => {
    // Fetch concepts
    const conceptsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.MONEYMAZE_CONCEPTS),
        queryKey: ['moneymaze-concepts'],
        enabled: true,
        refetchInterval: 30000,
    });

    // Fetch concepts progress
    const conceptsProgressQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.MONEYMAZE_CONCEPTS_PROGRESS),
        queryKey: ['moneymaze-concepts-progress'],
        enabled: true,
        refetchInterval: 30000,
    });

    // You can handle loading and error here or in KidLearn
    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Money Maze</h2>
                    <p className="text-muted-foreground">
                        Learn Financial Concepts, Answer Financial Quiz and Earn Reward
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ">
                <div className="lg:col-span-3 ">
                    <KidStartLevel />
                </div>

                <div className="lg:col-span-3 ">
                    <KidLearn
                        concepts={conceptsQuery.data?.results || []}
                        conceptsProgress={conceptsProgressQuery.data?.results || []}
                    />
                </div>
            </div>
        </main>
    )
}
export default MoneyMaze