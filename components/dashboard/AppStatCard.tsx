'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    assignedTo: string;
    status: "completed" | "pending" | "cancelled";
}

interface Wallet {
    id: string;
    kidId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

interface StatItem {
    title: string;
    value: string;
    percentageChange?: number;
    trend?: 'up' | 'down' | 'neutral';
}

interface AppStatCardProps {
    kidId?: string; // Optional prop for kid-specific stats
}

const AppStatCard = ({ kidId }: AppStatCardProps = {}) => {
    const [chores, setChores] = useState<Chore[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const [choresResponse, walletsResponse] = await Promise.all([
                    fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS)),
                    fetch(getApiUrl(API_ENDPOINTS.WALLET))
                ]);

                if (!choresResponse.ok || !walletsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const choresData = await choresResponse.json();
                const walletsData = await walletsResponse.json();

                if (!Array.isArray(choresData) || !Array.isArray(walletsData)) {
                    throw new Error('Invalid data format');
                }

                setChores(choresData);
                setWallets(walletsData);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id]);

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
        const filteredWallets = kidId ? wallets.filter(wallet => wallet.kidId === kidId) : wallets;

        const totalChores = filteredChores.length;
        const completedChores = filteredChores.filter(chore => chore.status === "completed").length;
        const pendingChores = filteredChores.filter(chore => chore.status === "pending").length;
        const totalBalance = filteredWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        const totalRewardSent = filteredChores
            .filter(chore => chore.status === "completed")
            .reduce((sum, chore) => sum + chore.reward, 0);
        const totalRewardPending = filteredChores
            .filter(chore => chore.status === "pending")
            .reduce((sum, chore) => sum + chore.reward, 0);

        // Kid-specific stats for individual kid dashboard
        if (kidId) {
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

        // Existing logic for different pages
        if (pathname.includes('/wallet')) {
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalance),
                    percentageChange: 20,
                    trend: 'up'
                },
                {
                    title: 'Total Amount of Reward Sent',
                    value: formatCurrency(totalRewardSent),
                    percentageChange: -10,
                    trend: 'down'
                },
                {
                    title: 'Total Amount of Reward Pending',
                    value: formatCurrency(totalRewardPending),
                    percentageChange: 8,
                    trend: 'up'
                },
            ];
        } else if (pathname.includes('/taskmaster')) {
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
        } else if (pathname.includes('/insights')) {
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
            // Default dashboard/parents view
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalance),
                    percentageChange: 15,
                    trend: 'up'
                },
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChores} Chores`,
                    percentageChange: -5,
                    trend: 'down'
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChores} Chores`,
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
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-1/4" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
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
};

export default AppStatCard;