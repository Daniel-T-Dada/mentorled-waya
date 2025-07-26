'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartDataPoint {
    date: string;
    allowanceGiven: number;
    allowanceSpent: number;
}

export interface BarChartAllowanceProps {
    data: ChartDataPoint[];
    range: string;
    onRangeChange: (range: string) => void;
    isLoading?: boolean;
    isError?: boolean;
}

const chartConfig: ChartConfig = {
    allowanceGiven: { label: "Allowance Given", color: "#7DE2D1" },
    allowanceSpent: { label: "Allowance Spent", color: "#7D238E" },
};

const InfoState = () => (
    <Card className="min-h-[320px] max-h-[420px] h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
            <CardTitle>Allowance Breakdown</CardTitle>
            <CardDescription>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded bg-[#7DE2D1]" /> Allowance Given
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 rounded bg-[#7D238E]" /> Allowance Spent
                        </div>
                    </div>
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 h-full flex items-center justify-center overflow-hidden">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Allowance Info</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Allowance information will be displayed here when available
                </p>
            </div>
        </CardContent>
    </Card>
);

const BarChartAllowance = ({
    data,
    range,
    onRangeChange,
    isLoading,
    isError,
}: BarChartAllowanceProps) => {
    if (isLoading) {
        return (
            <Card className="min-h-[320px] max-h-[420px] h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                    <CardTitle>Allowance Breakdown</CardTitle>
                    <CardDescription>
                        <Skeleton className="w-1/2 h-6 mb-2" />
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 h-full flex items-center justify-center overflow-hidden">
                    <Skeleton className="w-[200px] h-[120px] rounded mb-4" />
                </CardContent>
            </Card>
        );
    }

    if (isError || !data || data.length === 0) {
        return <InfoState />;
    }

    return (
        <Card className="min-h-[320px] max-h-[420px] h-full flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Allowance Breakdown</CardTitle>
                <CardDescription>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded bg-[#7DE2D1]" /> Allowance Given
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded bg-[#7D238E]" /> Allowance Spent
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={range} onValueChange={onRangeChange}>
                                <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 h-full flex flex-col justify-center overflow-hidden">
                <ChartContainer config={chartConfig} className="flex-1 h-full w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            accessibilityLayer
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
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="allowanceGiven"
                                radius={[6, 6, 0, 0]}
                                fill={chartConfig.allowanceGiven.color}
                            />
                            <Bar
                                dataKey="allowanceSpent"
                                radius={[6, 6, 0, 0]}
                                fill={chartConfig.allowanceSpent.color}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default BarChartAllowance;