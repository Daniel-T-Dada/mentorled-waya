'use client'

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDataService } from '@/lib/services/mockDataService';

const chartConfig = {
    highestEarner: {
        label: "Highest Earner",
        color: "var(--chart-4)",
    },
    lowestEarner: {
        label: "Lowest Earner",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

interface ChartDataPoint {
    month: string;
    highestEarner: number;
    lowestEarner: number;
}

const AppAreaChart = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processData = () => {
            // Get all kids
            const kids = mockDataService.getAllKids();

            // Process each kid's allowance history
            const monthlyData: { [key: string]: { [kidId: string]: number } } = {};

            kids.forEach(kid => {
                kid.allowanceHistory.forEach(history => {
                    if (!monthlyData[history.date]) {
                        monthlyData[history.date] = {};
                    }
                    monthlyData[history.date][kid.id] = history.allowanceGiven;
                });
            });

            // Convert to chart data format
            const processedData: ChartDataPoint[] = Object.entries(monthlyData).map(([date, kidData]) => {
                const values = Object.values(kidData);
                return {
                    month: date,
                    highestEarner: Math.max(...values),
                    lowestEarner: Math.min(...values)
                };
            });

            // Sort by date
            processedData.sort((a, b) => {
                const [monthA, dayA] = a.month.split(' ');
                const [monthB, dayB] = b.month.split(' ');
                const currentYear = new Date().getFullYear();
                const dateA = new Date(`${monthA} ${dayA}, ${currentYear}`);
                const dateB = new Date(`${monthB} ${dayB}, ${currentYear}`);
                return dateA.getTime() - dateB.getTime();
            });

            setChartData(processedData);
            setIsLoading(false);
        };

        processData();
    }, []);

    if (isLoading) {
        return (
            <div>
                <h1 className="text-lg font-medium mb-6">Earners</h1>
                <Skeleton className="min-h-[200px] w-full" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-lg font-medium mb-6">Earners</h1>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <AreaChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={true}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        tickLine={true}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <defs>
                        <linearGradient id="fillHighest" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-highest)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-highest)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                        <linearGradient id="fillLowest" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-lowest)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-lowest)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <Area
                        dataKey="lowestEarner"
                        type="natural"
                        fill="url(#fillLowest)"
                        fillOpacity={0.4}
                        stroke="var(--color-lowest)"
                        stackId="a"
                    />
                    <Area
                        dataKey="highestEarner"
                        type="natural"
                        fill="url(#fillHighest)"
                        fillOpacity={0.4}
                        stroke="var(--color-highest)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}

export default AppAreaChart