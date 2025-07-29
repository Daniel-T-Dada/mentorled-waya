'use client'

import KidStatCards from '@/components/dashboard/kid/KidStatCards';
import KidBarChart from '@/components/dashboard/kid/KidBarChart';
import KidPieChart from '@/components/dashboard/kid/KidPieChart';
import RecentActivities from '@/components/dashboard/kid/RecentActivities';
import { useApiQuery } from '@/hooks/useApiQuery';
import { API_ENDPOINTS, getApiUrl } from '@/lib/utils/api';

const EarningMeterPage = () => {
    const { data, isLoading, error } = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.EARNINGMETER_DASHBOARD),
        queryKey: ['earning-meter-dashboard'],
        enabled: true,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    const totalsQuery = useApiQuery({
        endpoint: getApiUrl('/api/earningmeter/totals/'),
        queryKey: ['earning-meter-totals'],
        enabled: true,
        refetchInterval: 10000,
    });

    // Fetch chores data to map chore IDs to titles
    const choresQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.CHILD_CHORES + '?page=1'),
        queryKey: ['child-chores'],
        enabled: true,
        refetchInterval: 10000,
    });

    console.log('Tanstack EARNING METER DOUBLE D DATA:', data);

    if (isLoading || choresQuery.isLoading) return <div>Loading...</div>;
    if (error || choresQuery.error) return <div>Error loading data: {error?.message || choresQuery.error?.message}</div>;

    // Transform recent_activities to replace chore ID with title
    const transformActivity = (activities: any[], chores: any[]) => {
        return activities.map(activity => {
            const choreIdMatch = activity.activity.match(/chore\s+([0-9a-fA-F\-]+)/);
            if (choreIdMatch) {
                const choreId = choreIdMatch[1];
                const chore = chores.find((c: any) => c.id === choreId);
                if (chore) {
                    return {
                        ...activity,
                        activity: `Reward for ${chore.title}`
                    };
                }
            }
            return activity; // Return unchanged if no match or chore not found
        });
    };

    const choresData = Array.isArray(choresQuery.data?.results)
        ? choresQuery.data.results.map((chore: any) => ({
            id: chore.id,
            title: chore.title,
        }))
        : [];

    const transformedActivities = transformActivity(data?.recent_activities ?? [], choresData);

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Earning Meter</h2>
                <p className="text-muted-foreground">Track your earnings and see your progress!</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards
                        section="earning-meter"
                        totals={totalsQuery.data}
                    />
                </div>
                <div className="lg:col-span-2">
                    <KidBarChart bar_chart={data?.bar_chart} variant="earning-meter" />
                </div>
                <div className="lg:col-span-1 self-start">
                    <KidPieChart pieChart={data?.pie_chart} variant="earning-meter" />
                </div>
            </div>
            <div className="mt-8">
                <RecentActivities activities={transformedActivities} />
            </div>
        </main>
    );
};

export default EarningMeterPage;