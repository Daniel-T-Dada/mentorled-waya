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

    // Provide fallback data in case of errors
    const dashboardData = error ? { bar_chart: [], pie_chart: {}, summary: { totalSaved: "0", activeGoals: 0, achievedGoals: 0 } } : data;
    const totalsData = totalsQuery.error ? { total_earned: "0", total_saved: "0", total_spent: "0" } : totalsQuery.data;
    const weeklyStreakData = weeklyStreakQuery.error ? { week_start_date: "", streak: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } } : weeklyStreakQuery.data;
    const rewardsData = rewardsQuery.error ? [] : rewardsQuery.data?.results || [];

    if (isLoading || weeklyStreakQuery.isLoading || rewardsQuery.isLoading) return (
        <div className="">
            <KidDashboardOverview
                bar_chart={[]}
                pie_chart={{}}
                summary={{ totalSaved: "0", activeGoals: 0, achievedGoals: 0 }}
                totals={{ total_earned: "0", total_saved: "0", total_spent: "0" }}
                weeklyStreak={{ week_start_date: "", streak: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } }}
                rewards={[]}
            />
        </div>
    );

    return (
        <div className="">
            <KidDashboardOverview
                bar_chart={dashboardData?.bar_chart}
                pie_chart={dashboardData?.pie_chart}
                summary={dashboardData?.summary}
                totals={totalsData}
                weeklyStreak={weeklyStreakData}
                rewards={rewardsData}
            />
        </div>
    );
};

export default KidsPage