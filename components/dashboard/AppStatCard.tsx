'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { mockDataService } from "@/lib/services/mockDataService";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Interface for Chore data structure
interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    assignedTo: string;
    status: "completed" | "pending" | "cancelled";
    createdAt: string; // Used for filtering chores by date range
}

interface Wallet {
    id: string;
    kidId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

interface AllowanceHistoryItem {
    allowanceGiven: number;
    allowanceSpent: number;
    date: string;
}

interface StatItem {
    title: string;
    value: string;
    percentageChange?: number;
    trend?: 'up' | 'down' | 'neutral';
    isCurrency?: boolean;
}

interface PreviousPeriodStats {
    totalChores: number;
    completedChores: number;
    pendingChores: number;
    totalBalance: number;
    totalRewardSent: number;
    totalRewardPending: number;
}

const AppStatCard = () => {
    // State variables to hold fetched/filtered data
    const [chores, setChores] = useState<Chore[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [allowanceHistory, setAllowanceHistory] = useState<AllowanceHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const { data: session } = useSession();
    // State for selected date range (used for percentage change calculation)
    const [range, setRange] = useState("7"); // "7" for last 7 days, "30" for last 30 days
    // State to hold calculated statistics for the previous period
    const [previousPeriodStats, setPreviousPeriodStats] = useState<PreviousPeriodStats | null>(null);

    // Effect hook to fetch and process data whenever session or range changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // Calculate start dates for current and previous periods based on the selected range
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const currentPeriodStart = new Date(today);
            const previousPeriodStart = new Date(today);

            if (range === "7") {
                currentPeriodStart.setDate(today.getDate() - 7);
                previousPeriodStart.setDate(today.getDate() - 14);
            } else if (range === "30") {
                currentPeriodStart.setDate(today.getDate() - 30);
                previousPeriodStart.setDate(today.getDate() - 60);
            }

            // Helper function to filter chores by date range
            const filterChoresByDateRange = (data: Chore[], start: Date, end: Date = today) => {
                return data.filter(chore => {
                    const choreDate = new Date(chore.createdAt);
                    choreDate.setHours(0, 0, 0, 0);
                    return choreDate >= start && choreDate < end;
                });
            };

            // Helper function to filter allowance history by date range
            const filterAllowanceHistoryByDateRange = (data: AllowanceHistoryItem[], start: Date, end: Date = today) => {
                return data.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= start && itemDate < end;
                });
            };

