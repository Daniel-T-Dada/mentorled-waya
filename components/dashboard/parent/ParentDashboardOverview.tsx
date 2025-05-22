'use client'

import AppBarChart from "../AppBarChart"
import AppPieChart from "../AppPiecChart"
import StatCard from "../AppStatCard"

const ParentDashboardOverview = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard />
            <AppBarChart />
            <AppPieChart/>
            

        </div>
    )
}
export default ParentDashboardOverview