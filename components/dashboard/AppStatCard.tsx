'use client'

import { useState, useEffect } from "react";
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

const AppStatCard = ({ kidId, refreshTrigger }: AppStatCardProps = {}) => {
    const [chores, setChores] = useState<Task[]>([]);
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
                // For parent dashboards (no kidId), fetch all chores for aggregation
                // For kid dashboards (with kidId), fetch chores specific to that child
                let choresEndpoint;
                let url;
                
                if (kidId && session.user.isChild) {
                    // For kids viewing their own dashboard - use assignedTo filter
                    choresEndpoint = API_ENDPOINTS.LIST_TASKS;
                    url = `${getApiUrl(choresEndpoint)}?assignedTo=${kidId}`;
                } else if (kidId) {
                    // For parents viewing a specific kid's data
                    choresEndpoint = API_ENDPOINTS.LIST_TASKS;
                    url = `${getApiUrl(choresEndpoint)}?assignedTo=${kidId}`;
                } else {
                    // For parents viewing aggregate stats - fetch all chores
                    choresEndpoint = API_ENDPOINTS.LIST_TASKS;
                    url = getApiUrl(choresEndpoint);
                }

                const choresResponse = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                if (!choresResponse.ok) {
                    throw new Error(`Failed to fetch chores data: ${choresResponse.status}`);
                }

                const choresData: BackendTask[] | PaginatedResponse<BackendTask> = await choresResponse.json();

                // Handle different response formats and pagination
                let allChores: BackendTask[] = [];

                if (Array.isArray(choresData)) {
                    // Direct array response
                    allChores = choresData;
                } else if (choresData && typeof choresData === 'object' && Array.isArray(choresData.results)) {
                    // Paginated response - collect all pages
                    allChores = [...choresData.results];

                    // If there are more pages, fetch them all
                    let nextUrl = choresData.next;
                    while (nextUrl) {
                        console.log('Fetching next page for stats:', nextUrl);
                        const nextResponse = await fetch(nextUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.user.accessToken}`,
                            },
                        });

                        if (!nextResponse.ok) {
                            console.warn('Failed to fetch next page, stopping pagination');
                            break;
                        }

                        const nextData: PaginatedResponse<BackendTask> = await nextResponse.json();
                        allChores = [...allChores, ...nextData.results];
                        nextUrl = nextData.next;
                    }
                } else {
                    console.error('Unexpected chores data format:', choresData);
                    throw new Error('Invalid chores data format: Expected array or paginated response');
                }

                console.log(`Fetched ${allChores.length} total chores across all pages for stats`);

                // Transform backend task data to frontend format
                const transformedChores = transformTasksFromBackend(allChores);
                setChores(transformedChores);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [session?.user?.id, refreshTrigger, kidId, session?.user?.accessToken, session?.user?.isChild]);

    const getStats = (): StatItem[] => {
        // For kid-specific stats, filter data by kidId
        const filteredChores = kidId ? chores.filter(chore => chore.assignedTo === kidId) : chores;

        const totalChores = filteredChores.length;
        const completedChores = filteredChores.filter(chore => chore.status === "completed").length;
        const pendingChores = filteredChores.filter(chore => chore.status === "pending").length;

        // Kid-specific stats for individual kid dashboard
        if (kidId) {
            return [
                {
                    title: "Total Chores",
                    value: `${totalChores} Chore${totalChores !== 1 ? 's' : ''}`,
                    percentageChange: totalChores > 0 ? 12 : 0,
                    trend: totalChores > 0 ? 'up' : 'neutral'
                },
                {
                    title: "Completed Chores",
                    value: `${completedChores} Chore${completedChores !== 1 ? 's' : ''}`,
                    percentageChange: completedChores > 0 ? 8 : 0,
                    trend: completedChores > 0 ? 'up' : 'neutral'
                },
                {
                    title: "Pending Chores",
                    value: `${pendingChores} Chore${pendingChores !== 1 ? 's' : ''}`,
                    percentageChange: pendingChores > 0 ? -5 : 0,
                    trend: pendingChores > 0 ? 'down' : 'neutral'
                },
            ];
        }

        // Parent dashboard - taskmaster page
        if (pathname.includes('/taskmaster')) {
            return [
                {
                    title: 'Total Number of Chores Assigned',
                    value: `${totalChores} Chore${totalChores !== 1 ? 's' : ''}`,
                },
                {
                    title: 'Total Number of Completed Chores',
                    value: `${completedChores} Chore${completedChores !== 1 ? 's' : ''}`,
                },
                {
                    title: 'Total Number of Pending Chores',
                    value: `${pendingChores} Chore${pendingChores !== 1 ? 's' : ''}`,
                },
            ];
        } else {
            // Default parent dashboard view - includes family wallet placeholder and aggregated chore stats for all children
            return [
                {
                    title: 'Total Amount in Family Wallet',
                    value: '₦1,250.00', // Changed to naira currency - placeholder until real API is ready
                    percentageChange: 8,
                    trend: 'up'
                },
                {
                    title: 'Total Number of Chore Assigned',
                    value: `${totalChores} Chore${totalChores !== 1 ? 's' : ''}`,
                    percentageChange: totalChores > 0 ? 15 : 0,
                    trend: totalChores > 0 ? 'up' : 'neutral'
                },
                {
                    title: 'Total Number of Pending Chore',
                    value: `${pendingChores} Chore${pendingChores !== 1 ? 's' : ''}`,
                    percentageChange: pendingChores > 0 ? 12 : 0,
                    trend: pendingChores > 0 ? 'down' : 'neutral'
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