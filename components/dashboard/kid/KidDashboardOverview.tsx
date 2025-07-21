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
    summary?: {
        totalSaved: string
        activeGoals: number
        achievedGoals: number
    }
    totals?: {
        total_earned: string
        total_saved: string
        total_spent: string
    }
    weeklyStreak?: {
        week_start_date: string
        streak: {
            mon: boolean
            tue: boolean
            wed: boolean
            thu: boolean
            fri: boolean
            sat: boolean
            sun: boolean
        }
    }
    rewards?: any[]
}

const KidDashboardOverview = ({ bar_chart, pie_chart, summary, totals, weeklyStreak, rewards }: DashboardData) => {
    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards
                        section="overview"
                        summary={summary}
                        totals={totals}
                    />
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
                    <KidDailyStreaks
                        weeklyStreak={weeklyStreak}
                        rewards={rewards}
                    />
                </div>
            </div>
        </main>
    )
}

export default KidDashboardOverview