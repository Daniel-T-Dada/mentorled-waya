'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { formatNGN } from '@/lib/utils/currency';

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const chartConfig = {
    rewardEarned: { label: "Reward Saved", color: "#7DE2D1" },
    rewardSpent: { label: "Reward Spent", color: "#7D238E" },
} satisfies ChartConfig;

interface ChartDataPoint {
    date: string;
    rewardEarned: number;
    rewardSpent: number;
}

interface PieChartData {
    week_data?: Record<string, { saved?: string, spent?: string }>;
    reward_saved: string;
    reward_spent: string;
    highest_saved?: string;
    lowest_saved?: string;
}

interface KidBarChartProps {
    pieChart?: PieChartData;
    kidId?: string;
}

const KidBarChart = ({ pieChart }: KidBarChartProps) => {
    const [range, setRange] = useState("7");
    const [screenSize, setScreenSize] = useState('sm');

    // Responsive margin logic
    useEffect(() => {
        const getScreenSize = () => {
            const width = window.innerWidth;
            if (width >= 1280) return 'xl';
            if (width >= 1024) return 'lg';
            if (width >= 768) return 'md';
            if (width >= 640) return 'sm';
            return 'xs';
        };
        const handleResize = () => setScreenSize(getScreenSize());
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getChartMargin = () => {
        const baseMargin = { top: 20, right: 30, left: 20 };
        switch (screenSize) {
            case 'xl': return { ...baseMargin, bottom: 300 };
            case 'lg': return { ...baseMargin, bottom: 300 };
            case 'md': return { ...baseMargin, bottom: 30 };
            case 'sm': return { ...baseMargin, bottom: 15 };
            case 'xs': default: return { ...baseMargin, bottom: 5 };
        }
    };


    let chartData: ChartDataPoint[];

    if (pieChart?.week_data && Object.keys(pieChart.week_data).length > 0) {
        // Use per-day data when available
        chartData = WEEK_DAYS.map((day) => ({
            date: day,
            rewardEarned: Number(pieChart.week_data?.[day]?.saved ?? 0),
            rewardSpent: Number(pieChart.week_data?.[day]?.spent ?? 0),
        }));
    } else if (pieChart) {
        // Use same value for all days if only weekly totals present
        chartData = WEEK_DAYS.map((day) => ({
            date: day,
            rewardEarned: Number(pieChart.reward_saved ?? 0),
            rewardSpent: Number(pieChart.reward_spent ?? 0),
        }));
    } else {
        chartData = [
            { date: "Mon", rewardEarned: 100, rewardSpent: 50 },
            { date: "Tue", rewardEarned: 1200, rewardSpent: 5000 },
            { date: "Wed", rewardEarned: 90, rewardSpent: 40 },
            { date: "Thu", rewardEarned: 110, rewardSpent: 70 },
            { date: "Fri", rewardEarned: 130, rewardSpent: 80 },
            { date: "Sat", rewardEarned: 140, rewardSpent: 90 },
            { date: "Sun", rewardEarned: 2000, rewardSpent: 1000 },
        ];
    }

    // Optional: loading/error state if you want to support suspense or async
    const loading = false;
    const error = null;

    if (loading) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                {/* ...loading skeleton UI... */}
            </Card>
        );
    }
    if (error) {
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
    }

    return (
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
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardEarned.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Reward Saved</span>
                        </div>
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
                            margin={getChartMargin()}
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
                                tickFormatter={(value) => formatNGN(value)}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => [
                                            formatNGN(Number(value)),
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

export default KidBarChart