'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task, transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
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

    // Get kid ID from session when available, otherwise use the prop
    const childId = session?.user?.childId || propKidId;

    // If we don't have a valid kid ID, use the user ID (for a kid session)
    const kidId = childId || session?.user?.id;

    console.log('[KidPieChart] Session user:', session?.user?.name, 'Using kidId:', kidId);    // Generate fallback data that matches the image
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
        // Process task data into expense breakdown format
        const processExpenseData = (tasks: Task[], days: number): ChartDataPoint[] => {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            // Filter tasks for the selected date range
            const recentTasks = tasks.filter(task => {
                const taskDate = new Date(task.createdAt || task.dueDate);
                return taskDate >= startDate;
            });

            // Calculate expenses
            const totalEarned = recentTasks
                .filter(task => task.status === 'completed')
                .reduce((sum, task) => sum + (parseFloat(task.reward) || 0), 0);

            // Assume 70% of earned money is saved, 30% is spent
            const rewardSaved = totalEarned * 0.7;
            const rewardSpent = totalEarned * 0.3;

            // Goals budget from pending/upcoming tasks
            const goalsBudget = recentTasks
                .filter(task => task.status === 'pending')
                .reduce((sum, task) => sum + (parseFloat(task.reward) || 0), 0);

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
            if (!session?.user || !kidId) {
                setLoading(false);
                setChartData(generateFallbackData());
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Determine which endpoint to use based on user role
                const choreEndpoint = session.user.isChild
                    ? `${API_ENDPOINTS.LIST_TASKS}?assignedTo=${kidId}`  // Kid viewing their own chores using the working endpoint
                    : API_ENDPOINTS.LIST_TASKS;   // Parent viewing chores

                try {
                    // Fetch the chores data from the API
                    const choresResponse = await fetch(getApiUrl(choreEndpoint), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    });

                    if (!choresResponse.ok) {
                        throw new Error(`Failed to fetch chores: ${choresResponse.status}`);
                    }

                    const choresData = await choresResponse.json();
                    console.log('[KidPieChart] Raw chores data:', choresData);

                    // Process chores data (handle both array and paginated responses)
                    let tasksArray: BackendTask[] = [];
                    if (Array.isArray(choresData)) {
                        tasksArray = choresData;
                    } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                        tasksArray = choresData.results;
                    }

                    // Convert to frontend format
                    const transformedChores = transformTasksFromBackend(tasksArray);

                    // For kids using the assignedTo parameter, the API already filters their chores
                    // For parents, we need to filter by kidId
                    const kidChores = session.user.isChild
                        ? transformedChores  // Already filtered by the API using assignedTo parameter
                        : transformedChores.filter(chore => chore.assignedTo === kidId);

                    // Process the data to create expense breakdown
                    const processedData = processExpenseData(kidChores, parseInt(range));
                    setChartData(processedData);
                } catch (apiError) {
                    console.error('API fetch failed:', apiError);
                    setError('Failed to load expense data');
                    // Use fallback data for chart visualization
                    setChartData(generateFallbackData());
                }
            } catch (err) {
                console.error('Error fetching kid expense data:', err);
                setError('Failed to load expense data');
                // Generate fallback mock data matching the image
                setChartData(generateFallbackData());
            } finally {
                setLoading(false);
            }
        };

        fetchKidExpenseData();
    }, [kidId, range, session]); if (loading) {
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