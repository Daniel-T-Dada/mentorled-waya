'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";
// ...existing code...

// Chart configuration matching the image colors
const chartConfig = {
    rewardSaved: {
        label: "Reward Saved",
        color: "#7DE2D1" // Green color from image
    },
    rewardSpent: {
        label: "Reward Spent",
        color: "#7D238E" // Purple color from image
    },
    // Removed goalsBudget from chartConfig
} satisfies ChartConfig;

interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
}

// interface KidPieChartProps {
//     kidId?: string;
// }

const KidPieChart = () => {
    const [range, setRange] = useState("7");
    // Hardcoded chart data as placeholder
    const chartData: ChartDataPoint[] = [
        { name: "Reward Saved", value: 595, color: chartConfig.rewardSaved.color },
        { name: "Reward Spent", value: 255, color: chartConfig.rewardSpent.color }
    ];
    const formatCurrency = (value: number) => `NGN ${value.toLocaleString()}`;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-full flex flex-col">
                    <div className="flex-1 mb-4 flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="w-[200px] h-[200px] mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0];
                                                return (
                                                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                                                        <p className="font-medium">{data.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatCurrency(Number(data.value))}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                    <div className="space-y-2">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default KidPieChart;