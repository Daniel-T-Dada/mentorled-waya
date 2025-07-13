'use client'

import InsightTrackerDashboard from "@/components/dashboard/parent/InsightTrackerDashboard";
import { InsightTrackerEndpoints, authFetch } from "@/lib/utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const InsightsPage = () => {
    const { data: session } = useSession();
    const [insightStats, setInsightStats] = useState<{
        total_chores_assigned: number;
        total_completed_chores: number;
        total_pending_chores: number;
        child_activities: any[];
    } | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!session?.user?.accessToken) return;
            try {
                const response = await authFetch(
                    InsightTrackerEndpoints.getChoresInsights(),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    }
                );
                const data = await response.json();
                setInsightStats(data);
                console.log("Insight Tracker API response:", data);
            } catch (error) {
                console.error("Error fetching insight tracker data:", error);
            }
        };
        fetchInsights();
    }, [session?.user?.accessToken]);

    return (
        <div className="">
            <InsightTrackerDashboard insightStats={insightStats} />
        </div>
    );
}

export default InsightsPage;