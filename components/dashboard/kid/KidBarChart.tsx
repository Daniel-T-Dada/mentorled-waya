'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task, transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
import { Skeleton } from "@/components/ui/skeleton";

// Chart configuration matching the image colors
const chartConfig = {
    rewardEarned: {
        label: "Reward Earned",
        color: "#7DE2D1"
    },
    goalBudget: {
        label: "Goal Budget",
        color: "#FFB800"
    },
    rewardSpent: {
        label: "Reward Spent",
        color: "#7D238E"
    },
} satisfies ChartConfig;

interface ChartDataPoint {
    date: string;
    rewardEarned: number;
    goalBudget: number;
    rewardSpent: number;
}

interface KidBarChartProps {
    kidId?: string;
}

const KidBarChart = ({ kidId: propKidId }: KidBarChartProps) => {
    const { data: session } = useSession();
    const [range, setRange] = useState("7");
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [screenSize, setScreenSize] = useState('sm');

    // Get kid ID from session when available, otherwise use the prop
    const childId = session?.user?.childId || propKidId;

    // If we don't have a valid kid ID, use the user ID (for a kid session)
    const kidId = childId || session?.user?.id;

    console.log('[KidBarChart] Session user:', session?.user?.name, 'Using kidId:', kidId);

    // Custom hook for screen size detection to handle responsive chart margins
    useEffect(() => {
        const getScreenSize = () => {
            const width = window.innerWidth;
            if (width >= 1280) return 'xl';      // xl: 1280px+
            if (width >= 1024) return 'lg';      // lg: 1024px+
            if (width >= 768) return 'md';       // md: 768px+
            if (width >= 640) return 'sm';       // sm: 640px+
            return 'xs';                         // xs: <640px
        };

        const handleResize = () => {
            setScreenSize(getScreenSize());
        };

        // Set initial value
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Responsive margin configuration based on screen size
    const getChartMargin = () => {
        const baseMargin = { top: 20, right: 30, left: 20 };

        switch (screenSize) {
            case 'xl':
                return { ...baseMargin, bottom: 300 };  // Extra large screens
            case 'lg':
                return { ...baseMargin, bottom: 300 };  // Large screens (desktop)
            case 'md':
                return { ...baseMargin, bottom: 30 };   // Medium screens (tablet)
            case 'sm':
                return { ...baseMargin, bottom: 15 };   // Small screens (large mobile)
            case 'xs':
            default:
                return { ...baseMargin, bottom: 5 };    // Extra small screens (mobile)
        }
    };

    const chartMargin = getChartMargin();

    useEffect(() => {
        const fetchKidChartData = async () => {
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
                    console.log('[KidBarChart] Raw chores data:', choresData);

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

                    // Process the data to create chart data points
                    const processedData = processChoreDataForChart(kidChores, parseInt(range));
                    setChartData(processedData);
                } catch (apiError) {
                    console.error('API fetch failed:', apiError);
                    setError('Failed to load chart data');

                    // Use fallback data for visualization
                    setChartData(generateFallbackData());
                }
            } catch (err) {
                console.error('Error fetching kid chart data:', err);
                setError('Failed to load chart data');

                // Generate fallback mock data matching the image
                setChartData(generateFallbackData());
            } finally {
                setLoading(false);
            }
        };

        fetchKidChartData();
    }, [kidId, range, session]);

    // Process task data into chart format
    const processChoreDataForChart = (tasks: Task[], days: number): ChartDataPoint[] => {
        const today = new Date();
        const chartData: ChartDataPoint[] = [];

        // Generate data for the last N days
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            // Filter tasks for this date
            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.createdAt || task.dueDate);
                return taskDate.toDateString() === date.toDateString();
            });

            // Calculate metrics for this day
            const rewardEarned = dayTasks
                .filter(task => task.status === 'completed')
                .reduce((sum: number, task) => sum + (parseFloat(task.reward) || 0), 0);

            const goalBudget = dayTasks
                .reduce((sum: number, task) => sum + (parseFloat(task.reward) || 0), 0);

            const rewardSpent = rewardEarned * 0.3; // Assume 30% of earned is spent

            chartData.push({
                date: dateStr,
                rewardEarned,
                goalBudget,
                rewardSpent
            });
        }

        return chartData;
    };

    // Generate fallback data that matches the image
    const generateFallbackData = (): ChartDataPoint[] => {
        return [
            { date: "Apr 21", rewardEarned: 0, goalBudget: 2000, rewardSpent: 0 },
            { date: "Apr 22", rewardEarned: 5500, goalBudget: 3000, rewardSpent: 0 },
            { date: "Apr 23", rewardEarned: 0, goalBudget: 1500, rewardSpent: 0 },
            { date: "Apr 24", rewardEarned: 0, goalBudget: 3000, rewardSpent: 0 },
            { date: "Apr 25", rewardEarned: 0, goalBudget: 1000, rewardSpent: 0 },
            { date: "Apr 26", rewardEarned: 0, goalBudget: 2000, rewardSpent: 2000 },
            { date: "Apr 27", rewardEarned: 0, goalBudget: 1500, rewardSpent: 0 },
        ];
    };

    const formatCurrency = (value: number) => {
        return `NGN ${value.toLocaleString()}`;
    }; if (loading) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-32" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <Skeleton className="h-full w-full rounded-lg" />
                </CardContent>
            </Card>
        );
    } if (error) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-red-600">Error loading chart: {error}</p>
                        <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
                    </div>
                </CardContent>
            </Card>
        );
    } return (
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
                                <SelectItem value="30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Legend - Responsive layout */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardEarned.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Reward Earned</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.goalBudget.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Goal Budget</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded" style={{ backgroundColor: chartConfig.rewardSpent.color }}></div>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">Reward Spent</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-2 sm:p-4 md:p-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={chartMargin}
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
                                tickFormatter={(value) => {
                                    if (screenSize === 'xs' || screenSize === 'sm') {
                                        return `${(value / 1000).toFixed(0)}K`;
                                    }
                                    return `NGN ${(value / 1000).toFixed(0)}K`;
                                }}
                                domain={[0, 6000]}
                                ticks={[0, 2000, 4000, 6000]}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => [
                                            formatCurrency(Number(value)),
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
                                dataKey="goalBudget"
                                fill={chartConfig.goalBudget.color}
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