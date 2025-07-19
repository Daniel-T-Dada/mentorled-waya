"use client"

import KidStatCards from "./KidStatCards"
import KidBarChart from "./KidBarChart"
import KidPieChart from "./KidPieChart"
import KidDailyStreaks from "./KidDailyStreaks"
import KidChore from "./KidChore"

interface DashboardData {
    bar_chart?: {
        day: string
        earned: string
        spent: string
    }[]
    pie_chart?: any
}

const KidDashboardOverview = ({ bar_chart, pie_chart }: DashboardData) => {


    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards />
                </div>
                <div className="lg:col-span-2 relative z-0">
                    <KidBarChart bar_chart={bar_chart} />
                </div>
                <div className="lg:col-span-1 self-start">
                    <KidPieChart pieChart={pie_chart} variant="dashboard" />
                </div>
                <div className="lg:col-span-2  rounded relative z-50">
                    <KidChore />


                </div>
                <div className="lg:col-span-1 min-h-[400px] self-start">
                    <KidDailyStreaks />
                </div>
            </div>
        </main>
    )
};


export default KidDashboardOverview