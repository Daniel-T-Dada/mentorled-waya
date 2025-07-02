'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Wallet } from 'lucide-react';

interface ChartDataPoint {
    date: string;
    allowanceGiven: number;
    allowanceSpent: number;
}

interface ApiAllowance {
    id: string;
    kidId: string;
    parentId: string;
    amount: number;
    frequency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastPaidAt: string | null;
    nextPaymentDate: string | null;
}

const chartConfig = {
    allowanceGiven: { label: "Allowance Given", color: "#7DE2D1" },
    allowanceSpent: { label: "Allowance Spent", color: "#7D238E" },
} satisfies ChartConfig;

const LoadingState = () => (
    <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
        <CardHeader className="flex-shrink-0">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
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

const InfoState = () => (
    <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
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
        <CardContent className="flex-1 flex items-center justify-center">
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

const AppBarChart = () => {
    const [range, setRange] = useState("7");
    const [allowanceData, setAllowanceData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [screenSize, setScreenSize] = useState('sm');
    const { data: session } = useSession();



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



    useEffect(() => {
        const fetchAllowanceData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setNeedsRetry(false);

            try {
                const res = await fetch(`${getApiUrl(API_ENDPOINTS.ALLOWANCES)}?parentId=${session.user.id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch allowance data');
                }
                const data = await res.json();
                console.log('Raw allowance data (BarChart):', data);

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

                if (allowanceArray.length > 0) {


                    // Transform the data into the required format
                    const transformedData = allowanceArray.reduce((acc: ChartDataPoint[], allowance: ApiAllowance) => {
                        const date = new Date(allowance.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                        }).replace(',', '');

                        const existingEntry = acc.find(entry => entry.date === date);

                        if (existingEntry) {
                            existingEntry.allowanceGiven += allowance.amount;
                            if (allowance.status === 'completed') {
                                existingEntry.allowanceSpent += allowance.amount;
                            }
                        } else {
                            acc.push({
                                date,
                                allowanceGiven: allowance.amount,
                                allowanceSpent: allowance.status === 'completed' ? allowance.amount : 0
                            });
                        }

                        return acc;
                    }, []);

                    // Sort by date
                    transformedData.sort((a: ChartDataPoint, b: ChartDataPoint) => {
                        const [monthA, dayA] = a.date.split(' ');
                        const [monthB, dayB] = b.date.split(' ');
                        const currentYear = new Date().getFullYear();
                        const dateA = new Date(`${monthA} ${dayA}, ${currentYear}`);
                        const dateB = new Date(`${monthB} ${dayB}, ${currentYear}`);
                        return dateA.getTime() - dateB.getTime();
                    });

                    setAllowanceData(transformedData);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err) {
                console.error("Error fetching allowance data:", err);
                setNeedsRetry(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllowanceData();
    }, [session?.user?.id, range]);

    // Filter data based on range
    const filteredAllowanceData = allowanceData.filter(item => {
        try {
            // convert the date string givin me issues to an object with ti
            const [month, day] = item.date.split(' ');
            const currentYear = new Date().getFullYear();
            const date = new Date(`${month} ${day}, ${currentYear}`);

            const days = parseInt(range);
            const today = new Date();
            const comparisonDate = new Date(today);
            comparisonDate.setDate(today.getDate() - days);

            date.setHours(0, 0, 0, 0);
            comparisonDate.setHours(0, 0, 0, 0);

            return date >= comparisonDate;
        } catch (error) {
            console.error('Error parsing date:', item.date, error);
            return true; // Include items with invalid dates to ensure we show something, maybe this time the bar will show in the UI.........
        }
    });

    // If filtered data is empty, use all data
    const dataToDisplay = filteredAllowanceData.length > 0 ? filteredAllowanceData : allowanceData;

    if (isLoading) {
        return <LoadingState />;
    }

    if (needsRetry || dataToDisplay.length === 0) {
        return <InfoState />;
    }

    return (
        <Card className="sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
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
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
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

export default AppBarChart;