'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, getBaseApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Wallet, ClipboardList } from 'lucide-react';

// Type for chore summary API response
interface ChoreSummary {
    pending: number;
    completed: number;
    missed: number;
    total: number;
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
    const { data: session, status } = useSession();
    const isWallet = pathname.includes('/wallet');

    // Add debug logs for component rendering
    console.log('=== AppPieChart COMPONENT RENDERED ===');
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('Component state - loading:', isLoading, 'needsRetry:', needsRetry, 'chartData:', chartData);

    useEffect(() => {
        console.log('=== AppPieChart useEffect TRIGGERED ===');
        console.log('Session status in useEffect:', status);
        console.log('Session data in useEffect:', session);

        if (status === 'loading') {
            console.log('Session is loading, waiting...');
            return;
        }

        if (status === 'unauthenticated') {
            console.log('User is not authenticated');
            setNeedsRetry(true);
            setIsLoading(false);
            return;
        }

        if (!session?.user?.id) {
            console.log('No user ID found in session');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setNeedsRetry(false);

        const fetchData = async () => {
            try {
                if (isWallet) {
                    // Debug session info
                    console.log('=== PIE CHART DEBUG ===');
                    console.log('Session user:', session?.user);
                    console.log('Access token present:', !!session?.user?.accessToken);
                    console.log('Access token preview:', session?.user?.accessToken?.substring(0, 20) + '...');

                    // Fetch savings breakdown data from API
                    const apiUrl = getApiUrl(API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN);
                    console.log('=== SAVINGS BREAKDOWN API CALL ===');
                    console.log('Full API URL:', apiUrl);
                    console.log('Base URL:', getBaseApiUrl());
                    console.log('Endpoint:', API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN);
                    console.log('Access Token:', session?.user?.accessToken?.substring(0, 30) + '...');

                    const requestOptions = {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.user?.accessToken}`,
                        },
                    };

                    console.log('Request options:', requestOptions);
                    console.log('Making GET request to:', apiUrl);

                    const response = await fetch(apiUrl, requestOptions);

                    console.log('Response status:', response.status);
                    console.log('Response statusText:', response.statusText);
                    console.log('Response URL:', response.url);
                    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('=== API ERROR ===');
                        console.error('Error status:', response.status);
                        console.error('Error statusText:', response.statusText);
                        console.error('Error response body:', errorText);
                        console.error('Request URL:', apiUrl);
                        console.error('Request method:', requestOptions.method);
                        console.error('Request headers:', requestOptions.headers);
                        throw new Error(`Failed to fetch savings breakdown data: ${response.status} ${response.statusText}`);
                    }
                    const savingsData = await response.json();
                    console.log('Savings breakdown data (PieChart):', savingsData);

                    // Calculate total saved and spent from all children
                    const totalSaved = savingsData.reduce((sum: number, child: any) => sum + (child.reward_saved || 0), 0);
                    const totalSpent = savingsData.reduce((sum: number, child: any) => sum + (child.reward_spent || 0), 0);

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
                    // Fetch chore summary data from API
                    const response = await fetch(getApiUrl(API_ENDPOINTS.CHORE_SUMMARY), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.user?.accessToken}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to fetch chore summary data');
                    }
                    const summaryData: ChoreSummary = await response.json();
                    console.log('Chore summary data (PieChart):', summaryData);

                    setChartData([
                        {
                            name: "Completed",
                            value: summaryData.completed,
                            color: chartConfigs.chores.Completed.color
                        },
                        {
                            name: "Pending",
                            value: summaryData.pending,
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
        };

        fetchData();
    }, [session, pathname, range, isWallet, refreshTrigger, status]);

    const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const currentConfig = isWallet ? chartConfigs.savings : chartConfigs.chores;

    // Add debug log for render output
    console.log('=== AppPieChart RENDER OUTPUT ===');
    console.log('Will render loading?', isLoading);
    console.log('Will render retry info?', needsRetry);
    console.log('Will render chart?', !isLoading && !needsRetry && chartData.length > 0);





    // Always show either the info state or the chart, never a skeleton/loading state
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
                                                ? `NGN ${value.toLocaleString()}`
                                                : `${value} ${value === 1 ? 'Chore' : 'Chores'}`,
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
                                                return (<text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {totalValue.toLocaleString()}
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
                                        ? `NGN ${data.value.toLocaleString()}`
                                        : `${data.value} ${data.value === 1 ? 'Chore' : 'Chores'}`
                                    }
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