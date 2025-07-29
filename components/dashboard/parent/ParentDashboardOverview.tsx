
'use client'

import BarChartAllowance from "./barchart/BarChartAllowance"
import AppPieChart from "../AppPieChart"
import { Button } from "@/components/ui/button"
import { memo, useMemo } from "react"
import ParentStatsProvider from "@/components/providers/stats-providers"
import AppKidsManager from "./AppKidsManager/AppKidsManager"
import AppChoreManagement from "../AppChoreManagement"
import type { Kid, Task } from '../AppChoreManagement';

interface ChartDataItem {
    name: string;
    value: number;
    color: string;
}

interface ChoreSummary {
    pending: number;
    completed: number;
    missed?: number;
    total: number;
}

interface ParentDashboardProps {
    onCreateKidClick?: () => void;
    kids: Kid[];
    pagedKids: Kid[];
    kidsCount: number;
    kidsPage: number;
    kidsTotalPages: number;
    onKidsPageChange: (page: number) => void;
    tasks: Task[];
    choreSummary?: ChoreSummary;
    walletStats: {
        family_wallet_balance: string;
        total_rewards_sent: string;
        total_rewards_pending: string;
        children_count: number;
        total_children_balance: string;
    };
    savingsBreakdown?: any[] | null;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    isLoading?: boolean;
    isError?: boolean;
    barChartData: ChartDataPoint[];
    barChartRange: string;
    onBarChartRangeChange: (range: string) => void;
    barChartLoading?: boolean;
    barChartError?: boolean;
}

export interface ChartDataPoint {
    date: string;
    allowanceGiven: number;
    allowanceSpent: number;
}

function getPieChartData(choreSummary?: ChoreSummary, savingsBreakdown?: any[] | null): ChartDataItem[] {
    if (savingsBreakdown && Array.isArray(savingsBreakdown)) {
        // Savings chart
        const totalSaved = savingsBreakdown.reduce((sum, child) => sum + (child.reward_saved || 0), 0);
        const totalSpent = savingsBreakdown.reduce((sum, child) => sum + (child.reward_spent || 0), 0);
        return [
            { name: "Saved", value: totalSaved, color: "#7DE2D1" },
            { name: "Spent", value: totalSpent, color: "#FFB800" },
        ];
    } else if (choreSummary) {
        // Chores chart
        return [
            { name: "Completed", value: choreSummary.completed, color: "#7DE2D1" },
            { name: "Pending", value: choreSummary.pending, color: "#FFB800" },
        ];
    }
    return [];
}

const ParentDashboardOverview = memo<ParentDashboardProps>(({
    onCreateKidClick,
    kids,
    pagedKids,
    kidsCount,
    kidsPage,
    kidsTotalPages,
    onKidsPageChange,
    tasks,
    choreSummary,
    walletStats,
    page,
    totalPages,
    onPageChange,
    onEditTask,
    onDeleteTask,
    isLoading,
    isError,
    savingsBreakdown,
    barChartData,
    barChartRange,
    onBarChartRangeChange,
    // barChartLoading,
    barChartError,
}: ParentDashboardProps) => {
    const pieChartType: "chores" | "savings" = savingsBreakdown ? "savings" : "chores";
    const pieChartData = useMemo(
        () => getPieChartData(choreSummary, savingsBreakdown),
        [choreSummary, savingsBreakdown]
    );

    return (
        <main className="">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onCreateKidClick}
                >
                    Create kid&apos;s account
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <ParentStatsProvider />

                <div className="lg:col-span-2 relative z-0">
                    <BarChartAllowance
                        data={barChartData}
                        range={barChartRange}
                        onRangeChange={onBarChartRangeChange}
                        // isLoading={barChartLoading}
                        isError={barChartError}
                    />
                </div>

                <div className="lg:col-span-1 self-start relative z-5">
                    <AppPieChart
                        chartType={pieChartType}
                        chartData={pieChartData}
                        isLoading={isLoading}
                        isError={isError}
                    />
                </div>

                <div className="lg:col-span-2 min-h-[400px] rounded relative z-5">
                    <AppChoreManagement
                        tasks={tasks}
                        kids={kids}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        choreSummary={choreSummary}
                        walletStats={walletStats}
                    />
                </div>

                <div className="lg:col-span-1 min-h-[400px] self-start">
                    <AppKidsManager
                        kids={pagedKids}
                        kidsCount={kidsCount}
                        kidsPage={kidsPage}
                        kidsTotalPages={kidsTotalPages}
                        onKidsPageChange={onKidsPageChange}
                        isLoading={!!isLoading}
                        // isError={!!isError}
                    />
                </div>
            </div>
        </main>
    );
});

ParentDashboardOverview.displayName = 'ParentDashboardOverview';

export default ParentDashboardOverview;
