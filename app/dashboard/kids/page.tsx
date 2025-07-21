'use client'

import KidDashboardOverview from "@/components/dashboard/kid/KidDashboardOverview"
import { useApiQuery } from '@/hooks/useApiQuery';
import { API_ENDPOINTS, getApiUrl } from '@/lib/utils/api';

const KidsPage = () => {
    const { data, isLoading, error } = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.EARNINGMETER_DASHBOARD),
        queryKey: ['earning-meter-dashboard'],
        enabled: true,
        refetchInterval: 10000,
    });

    const totalsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.EARNINGMETER_TOTALS),
        queryKey: ['earning-meter-totals'],
        enabled: true,
        refetchInterval: 10000,
    });

    // Fetch weekly streak
    const weeklyStreakQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.MONEYMAZE_WEEKLY_STREAK),
        queryKey: ['moneymaze-weekly-streak'],
        enabled: true,
        refetchInterval: 10000,
    });

    const rewardsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.MONEYMAZE_REWARDS),
        queryKey: ['moneymaze-rewards'],
        enabled: true,
        refetchInterval: 10000,
    });

    if (isLoading || weeklyStreakQuery.isLoading || rewardsQuery.isLoading) return <div>Loading...</div>;
    if (error || weeklyStreakQuery.error || rewardsQuery.error) return <div>Error loading data</div>;

    return (
        <div className="">
            <KidDashboardOverview
                bar_chart={data?.bar_chart}
                pie_chart={data?.pie_chart}
                summary={data?.summary}
                totals={totalsQuery.data}
                weeklyStreak={weeklyStreakQuery.data}
                rewards={rewardsQuery.data?.results || []}
            />
        </div>
    )
}

export default KidsPage