'use client'

import { Button } from "@/components/ui/button"
import BarChartEarners from "./barchart/BarChartEarners"
import AppPieChart from "../AppPieChart"
import ParentStatsProvider from "@/components/providers/stats-providers"
import AppTable, { ActivityRow } from "../AppTable"

interface ChartDataItem {
    name: string;
    value: number;
    color: string;
}
interface ChartDataPoint {
    date: string;
    highest: number;
    lowest: number;
    highestName?: string;
    lowestName?: string;
}

interface FamilyWalletDashboardProps {
    barChartEarnersData: ChartDataPoint[];
    barChartRange: string;
    onBarChartRangeChange: (range: string) => void;
    barChartEarnersLoading?: boolean;
    barChartEarnersError?: boolean;

    pieChartData: ChartDataItem[];
    pieChartLoading?: boolean;
    pieChartError?: boolean;

    activities: ActivityRow[];
    activitiesLoading?: boolean;
    activitiesError?: boolean;

    onAddAllowanceClick?: () => void;
    onAddFundsClick?: () => void;
    onSetPinClick?: () => void;

    pinSet?: boolean; 
    
}

const FamilyWalletDashboard = ({
    barChartEarnersData,
    barChartRange,
    onBarChartRangeChange,
    barChartEarnersLoading,
    barChartEarnersError,
    pieChartData,
    pieChartLoading,
    pieChartError,
    activities,
    activitiesLoading,
    activitiesError,
    onAddAllowanceClick,
    onAddFundsClick,
    onSetPinClick,
    pinSet
}: FamilyWalletDashboardProps) => {
    // Default values for Family Wallet and Child Wallet
    // Assume ParentStatsProvider takes error/loading props or can be wrapped for fallback

    // For Pie Chart, if there's an error or loading, default the chart to zeros
    const safePieChartData = pieChartError || pieChartLoading
        ? [
            { name: "Saved", value: 0, color: "#7DE2D1" },
            { name: "Spent", value: 0, color: "#FFB800" }
        ]
        : pieChartData;

    // For activities table, if error/loading, pass empty array but still render the table
    const safeActivities = activitiesError || activitiesLoading ? [] : activities;

    // For bar chart, if error/loading, show empty chart
    const safeBarChartData = barChartEarnersError || barChartEarnersLoading ? [] : barChartEarnersData;

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={onAddFundsClick}
                    >
                        Add Funds
                    </Button>
                    {!pinSet ? (
                        <Button
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={onSetPinClick}
                        >
                            Set Wallet PIN
                        </Button>
                    ) : (
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={onAddAllowanceClick}
                        >
                            Make Payment
                        </Button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* You can enhance ParentStatsProvider to accept props for default values */}
                <ParentStatsProvider
                    familyWalletError={barChartEarnersError || barChartEarnersLoading}
                    childWalletError={pieChartError || pieChartLoading}
                />

                <div className="lg:col-span-2">
                    <BarChartEarners
                        data={safeBarChartData}
                        range={barChartRange}
                        onRangeChange={onBarChartRangeChange}
                        isLoading={barChartEarnersLoading}
                        isError={barChartEarnersError}
                    />
                </div>

                <div className="lg:col-span-1 self-start">
                    <AppPieChart
                        chartType="savings"
                        chartData={safePieChartData}
                        isLoading={pieChartLoading}
                        isError={pieChartError}
                    />
                </div>

                <div className="lg:col-span-3">
                    <AppTable
                        activities={safeActivities}
                        isLoading={activitiesLoading}
                        isError={activitiesError}
                    />
                </div>
            </div>
        </main>
    )
}

export default FamilyWalletDashboard