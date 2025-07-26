'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";
import { Wallet, ClipboardList } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface ChartDataItem {
    name: string;
    value: number;
    color: string;
}

interface AppPieChartProps {
    chartData: ChartDataItem[];
    chartType: "chores" | "savings";
    isLoading?: boolean;
    isError?: boolean;
}

// chartConfigs is no longer used, so it's removed.

const AppPieChart = ({
    chartData,
    chartType,
    isLoading,
    isError
}: AppPieChartProps) => {
    const isWallet = chartType === "savings";
    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

    if (isLoading) {
        return (
            <Card className="lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="text-base font-semibold">
                        {isWallet ? 'Savings Breakdown' : 'Chore Breakdown'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <Skeleton className="w-[180px] h-[180px] rounded-full mb-4" />
                </CardContent>
            </Card>
        );
    }
    if (isError || chartData.length === 0) {
        return (
            <Card className="lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="text-base font-semibold">
                        {isWallet ? 'Savings Breakdown' : 'Chore Breakdown'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            {isWallet
                                ? <Wallet className="w-8 h-8 text-muted-foreground" />
                                : <ClipboardList className="w-8 h-8 text-muted-foreground" />}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {isWallet ? 'Savings Info' : 'Chores Info'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {isWallet
                                ? 'Your savings information will be displayed here when available'
                                : 'Your chores information will be displayed here when available'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="lg:h-[400px] xl:h-[420px] flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-base font-semibold">
                    {isWallet ? 'Savings Breakdown' : 'Chore Breakdown'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 h-full flex flex-col items-center justify-center overflow-hidden">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            {totalValue > 0 && (
                                <Label
                                    value={totalValue.toLocaleString()}
                                    position="center"
                                    className="fill-foreground text-2xl font-bold"
                                />
                            )}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 w-full mt-4 text-sm">
                    {chartData.map((data) => (
                        <div key={data.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                ></div>
                                <span>
                                    {isWallet
                                        ? (data.name === 'Saved' ? 'Reward Saved' : 'Reward Spent')
                                        : `${data.name} Chore`}
                                </span>
                            </div>
                            <span className="font-medium">
                                {isWallet
                                    ? `NGN ${data.value.toLocaleString()}`
                                    : `${data.value} ${data.value === 1 ? 'Chore' : 'Chores'}`}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AppPieChart;