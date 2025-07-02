'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Wallet, ClipboardList } from 'lucide-react';
import { transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
import { transformAllowancesFromBackend } from '@/lib/utils/allowanceTransforms';

// Type for paginated API responses
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

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

const LoadingState = () => (
    <Card className="lg:h-[400px] flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-32" />
            </div>
        </CardHeader>
        <CardContent className="flex-1">
            <div className="flex flex-col items-center h-full">
                <div className="mx-auto aspect-square max-h-[200px] w-[200px] animate-pulse bg-muted rounded-full" />
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

interface InfoStateProps {
    isWallet: boolean;
}

const InfoState = ({ isWallet }: InfoStateProps) => (
    <Card className="lg:h-[400px] xl:h-[420px] flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                    {isWallet ? 'Savings Breakdown' : 'Chore Breakdown'}
                </CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    {isWallet ? (
                        <Wallet className="w-8 h-8 text-muted-foreground" />
                    ) : (
                        <ClipboardList className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    {isWallet ? 'Savings Info' : 'Chores Info'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    {isWallet
                        ? 'Your savings information will be displayed here when available'
                        : 'Your chores information will be displayed here when available'
                    }
                </p>
            </div>
        </CardContent>
    </Card>
);

interface AppPieChartProps {
    refreshTrigger?: number;
}

const AppPieChart = ({ refreshTrigger }: AppPieChartProps = {}) => {
    const [range, setRange] = useState("7");
    const [isLoading, setIsLoading] = useState(true);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const pathname = usePathname();
    const { data: session } = useSession();
    const isWallet = pathname.includes('/wallet');

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setNeedsRetry(false);

            try {
                if (isWallet) {
                    // Fetch savings data from API
                    const response = await fetch(getApiUrl(API_ENDPOINTS.ALLOWANCES), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.user?.accessToken}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch allowance data');
                    }
                    const data = await response.json();
                    console.log('Raw allowance data (PieChart):', data);
                    
                    // Handle both paginated responses and direct arrays
                    let allowanceArray;
                    if (Array.isArray(data)) {
                        allowanceArray = data;
                    } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
                        allowanceArray = data.results;
                    } else {
                        console.error('Unexpected data format:', data);
                        throw new Error('Invalid data format: Expected array or paginated response');
                    }

                    // Transform backend data to frontend format
                    const transformedAllowances = transformAllowancesFromBackend(allowanceArray);
                    console.log('Transformed allowances (PieChart):', transformedAllowances);

                    const totalSaved = transformedAllowances.reduce((sum, allowance) => sum + allowance.amount, 0);
                    const totalSpent = transformedAllowances.reduce((sum, allowance) =>
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
                    const response = await fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.user?.accessToken}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch chores data');
                    }
                    const data: BackendTask[] | PaginatedResponse<BackendTask> = await response.json();
                    console.log('Raw tasks data (PieChart):', data);

                    // Handle both paginated responses and direct arrays
                    let tasksArray: BackendTask[];
                    if (Array.isArray(data)) {
                        tasksArray = data;
                    } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
                        tasksArray = data.results;
                    } else {
                        console.error('Unexpected data format:', data);
                        throw new Error('Invalid data format: Expected array or paginated response');
                    }

                    // Transform backend data to frontend format
                    const transformedData = transformTasksFromBackend(tasksArray);
                    console.log('Transformed tasks (PieChart):', transformedData);

                    const completedCount = transformedData.filter(chore => chore.status === "completed").length;
                    const pendingCount = transformedData.filter(chore => chore.status === "pending").length;

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
                setNeedsRetry(true);
            } finally {
                setIsLoading(false);
            }
        }; fetchData();
    }, [session?.user?.id, pathname, range, isWallet, refreshTrigger]);

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const currentConfig = isWallet ? chartConfigs.savings : chartConfigs.chores;

    if (isLoading) {
        return <LoadingState />;
    }

    if (needsRetry || chartData.length === 0) {
        return <InfoState isWallet={isWallet} />;
    }

    return (
        <Card className="lg:h-[400px] xl:h-[420px] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                        {isWallet ? 'Savings Breakdown' : 'Chore Breakdown'}
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
                                            isWallet
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
                                                        {isWallet
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
                                        {isWallet
                                            ? (data.name === 'Saved' ? 'Reward Saved' : 'Reward Spent')
                                            : `${data.name} Chore`}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {isWallet
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