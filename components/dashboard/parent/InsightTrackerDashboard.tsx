'use client'

import AppKidsActivities from "../AppKidsActivities"
import AppStatCard from "../AppStatCard"

const InsightTrackerDashboard = () => {
    return (
        <div className="">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <AppStatCard />

                <div className="lg:col-span-3 h-64 rounded">
                    <AppKidsActivities />
                </div>
            </div>
        </div>
    )
}
export default InsightTrackerDashboard