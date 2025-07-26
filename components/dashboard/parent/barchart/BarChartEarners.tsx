'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import CustomBarChartTooltip from "./ChartTooltip";

interface ChartDataPoint {
    date: string;
    highest: number;
    lowest: number;
    highestName?: string;
    lowestName?: string;
}

interface BarChartEarnersProps {
    data: ChartDataPoint[];
    range: string;
    onRangeChange: (range: string) => void;
    isLoading?: boolean;
    isError?: boolean;
}

const chartConfig: ChartConfig = {
    highest: { label: "Highest Earner", color: "#7DE2D1" },
    lowest: { label: "Lowest Earner", color: "#7D238E" },
};

const BarChartEarners = ({
    data,
    range,
    onRangeChange,
    isLoading,
    isError
}: BarChartEarnersProps) => {
    if (isLoading) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg font-semibold">Top Earners</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    {/* Skeleton loader here */}
                </CardContent>
            </Card>
        );
    }
    if (isError || !data || data.length === 0) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg font-semibold">Top Earners</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div>No data available.</div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Top Earners</CardTitle>
                    <Select value={range} onValueChange={onRangeChange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1 h-full flex flex-col justify-center overflow-hidden">
                <ChartContainer config={chartConfig} className="flex-1 h-full w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 5, bottom: 30 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={5}
                                axisLine={false}
                            />
                            <YAxis
                                tickLine={false}
                                tickMargin={5}
                                axisLine={false}
                                tickFormatter={(value) => value.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
                            />
                            <Tooltip content={<CustomBarChartTooltip />} />
                            <Bar
                                dataKey="highest"
                                radius={[6, 6, 0, 0]}
                                fill={chartConfig.highest.color}
                            />
                            <Bar
                                dataKey="lowest"
                                radius={[6, 6, 0, 0]}
                                fill={chartConfig.lowest.color}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default BarChartEarners;