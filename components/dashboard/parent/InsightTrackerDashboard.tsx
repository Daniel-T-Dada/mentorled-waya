'use client'

import AppKidsActivities from "../AppKidsActivities"
import AppStatCard from "../AppStatCard"

interface InsightStats {
    total_chores_assigned: number;
    total_completed_chores: number;
    total_pending_chores: number;
    child_activities: any[];
}

interface InsightTrackerDashboardProps {
    insightStats: InsightStats | null;
}

const InsightTrackerDashboard = ({ insightStats }: InsightTrackerDashboardProps) => {
    return (
        <div className="">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
                <AppStatCard insightStats={insightStats} />

                <div className="lg:col-span-3 h-64 rounded">
                    <AppKidsActivities childActivities={insightStats?.child_activities || []} />
                </div>
            </div>
        </div>
    )
}

export default InsightTrackerDashboard