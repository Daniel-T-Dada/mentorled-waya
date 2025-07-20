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
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;
    return (
        <div className="">
            <KidDashboardOverview
                bar_chart={data?.bar_chart}
                pie_chart={data?.pie_chart}
            />
        </div>
    )
}

export default KidsPage