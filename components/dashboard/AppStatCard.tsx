'use client'

import { useState, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Task, transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';

// Type for paginated API responses
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Type for chore summary API response
interface ChoreSummary {
    pending: number;
    completed: number;
    missed: number;
    total: number;
}

// Type for wallet dashboard stats API response
interface WalletDashboardStats {
    family_wallet_balance: string;
    total_rewards_sent: string;
    total_rewards_pending: string;
    children_count: number;
    total_children_balance: string;
}

interface Wallet {
    id: string;
    child: {
        id: string;
        username: string;
        avatar: string;
    };
    balance: number;
    total_earned?: number;
    total_spent?: number;
    savings_rate?: number;
    created_at: string;
    updated_at: string;
}

interface StatItem {
    title: string;
    value: string;
    percentageChange?: number;
    trend?: 'up' | 'down' | 'neutral';
}

interface AppStatCardProps {
    kidId?: string; // Optional prop for kid-specific stats
    refreshTrigger?: number; // Trigger to refresh data
}

const AppStatCard = memo<AppStatCardProps>(({ kidId, refreshTrigger }: AppStatCardProps = {}) => {
    const [chores, setChores] = useState<Task[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [choreSummary, setChoreSummary] = useState<ChoreSummary | null>(null);
    const [walletStats, setWalletStats] = useState<WalletDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const { data: session } = useSession();
    const isWalletPage = pathname.includes('/wallet');

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                if (isWalletPage) {
                    // For wallet pages, use wallet dashboard stats
                    const walletStatsResponse = await fetch(getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    });

                    if (walletStatsResponse.ok) {
                        const statsData: WalletDashboardStats = await walletStatsResponse.json();
                        console.log('Wallet dashboard stats:', statsData);
                        setWalletStats(statsData);
                    } else {
                        console.error('Failed to fetch wallet stats:', walletStatsResponse.status);
                        throw new Error(`Failed to fetch wallet stats: ${walletStatsResponse.status}`);
                    }
                } else if (pathname.includes('/taskmaster')) {
                    // For taskmaster page, use chore summary
                    const [summaryRes, walletsResponse] = await Promise.all([
                        fetch(getApiUrl(API_ENDPOINTS.CHORE_SUMMARY), {
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
                        })
                    ]);

                    if (summaryRes.ok) {
                        const summaryData: ChoreSummary = await summaryRes.json();
                        console.log('Chore summary data:', summaryData);
                        setChoreSummary(summaryData);
                    } else {
                        console.error('Failed to fetch chore summary:', summaryRes.status, summaryRes.statusText);
                        throw new Error(`Failed to fetch chore summary: ${summaryRes.status}`);
                    }

                    // Handle children wallets response
                    if (walletsResponse.ok) {
                        const walletsData = await walletsResponse.json();
                        console.log('Wallets data:', walletsData);

                        // Handle both paginated and direct array responses
                        let walletsArray = [];
                        if (Array.isArray(walletsData)) {
                            walletsArray = walletsData;
                        } else if (walletsData && Array.isArray(walletsData.results)) {
                            walletsArray = walletsData.results;
                        } else {
                            console.error('Unexpected wallets data format:', walletsData);
                            walletsArray = [];
                        }

                        // Transform the wallets data to the expected format
                        const transformedWallets = walletsArray.map((wallet: any) => ({
                            id: wallet.id || wallet.child_id || 'unknown',
                            child: {
                                id: wallet.child_id || wallet.id || 'unknown',
                                username: wallet.child_name || wallet.child_username || 'Unknown',
                                avatar: wallet.child_avatar || ''
                            },
                            balance: parseFloat(wallet.balance) || 0,
                            total_earned: parseFloat(wallet.total_earned) || 0,
                            total_spent: parseFloat(wallet.total_spent) || 0,
                            savings_rate: parseFloat(wallet.savings_rate) || 0,
                            created_at: wallet.created_at || new Date().toISOString(),
                            updated_at: wallet.updated_at || new Date().toISOString()
                        }));

                        setWallets(transformedWallets);
                    } else {
                        console.error('Failed to fetch wallets data:', walletsResponse.status, walletsResponse.statusText);
                        // Don't throw error for wallets as it's not critical for taskmaster stats
                        setWallets([]);
                    }
                } else {
                    // For other pages, fetch wallet stats, chore summary and detailed chores data
                    const [walletStatsResponse, summaryRes, choresResponse, walletsResponse] = await Promise.all([
                        fetch(getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS), {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.accessToken}`,
                            },
                        }),
                        fetch(getApiUrl(API_ENDPOINTS.CHORE_SUMMARY), {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.accessToken}`,
                            },
                        }),
                        fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS), {
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
                        })
                    ]);

                    // Handle wallet dashboard stats
                    if (walletStatsResponse.ok) {
                        const statsData: WalletDashboardStats = await walletStatsResponse.json();
                        console.log('Wallet dashboard stats (default view):', statsData);
                        setWalletStats(statsData);
                    } else {
                        console.error('Failed to fetch wallet stats for default view:', walletStatsResponse.status);
                        setWalletStats(null);
                    }

                    // Handle chore summary (non-critical for other pages)
                    if (summaryRes.ok) {
                        const summaryData: ChoreSummary = await summaryRes.json();
                        console.log('Chore summary data:', summaryData);
                        setChoreSummary(summaryData);
                    } else {
                        console.error('Failed to fetch chore summary:', summaryRes.status, summaryRes.statusText);
                        // Don't throw error for summary as we can fall back to detailed data
                        setChoreSummary(null);
                    }

                    let walletsData = [];

                    // Handle children wallets response
                    if (walletsResponse.ok) {
                        const rawWalletsData = await walletsResponse.json();
                        console.log('Raw wallets data:', rawWalletsData);

                        // Handle both paginated and direct array responses
                        if (Array.isArray(rawWalletsData)) {
                            walletsData = rawWalletsData;
                        } else if (rawWalletsData && Array.isArray(rawWalletsData.results)) {
                            walletsData = rawWalletsData.results;
                        } else {
                            console.error('Unexpected wallets data format:', rawWalletsData);
                            walletsData = [];
                        }

                        // Transform the wallets data to the expected format
                        const transformedWallets = walletsData.map((wallet: any) => ({
                            id: wallet.id || wallet.child_id || 'unknown',
                            child: {
                                id: wallet.child_id || wallet.id || 'unknown',
                                username: wallet.child_name || wallet.child_username || 'Unknown',
                                avatar: wallet.child_avatar || ''
                            },
                            balance: parseFloat(wallet.balance) || 0,
                            total_earned: parseFloat(wallet.total_earned) || 0,
                            total_spent: parseFloat(wallet.total_spent) || 0,
                            savings_rate: parseFloat(wallet.savings_rate) || 0,
                            created_at: wallet.created_at || new Date().toISOString(),
                            updated_at: wallet.updated_at || new Date().toISOString()
                        }));

                        setWallets(transformedWallets);
                    } else {
                        console.error('Failed to fetch wallets data:', walletsResponse.status, walletsResponse.statusText);
                        throw new Error(`Failed to fetch wallets data: ${walletsResponse.status}`);
                    }

                    if (!choresResponse.ok) {
                        throw new Error('Failed to fetch chores data');
                    }

                    const choresData: BackendTask[] | PaginatedResponse<BackendTask> = await choresResponse.json();
                    console.log('Raw chores data (StatCard):', choresData);
                    console.log('Raw wallets data (StatCard):', walletsData);

                    // Handle both paginated responses and direct arrays for chores
                    let tasksArray;
                    if (Array.isArray(choresData)) {
                        tasksArray = choresData;
                    } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                        tasksArray = choresData.results;
                    } else {
                        console.error('Unexpected chores data format:', choresData);
                        throw new Error('Invalid chores data format: Expected array or paginated response');
                    }

                    if (!Array.isArray(walletsData)) {
                        console.error('Expected wallets array but got:', typeof walletsData, walletsData);
                        throw new Error('Invalid wallets data format: Expected array');
                    }

                    // Transform backend task data to frontend format
                    const transformedChores = transformTasksFromBackend(tasksArray);
                    setChores(transformedChores);
                    // No need to transform wallets again as they're already transformed above
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, session?.user?.accessToken, refreshTrigger, pathname, isWalletPage]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    const getStats = (): StatItem[] => {
        // Filter data by kidId if provided
        const filteredChores = kidId ? chores.filter(chore => chore.assignedTo === kidId) : chores;
        const filteredWallets = kidId ? wallets.filter(wallet => wallet.child.id === kidId) : wallets;

        const totalBalance = filteredWallets.reduce((sum, wallet) => sum + wallet.balance, 0);

        // Kid-specific stats for individual kid dashboard
        if (kidId) {
            const completedChores = filteredChores.filter(chore => chore.status === "completed").length;
            const pendingChores = filteredChores.filter(chore => chore.status === "pending").length;

            return [
                {
                    title: "Current Balance",
                    value: formatCurrency(totalBalance),
                    percentageChange: 12,
                    trend: 'up'
                },
                {
                    title: "Completed Chores",
                    value: `${completedChores} Chores`,
                    percentageChange: 8,
                    trend: 'up'
                },
                {
                    title: "Pending Chores",
                    value: `${pendingChores} Chores`,
                    percentageChange: -5,
                    trend: 'down'
                },
            ];
        }

        // Use summary data for taskmaster page
        if (pathname.includes('/taskmaster') && choreSummary) {
            return [
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${choreSummary.total} Chores`,
                },
                {
                    title: 'Total Number of Completed Chores',
                    value: `${choreSummary.completed} Chores`,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${choreSummary.pending} Chores`,
                },
            ];
        }

        // For other pages, use the existing logic with manual calculations
        const totalChores = filteredChores.length;
        const completedChores = filteredChores.filter(chore => chore.status === "completed").length;
        const pendingChores = filteredChores.filter(chore => chore.status === "pending").length;

        // Use wallet dashboard stats for wallet pages
        if (isWalletPage && walletStats) {
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(parseFloat(walletStats.family_wallet_balance)),
                },
                {
                    title: 'Total Rewards Sent',
                    value: formatCurrency(parseFloat(walletStats.total_rewards_sent)),
                },
                {
                    title: 'Total Rewards Pending',
                    value: formatCurrency(parseFloat(walletStats.total_rewards_pending)),
                },

            ];
        }

        // For insights pages
        if (pathname.includes('/insights')) {
            return [
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChores} Chores`,
                },
                {
                    title: 'Total Number of Completed Chores',
                    value: `${completedChores} Chores`,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChores} Chores`,
                },
            ];
        } else {
            // Default dashboard/parents view - use same wallet stats as wallet pages
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: walletStats ? formatCurrency(parseFloat(walletStats.family_wallet_balance)) : formatCurrency(0),
                    percentageChange: 15,
                    trend: 'up'
                },
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${choreSummary?.total || 0} Chores`,
                    percentageChange: -5,
                    trend: 'down'
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${choreSummary?.pending || 0} Chores`,
                    percentageChange: 12,
                    trend: 'up'
                },
            ];
        }
    };

    const stats = getStats();

    return (
        <>
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="min-h-[120px]">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/4" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                stats.map((stat, index) => (
                    <Card key={index} className="min-h-[120px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2 leading-tight">
                                {stat.value}
                                {stat.percentageChange !== undefined && stat.trend && (
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
});

AppStatCard.displayName = 'AppStatCard';

export default AppStatCard;