'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState, useMemo } from "react";
import { formatNGN } from '@/lib/utils/currency';

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface BarChartPoint {
    date: string;
    rewardEarned: number;
    rewardSpent: number;
}

interface ApiBarChartPoint {
    day: string;
    earned: string;
    spent: string;
}

interface KidBarChartProps {
    bar_chart?: ApiBarChartPoint[];
    variant?: "dashboard" | "earning-meter"; // add variant prop
}

const KidBarChart = ({ bar_chart, variant = "dashboard" }: KidBarChartProps) => {
    const [range, setRange] = useState("7");
    const [screenSize, setScreenSize] = useState('sm');

    // Set config and title based on variant prop
    const chartConfig: ChartConfig = variant === "earning-meter"
        ? {
            rewardEarned: { label: "Reward Saved", color: "#8AD7AC" },
            rewardSpent: { label: "Reward Spent", color: "#FFB938" }
        }
        : {
            rewardEarned: { label: "Reward Saved", color: "#8AD6BD" },
            rewardSpent: { label: "Reward Spent", color: "#79166A" }
        };

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

    // Memoize chartData to avoid recalculation
    const chartData = useMemo<BarChartPoint[]>(() => {
        if (!bar_chart || !Array.isArray(bar_chart)) return [];
        // Make sure days are always shown in correct order (Monday-Sunday)
        return WEEK_DAYS.map((day) => {
            const dataForDay = bar_chart.find((item) => item.day === day);
            return {
                date: day.slice(0, 3), // "Mon", "Tue", etc.
                rewardEarned: Number(dataForDay?.earned ?? 0),
                rewardSpent: Number(dataForDay?.spent ?? 0),
            };
        });
    }, [bar_chart]);

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
                                {/* <SelectItem value="30">Last 30 days</SelectItem> */}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardEarned.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">{chartConfig.rewardEarned.label}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardSpent.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">{chartConfig.rewardSpent.label}</span>
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

export default KidBarChart;