            try {
                if (!session?.user?.id) {
                    console.log('No session user ID, using mock data');
                    const mockChores = mockDataService.getAllChores();
                    const mockWallets = mockDataService.getParent().children.map(child => ({
                        id: child.id,
                        kidId: child.id,
                        balance: child.balance,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }));
                    const mockAllowanceHistory: AllowanceHistoryItem[] = mockDataService.getAllAllowanceHistory();

                    const currentChores = filterChoresByDateRange(mockChores, currentPeriodStart);
                    const previousChores = filterChoresByDateRange(mockChores, previousPeriodStart, currentPeriodStart);

                    const currentAllowanceHistory = filterAllowanceHistoryByDateRange(mockAllowanceHistory, currentPeriodStart);
                    const previousAllowanceHistory = filterAllowanceHistoryByDateRange(mockAllowanceHistory, previousPeriodStart, currentPeriodStart);

                    setChores(currentChores);
                    setWallets(mockWallets);
                    setAllowanceHistory(currentAllowanceHistory);

                    const previousTotalBalance = mockWallets.reduce((sum: number, wallet: Wallet) => sum + wallet.balance, 0);
                    const previousTotalRewardSent = previousAllowanceHistory.reduce((sum: number, history: AllowanceHistoryItem) => sum + history.allowanceSpent, 0);
                    const previousTotalRewardPending = previousChores.filter(chore => chore.status === "pending").reduce((sum: number, chore: Chore) => sum + chore.reward, 0);

                    setPreviousPeriodStats({
                        totalChores: previousChores.length,
                        completedChores: previousChores.filter(chore => chore.status === "completed").length,
                        pendingChores: previousChores.filter(chore => chore.status === "pending").length,
                        totalBalance: previousTotalBalance,
                        totalRewardSent: previousTotalRewardSent,
                        totalRewardPending: previousTotalRewardPending,
                    });

                    setIsLoading(false);
                    return;
                }

                const [choresResponse, walletsResponse, allowanceHistoryResponse] = await Promise.all([
                    fetch(getApiUrl(API_ENDPOINTS.CHORES)),
                    fetch(getApiUrl(API_ENDPOINTS.WALLET)),
                    fetch(getApiUrl(API_ENDPOINTS.ALLOWANCES)),
                ]);

                if (!choresResponse.ok || !walletsResponse.ok || !allowanceHistoryResponse.ok) {
                    console.log('API request failed, using mock data as fallback');
                    throw new Error('Failed to fetch data from API');
                }

                const choresData: Chore[] = await choresResponse.json();
                const walletsData: Wallet[] = await walletsResponse.json();
                const allowanceHistoryData: AllowanceHistoryItem[] = await allowanceHistoryResponse.json();

                if (!Array.isArray(choresData) || !Array.isArray(walletsData) || !Array.isArray(allowanceHistoryData)) {
                    console.log('Invalid data format from API, using mock data as fallback');
                    throw new Error('Fetched API data is not in expected array format');
                }

                const currentChores = filterChoresByDateRange(choresData, currentPeriodStart);
                const previousChores = filterChoresByDateRange(choresData, previousPeriodStart, currentPeriodStart);

                const currentAllowanceHistory = filterAllowanceHistoryByDateRange(allowanceHistoryData, currentPeriodStart);
                const previousAllowanceHistory = filterAllowanceHistoryByDateRange(allowanceHistoryData, previousPeriodStart, currentPeriodStart);

                setChores(currentChores);
                setWallets(walletsData);
                setAllowanceHistory(currentAllowanceHistory);

                const previousTotalBalance = walletsData.reduce((sum: number, wallet: Wallet) => sum + wallet.balance, 0);
                const previousTotalRewardSent = previousAllowanceHistory.reduce((sum: number, history: AllowanceHistoryItem) => sum + history.allowanceSpent, 0);
                const previousTotalRewardPending = previousChores.filter(chore => chore.status === "pending").reduce((sum: number, chore: Chore) => sum + chore.reward, 0);

                setPreviousPeriodStats({
                    totalChores: previousChores.length,
                    completedChores: previousChores.filter(chore => chore.status === "completed").length,
                    pendingChores: previousChores.filter(chore => chore.status === "pending").length,
                    totalBalance: previousTotalBalance,
                    totalRewardSent: previousTotalRewardSent,
                    totalRewardPending: previousTotalRewardPending,
                });

            } catch (err) {
                console.error("Error fetching data:", err);
                console.log('Error occurred, using mock data for both periods');
                const mockChores = mockDataService.getAllChores();
                const mockWallets = mockDataService.getParent().children.map(child => ({
                    id: child.id,
                    kidId: child.id,
                    balance: child.balance,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                const mockAllowanceHistory: AllowanceHistoryItem[] = mockDataService.getAllAllowanceHistory();

                const currentChores = filterChoresByDateRange(mockChores, currentPeriodStart);
                const previousChores = filterChoresByDateRange(mockChores, previousPeriodStart, currentPeriodStart);

                const currentAllowanceHistory = filterAllowanceHistoryByDateRange(mockAllowanceHistory, currentPeriodStart);
                const previousAllowanceHistory = filterAllowanceHistoryByDateRange(mockAllowanceHistory, previousPeriodStart, currentPeriodStart);

                setChores(currentChores);
                setWallets(mockWallets);
                setAllowanceHistory(currentAllowanceHistory);

                const previousTotalBalance = mockWallets.reduce((sum: number, wallet: Wallet) => sum + wallet.balance, 0);
                const previousTotalRewardSent = previousAllowanceHistory.reduce((sum: number, history: AllowanceHistoryItem) => sum + history.allowanceSpent, 0);
                const previousTotalRewardPending = previousChores.filter(chore => chore.status === "pending").reduce((sum: number, chore: Chore) => sum + chore.reward, 0);

                setPreviousPeriodStats({
                    totalChores: previousChores.length,
                    completedChores: previousChores.filter(chore => chore.status === "completed").length,
                    pendingChores: previousChores.filter(chore => chore.status === "pending").length,
                    totalBalance: previousTotalBalance,
                    totalRewardSent: previousTotalRewardSent,
                    totalRewardPending: previousTotalRewardPending,
                });

            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, range]);

    // Helper function to format currency to NGN
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    // Function to calculate statistics based on the current and previous period data
    const getStats = (): StatItem[] => {
        const totalChoresCurrent = chores.length;
        const completedChoresCurrent = chores.filter(chore => chore.status === "completed").length;
        const pendingChoresCurrent = chores.filter(chore => chore.status === "pending").length;
        const totalBalanceCurrent = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        const totalRewardSentCurrent = allowanceHistory
            .reduce((sum, history) => sum + history.allowanceSpent, 0);
        const totalRewardPendingCurrent = chores
            .filter(chore => chore.status === "pending")
            .reduce((sum, chore) => sum + chore.reward, 0);

        // Helper function to calculate percentage change and determine trend
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) {
                return { percentageChange: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' };
            }
            const change = ((current - previous) / previous) * 100;
            const trend: 'up' | 'down' | 'neutral' = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
            return { percentageChange: parseFloat(change.toFixed(0)), trend };
        };

        // Determine which stats to display based on the current pathname
        if (pathname.includes('/wallet')) {
            const balanceChange = calculateChange(totalBalanceCurrent, previousPeriodStats?.totalBalance || 0);
            const rewardSentChange = calculateChange(totalRewardSentCurrent, previousPeriodStats?.totalRewardSent || 0);
            const rewardPendingChange = calculateChange(totalRewardPendingCurrent, previousPeriodStats?.totalRewardPending || 0);

            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalanceCurrent),
                    percentageChange: balanceChange.percentageChange,
                    trend: balanceChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: true,
                },
                {
                    title: 'Total Amount of Reward Sent',
                    value: formatCurrency(totalRewardSentCurrent),
                    percentageChange: rewardSentChange.percentageChange,
                    trend: rewardSentChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: true,
                },
                {
                    title: 'Total Amount of Reward Pending',
                    value: formatCurrency(totalRewardPendingCurrent),
                    percentageChange: rewardPendingChange.percentageChange,
                    trend: rewardPendingChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: true,
                },
            ];
        } else if (pathname.includes('/taskmaster')) {
            const totalChoresChange = calculateChange(totalChoresCurrent, previousPeriodStats?.totalChores || 0);
            const completedChoresChange = calculateChange(completedChoresCurrent, previousPeriodStats?.completedChores || 0);
            const pendingChoresChange = calculateChange(pendingChoresCurrent, previousPeriodStats?.pendingChores || 0);
            return [
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChoresCurrent} Chores`,
                    percentageChange: totalChoresChange.percentageChange,
                    trend: totalChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
                {
                    title: 'Total Number of Completed Chores',
                    value: `${completedChoresCurrent} Chores`,
                    percentageChange: completedChoresChange.percentageChange,
                    trend: completedChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChoresCurrent} Chores`,
                    percentageChange: pendingChoresChange.percentageChange,
                    trend: pendingChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
            ];
        } else if (pathname.includes('/insights')) {
            const totalChoresChange = calculateChange(totalChoresCurrent, previousPeriodStats?.totalChores || 0);
            const completedChoresChange = calculateChange(completedChoresCurrent, previousPeriodStats?.completedChores || 0);
            const pendingChoresChange = calculateChange(pendingChoresCurrent, previousPeriodStats?.pendingChores || 0);
            return [
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChoresCurrent} Chores`,
                    percentageChange: totalChoresChange.percentageChange,
                    trend: totalChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
                {
                    title: 'Total Number of Completed Chores',
                    value: `${completedChoresCurrent} Chores`,
                    percentageChange: completedChoresChange.percentageChange,
                    trend: completedChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChoresCurrent} Chores`,
                    percentageChange: pendingChoresChange.percentageChange,
                    trend: pendingChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
            ];
        } else {
            const totalBalanceChange = calculateChange(totalBalanceCurrent, previousPeriodStats?.totalBalance || 0);
            const totalChoresChange = calculateChange(totalChoresCurrent, previousPeriodStats?.totalChores || 0);
            const pendingChoresChange = calculateChange(pendingChoresCurrent, previousPeriodStats?.pendingChores || 0);
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalanceCurrent),
                    percentageChange: totalBalanceChange.percentageChange,
                    trend: totalBalanceChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: true,
                },
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChoresCurrent} Chores`,
                    percentageChange: totalChoresChange.percentageChange,
                    trend: totalChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChoresCurrent} Chores`,
                    percentageChange: pendingChoresChange.percentageChange,
                    trend: pendingChoresChange.trend as 'up' | 'down' | 'neutral',
                    isCurrency: false,
                },
            ];
        }
    };

    // Get the statistics to display based on the current pathname and data
    const stats = getStats();

    // Render the stat cards
    return (
        <>
            {/* Show skeleton loading state while data is fetching */}
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <Skeleton className="h-4 w-1/2" />
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
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-1/4" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                /* Render the stat cards once data is loaded */
                stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            {/* Select component for date range */}
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
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center justify-between gap-2">
                                {stat.value}
                                {/* Conditionally render badge only for currency stats that have percentage change and trend */}
                                {stat.isCurrency && stat.percentageChange !== undefined && stat.trend && (
                                    <Badge
                                        className={`flex items-center gap-1 ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : stat.trend === 'down' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {stat.trend === 'up' ? (
                                            <TrendingUp size={12} />
                                        ) : stat.trend === 'down' ? (
                                            <TrendingDown size={12} />
                                        ) : null}
                                        {Math.abs(stat.percentageChange)}%
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </>
    );
};

export default AppStatCard;