'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MockApiService } from "@/lib/services/mockApiService";
import { mockDataService } from "@/lib/services/mockDataService";
import { Skeleton } from "@/components/ui/skeleton";

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
    goalsBudget: {
        label: "Goals Budget",
        color: "#FFB800" // Orange color from image
    },
} satisfies ChartConfig;

interface ChartDataPoint {
    name: string;
    value: number;
    color: string;
}

interface KidPieChartProps {
    kidId?: string;
}

const KidPieChart = ({ kidId: propKidId }: KidPieChartProps) => {
    const { data: session } = useSession();
    const [range, setRange] = useState("7");
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Valid kid IDs from mock data
    const validKidIds = ["kid-001", "kid-002", "kid-003", "kid-004"];

    // Get kid data - prioritize prop, then session, then fallback
    // Validate that the kidId exists in our mock data
    const sessionKidId = session?.user?.id;
    const validKidId = propKidId ||
        (sessionKidId && validKidIds.includes(sessionKidId) ? sessionKidId : null) ||
        "kid-001";

    console.log('[KidPieChart] Session kidId:', sessionKidId, 'Using valid kidId:', validKidId);    // Generate fallback data that matches the image
    const generateFallbackData = (): ChartDataPoint[] => {
        return [
            {
                name: "Reward Saved",
                value: 595,
                color: chartConfig.rewardSaved.color
            },
            {
                name: "Reward Spent",
                value: 255,
                color: chartConfig.rewardSpent.color
            },
            {
                name: "Goals Budget",
                value: 750,
                color: chartConfig.goalsBudget.color
            }
        ];
    };

    const formatCurrency = (value: number) => {
        return `NGN ${value.toLocaleString()}`;
    };

    useEffect(() => {
        // Process kid and chore data into expense breakdown format
        const processExpenseData = (kid: any, chores: any[], days: number): ChartDataPoint[] => {
            if (!kid) return generateFallbackData();

            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            // Filter chores for the selected date range
            const recentChores = chores.filter(chore => {
                const choreDate = new Date(chore.createdAt || chore.dueDate);
                return choreDate >= startDate;
            });

            // Calculate expenses
            const totalEarned = recentChores
                .filter(chore => chore.status === 'completed')
                .reduce((sum, chore) => sum + (chore.reward || 0), 0);

            // Assume 70% of earned money is saved, 30% is spent
            const rewardSaved = totalEarned * 0.7;
            const rewardSpent = totalEarned * 0.3;

            // Goals budget from pending/upcoming chores
            const goalsBudget = recentChores
                .filter(chore => chore.status === 'pending')
                .reduce((sum, chore) => sum + (chore.reward || 0), 0);

            // If no data, return fallback to show something meaningful
            if (totalEarned === 0 && goalsBudget === 0) {
                return generateFallbackData();
            }

            return [
                {
                    name: "Reward Saved",
                    value: rewardSaved,
                    color: chartConfig.rewardSaved.color
                },
                {
                    name: "Reward Spent",
                    value: rewardSpent,
                    color: chartConfig.rewardSpent.color
                },
                {
                    name: "Goals Budget",
                    value: goalsBudget,
                    color: chartConfig.goalsBudget.color
                }
            ].filter(item => item.value > 0); // Only show segments with values
        };

        const fetchKidExpenseData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API first
                try {
                    const [kidData, choresData] = await Promise.all([
                        MockApiService.fetchKidById(validKidId),
                        MockApiService.fetchChoresByKidId(validKidId)
                    ]);

                    // Process the data to create expense breakdown
                    const processedData = processExpenseData(kidData, choresData, parseInt(range));
                    setChartData(processedData);
                } catch (apiError) {
                    console.log('API fetch failed, falling back to mock data service:', apiError);

                    // Fallback to direct mock data service
                    const kidData = mockDataService.getKidById(validKidId) || mockDataService.getParent().children[0];
                    const choresData = mockDataService.getChoresByKidId(kidData.id);

                    // Process mock data
                    const processedData = processExpenseData(kidData, choresData, parseInt(range));
                    setChartData(processedData);
                }
            } catch (err) {
                console.error('Error fetching kid expense data:', err);
                setError('Failed to load expense data');

                // Generate fallback mock data matching the image
                setChartData(generateFallbackData());
            } finally {
                setLoading(false);
            }
        }; fetchKidExpenseData();
    }, [validKidId, range]); if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="flex-shrink-0 pb-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="h-full flex flex-col">
                        {/* Circular skeleton for pie chart */}
                        <div className="flex-1 mb-4 flex items-center justify-center">
                            <Skeleton className="w-[150px] h-[150px] rounded-full" />
                        </div>

                        {/* Legend skeleton items */}
                        <div className="space-y-2">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-3 h-3 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="flex flex-col">
                <CardContent className="flex items-center justify-center h-full">
                    <p className="text-red-600">Error loading chart: {error}</p>
                </CardContent>
            </Card>
        );
    }

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
                    {/* <div className="text-center mb-4">
                        <p className="text-2xl font-bold">{formatCurrency(getTotalValue())}</p>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                    </div> */}

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