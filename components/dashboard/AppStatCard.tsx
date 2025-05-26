'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { mockDataService } from "@/lib/services/mockDataService";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

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

const AppStatCard = () => {
    const [chores, setChores] = useState<Chore[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // If no session, use mock data
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
                    setChores(mockChores);
                    setWallets(mockWallets);
                    setIsLoading(false);
                    return;
                }

                // Try to fetch from API
                const [choresResponse, walletsResponse] = await Promise.all([
                    fetch(getApiUrl(API_ENDPOINTS.CHORES)),
                    fetch(getApiUrl(API_ENDPOINTS.WALLET))
                ]);

                if (!choresResponse.ok || !walletsResponse.ok) {
                    console.log('API request failed, using mock data');
                    throw new Error('Failed to fetch data');
                }

                const choresData = await choresResponse.json();
                const walletsData = await walletsResponse.json();

                if (!Array.isArray(choresData) || !Array.isArray(walletsData)) {
                    console.log('Invalid data format, using mock data');
                    throw new Error('Fetched data is not in expected array format');
                }

                setChores(choresData);
                setWallets(walletsData);

            } catch (err) {
                console.error("Error fetching data:", err);
                // Fallback to mock data
                console.log('Error occurred, using mock data');
                const mockChores = mockDataService.getAllChores();
                const mockWallets = mockDataService.getParent().children.map(child => ({
                    id: child.id,
                    kidId: child.id,
                    balance: child.balance,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                setChores(mockChores);
                setWallets(mockWallets);
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

    const getStats = () => {
        const totalChores = chores.length;
        const completedChores = chores.filter(chore => chore.status === "completed").length;
        const pendingChores = chores.filter(chore => chore.status === "pending").length;
        const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
        const totalRewardSent = chores
            .filter(chore => chore.status === "completed")
            .reduce((sum, chore) => sum + chore.reward, 0);
        const totalRewardPending = chores
            .filter(chore => chore.status === "pending")
            .reduce((sum, chore) => sum + chore.reward, 0);

        if (pathname.includes('/wallet')) {
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalance),
                },
                {
                    title: 'Total Amount of Reward Sent',
                    value: formatCurrency(totalRewardSent),
                },
                {
                    title: 'Total Amount of Reward Pending',
                    value: formatCurrency(totalRewardPending),
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
        } else {
            // Default dashboard/parents view
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: formatCurrency(totalBalance),
                },
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChores} Chores`,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChores} Chores`,
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
                            <div className="text-2xl font-bold">
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </>
    );
};

export default AppStatCard;