'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MockApiService } from "@/lib/services/mockApiService";
import { mockDataService } from "@/lib/services/mockDataService";
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

    // Get kid data - prioritize prop, then session, then fallback
    // Ensure we use a valid kidId that exists in our mock data
    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId && !propKidId) {
        console.log(`KidBarChart - Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    }

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
            try {
                setLoading(true);
                setError(null);                // Try to fetch from API first
                try {
                    const [, choresData] = await Promise.all([
                        MockApiService.fetchKidById(kidId),
                        MockApiService.fetchChoresByKidId(kidId)
                    ]);

                    // Process the data to create chart data points
                    const processedData = processChoreDataForChart(choresData, parseInt(range));
                    setChartData(processedData);
                } catch (apiError) {
                    console.log('API fetch failed, falling back to mock data service:', apiError);

                    // Fallback to direct mock data service
                    const kidData = mockDataService.getKidById(kidId) || mockDataService.getParent().children[0];
                    const choresData = mockDataService.getChoresByKidId(kidData.id);

                    // Process mock data
                    const processedData = processChoreDataForChart(choresData, parseInt(range));
                    setChartData(processedData);
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
    }, [kidId, range]);

    // Process chore data into chart format
    const processChoreDataForChart = (chores: any[], days: number): ChartDataPoint[] => {
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

            // Filter chores for this date
            const dayChores = chores.filter(chore => {
                const choreDate = new Date(chore.createdAt || chore.dueDate);
                return choreDate.toDateString() === date.toDateString();
            });

            // Calculate metrics for this day
            const rewardEarned = dayChores
                .filter(chore => chore.status === 'completed')
                .reduce((sum, chore) => sum + (chore.reward || 0), 0);

            const goalBudget = dayChores
                .reduce((sum, chore) => sum + (chore.reward || 0), 0);

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