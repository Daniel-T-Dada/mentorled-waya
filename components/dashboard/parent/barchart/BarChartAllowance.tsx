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

const BarChartAllowance = () => {
    const [range, setRange] = useState("7");
    const [allowanceData, setAllowanceData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [screenSize, setScreenSize] = useState('sm');
    const { data: session } = useSession();

    console.log('BarChartAllowance component rendered');
    console.log('Session status:', session?.user?.accessToken ? 'has token' : 'no token');
    console.log('Loading state:', isLoading);
    console.log('Allowance data length:', allowanceData.length);

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
        console.log('BarChartAllowance useEffect triggered');
        console.log('Session:', session);
        console.log('Range:', range);

        const fetchAllowanceData = async () => {
            if (!session?.user?.accessToken) {
                console.log('No access token available in BarChartAllowance');
                setIsLoading(false);
                return;
            }

            console.log('Starting to fetch allowance data...');
            setIsLoading(true);
            setNeedsRetry(false);

            try {
                console.log('Fetching from endpoints:');
                console.log('Transactions:', getApiUrl(API_ENDPOINTS.TRANSACTIONS));
                console.log('Children Wallets:', getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS));
                console.log('Allowances:', getApiUrl(API_ENDPOINTS.ALLOWANCES));

                // Fetch transactions, child wallets, and allowances data
                const [transactionsRes, childWalletsRes, allowancesRes] = await Promise.all([
                    fetch(getApiUrl(API_ENDPOINTS.TRANSACTIONS), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    }),
                    fetch(getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    }),
                    fetch(getApiUrl(API_ENDPOINTS.ALLOWANCES), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    })
                ]);

                if (!transactionsRes.ok || !childWalletsRes.ok || !allowancesRes.ok) {
                    console.error('API response not ok:', {
                        transactions: { status: transactionsRes.status, statusText: transactionsRes.statusText },
                        childWallets: { status: childWalletsRes.status, statusText: childWalletsRes.statusText },
                        allowances: { status: allowancesRes.status, statusText: allowancesRes.statusText }
                    });
                    throw new Error('Failed to fetch allowance data');
                }

                const transactionsData = await transactionsRes.json();
                const childWalletsData = await childWalletsRes.json();
                const allowancesData = await allowancesRes.json();

                console.log('Transactions data (BarChartAllowance):', transactionsData);
                console.log('Child wallets data (BarChartAllowance):', childWalletsData);
                console.log('Allowances data (BarChartAllowance):', allowancesData);

                // Try to get allowance data from transactions first, then from allowances endpoint
                const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData.results || [];
                console.log('All transactions:', transactions);
                console.log('Transaction types found:', [...new Set(transactions.map((tx: any) => tx.type))]);

                // Try multiple possible transaction types for allowances
                const possibleAllowanceTypes = ['allowance_payment', 'allowance', 'payment', 'topup'];
                let allowancePayments = transactions.filter((tx: any) => tx.type === 'allowance_payment');

                // If no allowance_payment transactions, try other types
                if (allowancePayments.length === 0) {
                    for (const type of possibleAllowanceTypes) {
                        const payments = transactions.filter((tx: any) => tx.type === type);
                        if (payments.length > 0) {
                            console.log(`Found ${payments.length} transactions of type '${type}', using these as allowance payments`);
                            allowancePayments = payments;
                            break;
                        }
                    }
                }

                // If still no allowance payments from transactions, try the allowances endpoint
                if (allowancePayments.length === 0) {
                    const allowances = Array.isArray(allowancesData) ? allowancesData : allowancesData.results || [];
                    console.log('No allowance transactions found, checking allowances endpoint:', allowances);

                    // Convert allowances to transaction-like format
                    allowancePayments = allowances.map((allowance: any) => ({
                        ...allowance,
                        type: 'allowance',
                        amount: allowance.amount || allowance.total_amount || 0,
                        created_at: allowance.created_at || allowance.date_created || new Date().toISOString()
                    }));
                }

                console.log('Final allowance payments:', allowancePayments);

                // Extract spending data from child wallets
                const childWallets = Array.isArray(childWalletsData) ? childWalletsData : childWalletsData.results || [];
                console.log('Child wallets:', childWallets);
                const totalSpent = childWallets.reduce((sum: number, wallet: any) => sum + parseFloat(wallet.total_spent || 0), 0);
                console.log('Total spent across all children:', totalSpent);

                // Group allowance payments by date
                const allowanceByDate = allowancePayments.reduce((acc: any, payment: any) => {
                    const date = new Date(payment.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric'
                    }).replace(',', '');

                    if (!acc[date]) {
                        acc[date] = { given: 0, spent: 0 };
                    }

                    acc[date].given += parseFloat(payment.amount);
                    return acc;
                }, {});

                console.log('Allowance grouped by date:', allowanceByDate);

                // Create data for all days in the range
                const today = new Date();
                const chartData: ChartDataPoint[] = [];
                const daysToShow = parseInt(range);

                for (let i = daysToShow - 1; i >= 0; i--) {
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() - i);

                    const dateKey = targetDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric'
                    }).replace(',', '');

                    const dayData = allowanceByDate[dateKey] || { given: 0, spent: 0 };

                    chartData.push({
                        date: dateKey,
                        allowanceGiven: dayData.given,
                        allowanceSpent: dayData.spent
                    });
                }

                // Distribute total spent across dates proportionally (only for days with allowances)
                const totalGiven = chartData.reduce((sum, item) => sum + item.allowanceGiven, 0);
                if (totalGiven > 0) {
                    chartData.forEach(item => {
                        if (item.allowanceGiven > 0) {
                            item.allowanceSpent = Math.round((item.allowanceGiven / totalGiven) * totalSpent);
                        } else {
                            item.allowanceSpent = 0; // No spending on days with no allowances
                        }
                    });
                }

                console.log('Final chart data for BarChartAllowance:', chartData);
                setAllowanceData(chartData);
            } catch (err) {
                console.error("Error fetching allowance data:", err);
                console.error('Error details:', {
                    message: err instanceof Error ? err.message : 'Unknown error',
                    stack: err instanceof Error ? err.stack : undefined
                });
                setNeedsRetry(true);
            } finally {
                console.log('Allowance fetch completed, setting loading to false');
                setIsLoading(false);
            }
        };

        fetchAllowanceData();
    }, [session, range]);

    // Since we generate data for the exact range selected, we can use all the data
    const dataToDisplay = allowanceData;

    console.log(`[BarChartAllowance] Data for ${range} days (${dataToDisplay.length} items):`, dataToDisplay);

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

export default BarChartAllowance;
