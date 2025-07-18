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
    })

    const totalsQuery = useApiQuery({
        endpoint: getApiUrl('/api/earningmeter/totals/'),
        queryKey: ['earning-meter-totals'],
        enabled: true,
        refetchInterval: 10000,
    });


    console.log('Tanstack EARNING METER DOUBLE D DATA:', data);


    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

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
                    <KidBarChart pieChart={data?.pie_chart} />
                </div>
                <div className="lg:col-span-1 self-start">
                    <KidPieChart pieChart={data?.pie_chart} />
                </div>
            </div>
            <div className="mt-8">
                <RecentActivities activities={data?.recent_activities ?? []} />
            </div>
        </main>
    );
};

export default EarningMeterPage; 