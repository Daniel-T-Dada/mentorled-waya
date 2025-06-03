'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDataService } from '@/lib/services/mockDataService';
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

// Chart configurations for different pages
const chartConfigs = {
    chores: {
        value: {
            label: "Chores",
        },
        Completed: {
            label: "Completed",
            color: "#7DE2D1",
        },
        Pending: {
            label: "Pending",
            color: "#FFB800",
        },
    },
    savings: {
        value: {
            label: "Savings",
        },
        Saved: {
            label: "Reward Saved",
            color: "#7DE2D1",
        },
        Spent: {
            label: "Reward Spent",
            color: "#FFB800",
        },
    },
} satisfies Record<string, ChartConfig>;


interface ChartDataItem {
    name: string;
    value: number;
    color: string;
}

const AppPieChart = () => {
    const [range, setRange] = useState("7");
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const pathname = usePathname();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (!session?.user?.id) {
                    console.log('No session user ID, using mock data');
                    throw new Error('No session');
                }

                if (pathname.includes('/wallet')) {
                    // Fetch savings data from API
                    const response = await fetch(getApiUrl(API_ENDPOINTS.ALLOWANCES));
                    if (!response.ok) {
                        console.log('API request failed, using mock data');
                        throw new Error('Failed to fetch allowance data');
                    }
                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error('Invalid data format');
                    }

                    const totalSaved = data.reduce((sum, allowance) => sum + allowance.amount, 0);
                    const totalSpent = data.reduce((sum, allowance) =>
                        sum + (allowance.status === 'completed' ? allowance.amount : 0), 0);

                    setChartData([
                        {
                            name: "Saved",
                            value: totalSaved,
                            color: chartConfigs.savings.Saved.color
                        },
                        {
                            name: "Spent",
                            value: totalSpent,
                            color: chartConfigs.savings.Spent.color
                        },
                    ]);
                } else {
                    // Fetch chores data from API
                    const response = await fetch(getApiUrl(API_ENDPOINTS.CHORES));
                    if (!response.ok) {
                        console.log('API request failed, using mock data');
                        throw new Error('Failed to fetch chores data');
                    }
                    const data = await response.json();

                    if (!Array.isArray(data)) {
                        throw new Error('Invalid data format');
                    }

                    const completedCount = data.filter(chore => chore.status === "completed").length;
                    const pendingCount = data.filter(chore => chore.status === "pending").length;

                    setChartData([
                        {
                            name: "Completed",
                            value: completedCount,
                            color: chartConfigs.chores.Completed.color
                        },
                        {
                            name: "Pending",
                            value: pendingCount,
                            color: chartConfigs.chores.Pending.color
                        },
                    ]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Fallback to mock data
                console.log('Using mock data as fallback');

                if (pathname.includes('/wallet')) {
                    const allowanceHistory = mockDataService.getAllAllowanceHistory();
                    const totalSaved = allowanceHistory.reduce((sum, history) => sum + history.allowanceGiven, 0);
                    const totalSpent = allowanceHistory.reduce((sum, history) => sum + history.allowanceSpent, 0);

                    setChartData([
                        {
                            name: "Saved",
                            value: totalSaved,
                            color: chartConfigs.savings.Saved.color
                        },
                        {
                            name: "Spent",
                            value: totalSpent,
                            color: chartConfigs.savings.Spent.color
                        },
                    ]);
                } else {
                    const chores = mockDataService.getChoresByDateRange(range);
                    console.log('Filtered chores:', chores);

                    // const today = new Date();
                    // today.setHours(0, 0, 0, 0);

                    // if (range === "7") {
                    //     const sevenDaysAgo = new Date(today);
                    //     sevenDaysAgo.setDate(today.getDate() - 7);
                    //     console.log('Filtering for last 7 days, comparison date:', sevenDaysAgo.toISOString());
                    //     filteredChores = mockChores.filter(chore => {
                    //         const choreDate = new Date(chore.createdAt);
                    //         choreDate.setHours(0, 0, 0, 0);
                    //         const isAfter = choreDate >= sevenDaysAgo;
                    //         console.log(`Chore ${chore.id} created at ${chore.createdAt} (normalized: ${choreDate.toISOString()}) >= ${sevenDaysAgo.toISOString()}? ${isAfter}`);
                    //         return isAfter;
                    //     });
                    // } else if (range === "30") {
                    //     const thirtyDaysAgo = new Date(today);
                    //     thirtyDaysAgo.setDate(today.getDate() - 30);
                    //     console.log('Filtering for last 30 days, comparison date:', thirtyDaysAgo.toISOString());
                    //     filteredChores = mockChores.filter(chore => {
                    //         const choreDate = new Date(chore.createdAt);
                    //         choreDate.setHours(0, 0, 0, 0);
                    //         const isAfter = choreDate >= thirtyDaysAgo;
                    //         console.log(`Chore ${chore.id} created at ${chore.createdAt} (normalized: ${choreDate.toISOString()}) >= ${thirtyDaysAgo.toISOString()}? ${isAfter}`);
                    //         return isAfter;
                    //     });
                    // } else {
                    //     console.log('No date range filter applied');
                    //     filteredChores = mockChores;
                    // }

                    // console.log('Filtered chores:', filteredChores);

                    // const completedCount = filteredChores.filter(chore => chore.status === "completed").length;
                    // const pendingCount = filteredChores.filter(chore => chore.status === "pending").length;

                    const completedCount = chores.filter(chore => chore.status === "completed").length;
                    const pendingCount = chores.filter(chore => chore.status === "pending").length;

                    console.log('Completed count:', completedCount);
                    console.log('Pending count:', pendingCount);

                    // Data for the pie chart (recharts format)
                    const chartData = [
                        {
                            name: "Completed",
                            value: completedCount,
                            color: chartConfigs.chores.Completed.color
                        },
                        {
                            name: "Pending",
                            value: pendingCount,
                            color: chartConfigs.chores.Pending.color
                        },
                    ];

                    console.log('Processed chart data:', chartData);
                    console.log('-----------------------------------');

                    setChartData(chartData);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, pathname, range]);

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const currentConfig = pathname.includes('/wallet') ? chartConfigs.savings : chartConfigs.chores;

    if (isLoading) {
        return (
            <Card className="lg:h-[400px] flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" /> {/* Title skeleton */}
                        <Skeleton className="h-8 w-32" /> {/* Select dropdown skeleton */}
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="flex flex-col items-center h-full">
                        {/* Chart skeleton */}
                        <div className="mx-auto aspect-square max-h-[200px] w-[200px] animate-pulse bg-muted rounded-full" />

                        {/* Legend skeleton */}
                        <div className="flex flex-col gap-2 w-full mt-4">
                            {[...Array(2)].map((_, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-3 h-3 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
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

    return (
        <Card className=" lg:h-[400px] xl:h-[420px] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                        {pathname.includes('/wallet') ? 'Savings Breakdown' : 'Chore Breakdown'}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Select value={range} onValueChange={setRange}>
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
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col items-center h-full">
                    <ChartContainer
                        config={currentConfig}
                        className="mx-auto aspect-square max-h-[200px] w-[200px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        hideLabel={false}
                                        formatter={(value) => [
                                            pathname.includes('/wallet')
                                                ? `₦${value.toLocaleString()}`
                                                : `${value} Chores`,
                                            ''
                                        ]}
                                    />
                                }
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                startAngle={180}
                                endAngle={-180}
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}

                                {totalValue > 0 && (
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        className="fill-foreground text-2xl font-bold"
                                                    >
                                                        {pathname.includes('/wallet')
                                                            ? `₦${totalValue.toLocaleString()}`
                                                            : totalValue.toLocaleString()}
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                )}
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="flex flex-col gap-2 w-full mt-4 text-sm">
                        {chartData.map((data) => (
                            <div key={data.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: data.color }}
                                    ></div>
                                    <span>
                                        {pathname.includes('/wallet')
                                            ? (data.name === 'Saved' ? 'Reward Saved' : 'Reward Spent')
                                            : `${data.name} Chore`}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {pathname.includes('/wallet')
                                        ? `₦${data.value.toLocaleString()}`
                                        : `${data.value} Chore`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default AppPieChart;