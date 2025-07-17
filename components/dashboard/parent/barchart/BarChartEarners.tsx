'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
    date: string;
    highest: number;
    lowest: number;
    highestName?: string;
    lowestName?: string;
}

interface ApiResponse {
    chart_data: {
        [date: string]: {
            [child_name: string]: number;
        };
    };
    highest_earner: {
        name: string;
        amount: number;
    };
    lowest_earner: {
        name: string;
        amount: number;
    };
}

const chartConfig = {
    highest: { label: "Highest Earner", color: "#7DE2D1" },
    lowest: { label: "Lowest Earner", color: "#7D238E" },
} satisfies ChartConfig;



const BarChartEarners = () => {
    const [earnerData, setEarnerData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [screenSize, setScreenSize] = useState('sm');
    const [range, setRange] = useState('7');
    const { data: session } = useSession();

    console.log('BarChartEarners component rendered');
    console.log('Session status:', session?.user?.accessToken ? 'has token' : 'no token');
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    console.log('Earner data length:', earnerData.length);

    // Custom hook for lg breakpoint detection to sort out the barchart overshooting its parent container.
    useEffect(() => {
        const getScreenSize = () => {
            const width = window.innerWidth;
            if (width >= 1024) return 'xl';      // xl: 1280px+
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
        const baseMargin = { top: 5, right: 10, left: 5 };

        switch (screenSize) {
            case 'xl':
                return { ...baseMargin, bottom: 300 };  // Extra large screens
            case 'lg':
                return { ...baseMargin, bottom: 300 };  // Large screens (desktop)
            case 'md':
                return { ...baseMargin, bottom: 30 };  // Medium screens (tablet)
            case 'sm':
                return { ...baseMargin, bottom: 15 };  // Small screens (large mobile)
            case 'xs':
            default:
                return { ...baseMargin, bottom: 5 };   // Extra small screens (mobile)
        }
    };

    const chartMargin = getChartMargin();

    const fetchEarnerData = useCallback(async () => {
        if (!session?.user?.accessToken) {
            console.log('No access token available');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching earner data from:', getApiUrl(API_ENDPOINTS.WALLET_REWARD_BAR_CHART));
            console.log('Session token available:', !!session.user.accessToken);

            // Fetch the reward bar chart data for highest/lowest earners
            const response = await fetch(
                getApiUrl(API_ENDPOINTS.WALLET_REWARD_BAR_CHART),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch earner data: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse = await response.json();
            console.log('Earner data received:', data);
            console.log('Available dates in API response:', Object.keys(data.chart_data));

            // Extract chart data from the response
            const chartData: ChartDataPoint[] = [];
            const daysToShow = parseInt(range);
            const today = new Date();

            for (let i = daysToShow - 1; i >= 0; i--) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - i);

                // Create multiple date formats to match against API response
                const dateFormats = [
                    // Format 1: "July 05, 2025" (with leading zero)
                    targetDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    }),
                    // Format 2: "July 5, 2025" (without leading zero)
                    targetDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })
                ];

                console.log(`Checking date formats for ${targetDate.toISOString().split('T')[0]}:`, dateFormats);

                // Check if we have data for this date using any of the formats
                let dayData = null;
                for (const dateFormat of dateFormats) {
                    if (data.chart_data[dateFormat]) {
                        dayData = data.chart_data[dateFormat];
                        console.log(`Found data for ${dateFormat}:`, dayData);
                        break;
                    }
                }

                if (dayData) {
                    // Find highest and lowest earners for this specific date
                    const earnings = Object.entries(dayData);
                    const sortedEarnings = earnings.sort((a, b) => b[1] - a[1]);

                    const highest = sortedEarnings[0];
                    const lowest = sortedEarnings[sortedEarnings.length - 1];

                    chartData.push({
                        date: targetDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                        }).replace(',', ''),
                        highest: highest ? highest[1] : 0,
                        lowest: lowest && lowest !== highest ? lowest[1] : 0,
                        highestName: highest ? highest[0] : '',
                        lowestName: lowest && lowest !== highest ? lowest[0] : '',
                    });
                } else {
                    // No data for this date
                    chartData.push({
                        date: targetDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                        }).replace(',', ''),
                        highest: 0,
                        lowest: 0,
                        highestName: '',
                        lowestName: '',
                    });
                }
            }

            setEarnerData(chartData);
            console.log('Processed chart data:', chartData);
        } catch (err) {
            console.error('Error fetching earner data:', err);
            console.error('Error details:', {
                message: err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined
            });
            setError('Failed to load earner data. Please try again.');
            setNeedsRetry(true);
        } finally {
            console.log('Fetch completed, setting loading to false');
            setLoading(false);
        }
    }, [session?.user?.accessToken, range]);

    useEffect(() => {
        console.log('BarChartEarners useEffect triggered');
        console.log('Session:', session);
        console.log('Range:', range);
        fetchEarnerData();
    }, [fetchEarnerData, session, range]);

    const handleRetry = () => {
        setNeedsRetry(false);
        fetchEarnerData();
    };



    if (error) {
        return (
            <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg font-semibold">Top Earners</CardTitle>
                    <CardDescription>Highest vs Lowest Earners (7 days)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <TrendingDown className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">{error}</p>
                        {needsRetry && (
                            <button
                                onClick={handleRetry}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Try again
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const dataToDisplay = earnerData;

    console.log('Rendering chart with data:', dataToDisplay);

    return (
        <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">Top Earners</CardTitle>
                        {/* <CardDescription>Highest vs Lowest Earners</CardDescription> */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-[#7DE2D1] rounded-full"></span>
                                <span>Highest Earner</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-[#7D238E] rounded-full"></span>
                                <span>Lowest Earner</span>
                            </div>
                        </div>
                        <Select value={range} onValueChange={setRange}>
                            <SelectTrigger className="w-32">
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
                {/* Temporary debug info */}
                {/* {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                        <p><strong>Data points:</strong> {dataToDisplay.length}</p>
                        <p><strong>Has data:</strong> {dataToDisplay.some(d => d.highest > 0 || d.lowest > 0) ? 'Yes' : 'No'}</p>
                    </div>
                )} */}

                <ChartContainer config={chartConfig} className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            accessibilityLayer
                            data={dataToDisplay}
                            margin={chartMargin}
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
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                                                <p className="font-semibold mb-2">{label}</p>
                                                {payload.map((entry: any, index: number) => {
                                                    const isHighest = entry.dataKey === 'highest';
                                                    const childName = isHighest ? entry.payload.highestName : entry.payload.lowestName;
                                                    const amount = entry.value;

                                                    if (amount === 0) return null;

                                                    return (
                                                        <div key={index} className="flex items-center justify-between space-x-4">
                                                            <div className="flex items-center space-x-2">
                                                                <span
                                                                    className="w-3 h-3 rounded"
                                                                    style={{ backgroundColor: entry.color }}
                                                                />
                                                                <span className="text-sm">{childName}</span>
                                                            </div>
                                                            <span className="font-semibold">
                                                                {amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
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
