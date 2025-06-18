'use client'

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { ClipboardList } from 'lucide-react';

interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
}

interface Activity {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    status: "completed" | "pending" | "cancelled" | "paid" | "processing";
    createdAt: string;
    amount: number;
}

interface AppKidsActivitiesProps {
    kidId?: string;
}

const LoadingState = () => (
    <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border rounded-md p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-4 w-1/6" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const InfoState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Activities Info</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Your children&apos;s activities will be displayed here when available
        </p>
    </div>
);

const AppKidsActivities = ({ kidId }: AppKidsActivitiesProps = {}) => {
    const [kids, setKids] = useState<Kid[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activeKidTab, setActiveKidTab] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [needsRetry, setNeedsRetry] = useState(false);
    const { data: session } = useSession();

    const fetchData = useCallback(async () => {
        if (!session?.user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setNeedsRetry(false);

        try {
            const [kidsResponse, activitiesResponse] = await Promise.all([
                fetch(getApiUrl(API_ENDPOINTS.LIST_CHILDREN)),
                fetch(getApiUrl(API_ENDPOINTS.CHORES))
            ]);

            if (!kidsResponse.ok || !activitiesResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const kidsData = await kidsResponse.json();
            const activitiesData = await activitiesResponse.json();

            if (!Array.isArray(kidsData) || !Array.isArray(activitiesData)) {
                throw new Error('Invalid data format');
            }

            setKids(kidsData);
            setActivities(activitiesData.map(chore => ({
                id: chore.id,
                title: chore.title,
                description: chore.description,
                assignedTo: chore.assignedTo,
                status: chore.status as Activity['status'],
                createdAt: chore.createdAt,
                amount: chore.reward
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
            setNeedsRetry(true);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredActivities = useMemo(() => {
        if (kidId) {
            return activities.filter(activity => activity.assignedTo === kidId);
        }

        if (activeKidTab === "all") {
            return activities;
        }
        return activities.filter(activity => activity.assignedTo === activeKidTab);
    }, [activities, activeKidTab, kidId]);

    const topKids = useMemo(() => {
        const kidLastActivityDates = activities.reduce((acc, activity) => {
            const date = new Date(activity.createdAt).getTime();
            if (!acc[activity.assignedTo] || date > acc[activity.assignedTo]) {
                acc[activity.assignedTo] = date;
            }
            return acc;
        }, {} as Record<string, number>);

        return [...kids]
            .sort((a, b) => {
                const dateA = kidLastActivityDates[a.id] || 0;
                const dateB = kidLastActivityDates[b.id] || 0;
                return dateB - dateA;
            })
            .slice(0, 3);
    }, [kids, activities]);

    const getKidName = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.name || 'Unknown Kid';
    };

    const getKidAvatar = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.avatar || undefined;
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    const getStatusBadgeStyles = (status: Activity['status']) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-gray-200 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Kid&apos;s Activities</CardTitle>
                    <CardDescription>View and manage activities for each kid.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoadingState />
                </CardContent>
            </Card>
        );
    }

    if (needsRetry || (activities.length === 0 && kids.length === 0)) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Kid&apos;s Activities</CardTitle>
                    <CardDescription>View and manage activities for each kid.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InfoState />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>
                        {kidId ? `${kids.find(k => k.id === kidId)?.name || 'Kid'}&apos;s Activities` : "Kid&apos;s Activities"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {kidId ? 'View and manage activities for this kid.' : 'View and manage activities for each kid.'}
                </CardDescription>

                {!kidId && (
                    <div className="flex items-center justify-between">
                        <Tabs value={activeKidTab} onValueChange={setActiveKidTab} className="w-full mt-4">
                            <TabsList className="grid grid-cols-4 mb-4">
                                <TabsTrigger value="all">All Activities</TabsTrigger>
                                {topKids.map(kid => (
                                    <TabsTrigger key={kid.id} value={kid.id}>{kid.name}&apos;s Activities</TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value={activeKidTab} className="mt-0 space-y-4">
                                {filteredActivities.length === 0 ? (
                                    <p className="text-center text-muted-foreground">
                                        No activities found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.
                                    </p>
                                ) : (
                                    filteredActivities.map(activity => (
                                        <Card key={activity.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col">
                                                    <h3 className="font-medium">{activity.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyles(activity.status)}`}>
                                                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-lg font-semibold text-green-600">
                                                    {formatCurrency(activity.amount)}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={getKidAvatar(activity.assignedTo)} alt={getKidName(activity.assignedTo)} />
                                                        <AvatarFallback>{getKidName(activity.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{getKidName(activity.assignedTo)}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {kidId && (
                    <div className="mt-4 space-y-4">
                        {filteredActivities.length === 0 ? (
                            <p className="text-center text-muted-foreground">No activities found for this kid.</p>
                        ) : (
                            filteredActivities.map(activity => (
                                <Card key={activity.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <h3 className="font-medium">{activity.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyles(activity.status)}`}>
                                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="text-lg font-semibold text-green-600">
                                            {formatCurrency(activity.amount)}
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Avatar className="w-5 h-5">
                                                <AvatarImage src={getKidAvatar(activity.assignedTo)} alt={getKidName(activity.assignedTo)} />
                                                <AvatarFallback>{getKidName(activity.assignedTo)?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs">{getKidName(activity.assignedTo)}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {/* Activities list is rendered inside CardHeader */}
            </CardContent>
        </Card>
    );
};

export default AppKidsActivities; 