'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { mockDataService } from '@/lib/services/mockDataService';

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

const AppBarChart = () => {
    const [range, setRange] = useState("7");
    const [allowanceData, setAllowanceData] = useState<ChartDataPoint[]>([]);
    const [isAllowanceLoading, setIsAllowanceLoading] = useState(true);
    const [allowanceError, setAllowanceError] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchAllowanceData = async () => {
            if (!session?.user?.id) {
                console.log('No session user ID, using mock data');
                const mockData = mockDataService.getBarChartData();
                console.log('Raw mock data:', mockData);
                setAllowanceData(mockData);
                setIsAllowanceLoading(false);
                return;
            }
            setIsAllowanceLoading(true);
            setAllowanceError(null);
            try {
                const res = await fetch(`http://localhost:3001/api/allowances?parentId=${session.user.id}`);
                if (!res.ok) {
                    console.log('API request failed, using mock data');
                    throw new Error('Failed to fetch allowance data');
                }
                const data = await res.json();
                console.log('API response:', data);

                if (Array.isArray(data)) {


                    // Transform the data into the required format
                    const transformedData = data.reduce((acc: ChartDataPoint[], allowance: ApiAllowance) => {
                        const date = new Date(allowance.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric'
                        }).replace(',', '');

                        // Find if we already have an entry for this date
                        const existingEntry = acc.find(entry => entry.date === date);

                        if (existingEntry) {
                            // Update existing entry
                            existingEntry.allowanceGiven += allowance.amount;
                            if (allowance.status === 'completed') {
                                existingEntry.allowanceSpent += allowance.amount;
                            }
                        } else {
                            // Create new entry
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

                    console.log('Transformed data:', transformedData);

                    // If no data was transformed, use mock data
                    if (transformedData.length === 0) {
                        console.log('No transformed data, using mock data');
                        const mockData = mockDataService.getBarChartData();
                        console.log('Raw mock data:', mockData);
                        setAllowanceData(mockData);
                    } else {
                        setAllowanceData(transformedData);
                    }
                } else {
                    console.log('Invalid data format, using mock data');
                    throw new Error('Fetched data is not in expected array format');
                }
            } catch (err: unknown) {
                console.error("Error fetching allowance data:", err);
                setAllowanceError(err instanceof Error ? err.message : 'Unknown error');


                // Fallback to mock data on error
                console.log('Error occurred, using mock data');
                const mockData = mockDataService.getBarChartData();
                console.log('Raw mock data:', mockData);
                setAllowanceData(mockData);
            } finally {
                setIsAllowanceLoading(false);
            }
        };
        fetchAllowanceData();
    }, [session?.user?.id, range]);

    // Filter data based on range before rendering
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

            // Set both dates to start of day for accurate comparison
            date.setHours(0, 0, 0, 0);
            comparisonDate.setHours(0, 0, 0, 0);

            // For mock data, we'll show all data since it's already filtered
            if (!session?.user?.id) {
                return true;
            }
            // TODO: To remove later after I am done with development
            console.log('Date comparison:', {
                itemDate: date.toISOString(),
                comparisonDate: comparisonDate.toISOString(),
                isAfter: date >= comparisonDate,
                item
            });

            return date >= comparisonDate;
        } catch (error) {
            console.error('Error parsing date:', item.date, error);
            return true; // Include items with invalid dates to ensure we show something, maybe this time the bar will show in the UI.........
        }
    });

    // If filtered data is empty, use all data
    const dataToDisplay = filteredAllowanceData.length > 0 ? filteredAllowanceData : allowanceData;

    console.log('Current allowance data:', allowanceData);
    console.log('Filtered allowance data:', filteredAllowanceData);
    console.log('Data to display:', dataToDisplay);

    if (isAllowanceLoading) {
        return (
            <div className="lg:col-span-2 rounded-lg shadow-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Allowance Breakdown</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    // I want to catch all possible error here
    if (allowanceError) {
        return (
            <div className="lg:col-span-2 rounded-lg shadow-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Allowance Breakdown</CardTitle>
                        <CardDescription>Error: {allowanceError}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="lg:col-span-1">
            <Card>

                <CardHeader>
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

                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                                accessibilityLayer
                                data={dataToDisplay}
                                margin={{
                                    top: 5,
                                    right: 10,
                                    left: 5,
                                    bottom: 5
                                }}
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
        </div>
    );
};

export default AppBarChart;