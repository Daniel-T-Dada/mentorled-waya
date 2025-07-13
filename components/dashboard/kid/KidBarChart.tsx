'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
// ...existing code...
import { Skeleton } from "@/components/ui/skeleton";

// Chart configuration matching the image colors
const chartConfig = {
    rewardEarned: {
        label: "Reward Earned",
        color: "#7DE2D1"
    },
    // Removed goalBudget from chartConfig
    rewardSpent: {
        label: "Reward Spent",
        color: "#7D238E"
    },
} satisfies ChartConfig;

interface ChartDataPoint {
    date: string;
    rewardEarned: number;
    rewardSpent: number;
}

// interface KidBarChartProps {
//     kidId?: string;
// }

const KidBarChart = () => {
    const [range, setRange] = useState("7");
    const [screenSize, setScreenSize] = useState('sm');
    // Hardcoded chart data as placeholder
    const chartData: ChartDataPoint[] = [
        { date: "Mon", rewardEarned: 100, rewardSpent: 50 },
        { date: "Tue", rewardEarned: 1200, rewardSpent: 5000 },
        { date: "Wed", rewardEarned: 90, rewardSpent: 40 },
        { date: "Thu", rewardEarned: 110, rewardSpent: 70 },
        { date: "Fri", rewardEarned: 130, rewardSpent: 80 },
        { date: "Sat", rewardEarned: 140, rewardSpent: 90 },
        { date: "Sun", rewardEarned: 2000, rewardSpent: 1000 },
    ];
    const loading = false;
    const error = null;

    // Custom hook for screen size detection to handle responsive chart margins
    useEffect(() => {
        const getScreenSize = () => {
            const width = window.innerWidth;
            if (width >= 1280) return 'xl';      // xl: 1280px+
            if (width >= 1024) return 'lg';      // lg: 1024px+
            if (width >= 768) return 'md';       // md: 768px+
            if (width >= 640) return 'sm';       // sm: 640px+
            return 'xs';                         // xs: <640px
        };

        const handleResize = () => {
            setScreenSize(getScreenSize());
        };

        // Set initial value
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Responsive margin configuration based on screen size
    const getChartMargin = () => {
        const baseMargin = { top: 20, right: 30, left: 20 };

        switch (screenSize) {
            case 'xl':
                return { ...baseMargin, bottom: 300 };  // Extra large screens
            case 'lg':
                return { ...baseMargin, bottom: 300 };  // Large screens (desktop)
            case 'md':
                return { ...baseMargin, bottom: 30 };   // Medium screens (tablet)
            case 'sm':
                return { ...baseMargin, bottom: 15 };   // Small screens (large mobile)
            case 'xs':
            default:
                return { ...baseMargin, bottom: 5 };    // Extra small screens (mobile)
        }
    };

    const chartMargin = getChartMargin();

    // ...existing code...

    const formatCurrency = (value: number) => {
        return `NGN ${value.toLocaleString()}`;
    }; if (loading) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <Skeleton className="h-full w-full rounded-lg" />
                </CardContent>
            </Card>
        );
    } if (error) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-red-600">Error loading chart: {error}</p>
                        <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
                    </div>
                </CardContent>
            </Card>
        );
    } return (
        <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base sm:text-lg font-semibold">Rewards Overview</CardTitle>
                        <Select value={range} onValueChange={setRange}>
                            <SelectTrigger className="w-24 sm:w-32 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Legend - Responsive layout */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardEarned.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Reward Earned</span>
                        </div>
                        {/* Removed Goal Budget legend */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardSpent.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Reward Spent</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-2 sm:p-4 md:p-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={chartMargin}
                            barCategoryGap="20%"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={true}
                                tickLine={true}
                                tick={{ fontSize: screenSize === 'xs' ? 10 : 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: screenSize === 'xs' ? 10 : 12 }}
                                tickFormatter={(value) => {
                                    if (screenSize === 'xs' || screenSize === 'sm') {
                                        return `${(value / 1000).toFixed(0)}K`;
                                    }
                                    return `NGN ${(value / 1000).toFixed(0)}K`;
                                }}
                                domain={[0, 6000]}
                                ticks={[0, 2000, 4000, 6000]}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value)),
                                            chartConfig[name as keyof typeof chartConfig]?.label || name
                                        ]}
                                    />
                                }
                            />
                            <Bar
                                dataKey="rewardEarned"
                                fill={chartConfig.rewardEarned.color}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={screenSize === 'xs' ? 25 : screenSize === 'sm' ? 30 : 40}
                            />
                            {/* Removed Goal Budget bar */}
                            <Bar
                                dataKey="rewardSpent"
                                fill={chartConfig.rewardSpent.color}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={screenSize === 'xs' ? 25 : screenSize === 'sm' ? 30 : 40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default KidBarChart;