'use client'

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { mockDataService } from '@/lib/services/mockDataService';
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { toast } from "sonner";


interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
}


interface Activity {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // Kid ID
    status: "completed" | "pending" | "cancelled" | "paid" | "processing";
    createdAt: string;
    amount: number;
}

interface AppKidsActivitiesProps {
    kidId?: string; // Optional prop for filtering activities by kid
}

const AppKidsActivities = ({ kidId }: AppKidsActivitiesProps = {}) => {
    const [kids, setKids] = useState<Kid[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activeKidTab, setActiveKidTab] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    // We keep setError for logging but don't need to display errors since we use mock data
    const [, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState(false);
    const { data: session } = useSession();

    // Function to refresh data from API or fallback to mock data
    const refreshData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!session?.user?.id) {
                console.log('No session user ID, using mock data');
                const mockKids = mockDataService.getAllKids();
                const mockActivities = mockDataService.getAllChores().map(chore => ({
                    id: chore.id,
                    title: chore.title,
                    description: chore.description,
                    assignedTo: chore.assignedTo,
                    status: chore.status as Activity['status'],
                    createdAt: chore.createdAt,
                    amount: chore.reward
                }));
                setKids(mockKids);
                setActivities(mockActivities);
                setIsLoading(false);
                setUsingMockData(true);
                return;
            }

            // Check if the backend is running first
            try {
                const baseUrl = getApiUrl('');
                console.log('Checking if backend is available at:', baseUrl);
                const healthCheck = await fetch(baseUrl, {
                    method: 'HEAD',
                    // Add a timeout to avoid long waits
                    signal: AbortSignal.timeout(3000),
                    // Don't include credentials to avoid CORS issues
                    credentials: 'omit'
                });
                console.log('Backend health check status:', healthCheck.status);
            } catch (healthError) {
                console.error('Backend health check failed:', healthError);
                console.log('Proceeding with API calls anyway...');
            }

            // Fetch both kids and activities data
            const kidsUrl = getApiUrl(API_ENDPOINTS.PARENT_KIDS.replace(':parentId', session.user.id));
            const activitiesUrl = `${getApiUrl(API_ENDPOINTS.CHORES)}?parentId=${session.user.id}`;

            console.log('Fetching kids from:', kidsUrl);
            console.log('Fetching activities from:', activitiesUrl);

            const [kidsResponse, activitiesResponse] = await Promise.all([
                fetch(kidsUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }),
                fetch(activitiesUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                })
            ]);

            if (!kidsResponse.ok || !activitiesResponse.ok) {
                console.log('API request failed, using mock data');
                console.log('Kids API status:', kidsResponse.status, kidsResponse.statusText);
                console.log('Activities API status:', activitiesResponse.status, activitiesResponse.statusText);
                console.log('Kids API URL:', kidsUrl);
                console.log('Activities API URL:', activitiesUrl);
                throw new Error(`Failed to fetch data: Kids API ${kidsResponse.status}, Activities API ${activitiesResponse.status}`);
            }

            const kidsData = await kidsResponse.json();
            const activitiesData = await activitiesResponse.json();

            if (!Array.isArray(kidsData) || !Array.isArray(activitiesData)) {
                console.log('Invalid data format, using mock data');
                throw new Error('Fetched data is not in expected array format');
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

            // Reset mock data flag since we got real data
            setUsingMockData(false);
            toast.success('Kids activities loaded successfully.');

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err instanceof Error ? err.message : 'Unknown error');

            // Fallback to mock data
            console.log('Error occurred, using mock data');
            toast.warning('Unable to connect to server. Using demo data instead.');

            try {
                console.log('Loading mock data...');
                const mockKids = mockDataService.getAllKids();
                console.log('Mock kids loaded:', mockKids.length);

                // Get all chores from mock data service
                const allChores = mockDataService.getAllChores();
                console.log('Raw mock chores:', allChores);

                const mockActivities = allChores.map(chore => {
                    // Map the status to match the expected format
                    let displayStatus: Activity['status'] = 'processing'; // Default
                    if (chore.status === 'completed') {
                        displayStatus = 'completed';
                    } else if (chore.status === 'pending') {
                        displayStatus = 'pending';
                    } else if (chore.status === 'cancelled') {
                        displayStatus = 'cancelled';
                    }

                    const mappedActivity = {
                        id: chore.id,
                        title: chore.title,
                        description: chore.description,
                        assignedTo: chore.assignedTo,
                        status: displayStatus,
                        createdAt: chore.createdAt,
                        amount: chore.reward
                    };
                    return mappedActivity;
                });
                console.log('Mock activities loaded:', mockActivities.length);

                // Log the first mock activity to verify data structure
                if (mockActivities.length > 0) {
                    console.log('Sample mock activity:', mockActivities[0]);
                }

                setKids(mockKids);
                setActivities(mockActivities);
                setUsingMockData(true);
                toast.success('Demo data loaded successfully.');
            } catch (mockError) {
                console.error('Mock data fallback error:', mockError);
                toast.error('Failed to load activities data. Please try again later.');
                setKids([]);
                setActivities([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        // Use the refreshData function for initial data loading
        refreshData();
    }, [refreshData]);    // Filter activities based on activeKidTab or kidId prop
    const filteredActivities = useMemo(() => {
        // If kidId prop is provided, filter by that specific kid
        if (kidId) {
            return activities.filter(activity => activity.assignedTo === kidId);
        }
        
        // Otherwise, use the existing tab-based filtering
        if (activeKidTab === "all") {
            return activities;
        } else {
            return activities.filter(activity => activity.assignedTo === activeKidTab);
        }
    }, [activities, activeKidTab, kidId]);

    // Get top 3 kids with most recent activities
    const topKids = useMemo(() => {
        // Create a map of kid IDs to their most recent activity date
        const kidLastActivityDates = activities.reduce((acc, activity) => {
            const date = new Date(activity.createdAt).getTime();
            if (!acc[activity.assignedTo] || date > acc[activity.assignedTo]) {
                acc[activity.assignedTo] = date;
            }
            return acc;
        }, {} as Record<string, number>);

        // Sort kids by their most recent activity date
        return [...kids]
            .sort((a, b) => {
                const dateA = kidLastActivityDates[a.id] || 0;
                const dateB = kidLastActivityDates[b.id] || 0;
                return dateB - dateA;
            })
            .slice(0, 3); // Take only top 3
    }, [kids, activities]);

    // Add more detailed logging to debug the component state
    console.log('Component state:', {
        usingMockData,
        kidsCount: kids.length,
        activitiesCount: activities.length,
        topKidsCount: topKids.length,
        filteredActivitiesCount: filteredActivities.length,
        activeKidTab
    });

    // Debug log the first activity if available
    if (filteredActivities.length > 0) {
        console.log('First activity:', filteredActivities[0]);
    }

    // Log all activities to inspect
    console.log('All activities:', activities);

    // Add a useEffect to log filtered activities whenever they change
    useEffect(() => {
        console.log('Filtered activities changed:', filteredActivities);
    }, [filteredActivities]);

    // Helper to get kid name by ID
    const getKidName = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.name || 'Unknown Kid';
    };

    // Helper to get kid avatar by ID
    const getKidAvatar = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.avatar || undefined;
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        if (typeof amount !== 'number') {
            console.error('formatCurrency received non-number amount:', amount);
            return '₦0';
        }
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        });
    };

    // Helper function to get status badge styling
    const getStatusBadgeStyles = (status: Activity['status']) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
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
    };    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>
                        {kidId ? `${kids.find(k => k.id === kidId)?.name || 'Kid'}'s Activities` : "Kid's Activities"}
                    </CardTitle>
                    {usingMockData && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                            Using Demo Data
                        </div>
                    )}
                </div>
                <CardDescription>
                    {kidId ? 'View and manage activities for this kid.' : 'View and manage activities for each kid.'}
                </CardDescription>
                
                {/* Only show tabs if not filtering by specific kidId */}
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
                                {isLoading ? (
                                    // Skeleton loader for activities
                                    Array.from({ length: 5 }).map((_, index) => (
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
                                    ))
                                ) : filteredActivities.length === 0 ? (
                                    <p className="text-center text-muted-foreground">No activities found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.</p>
                                ) : (
                                    <>
                                        {/* Debug info */}
                                        <div className="bg-blue-100 p-2 mb-4 rounded">
                                            <p className="text-sm">Debug: Found {filteredActivities.length} activities for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}</p>
                                        </div>
                                        {/* Activities */}
                                        {filteredActivities.map(activity => (
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
                                        ))}
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Direct activity list when kidId is provided */}
                {kidId && (
                    <div className="mt-4 space-y-4">
                        {isLoading ? (
                            // Skeleton loader for activities
                            Array.from({ length: 5 }).map((_, index) => (
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
                            ))
                        ) : filteredActivities.length === 0 ? (
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
                {/* Activities list will be rendered inside CardHeader */}
            </CardContent>
        </Card>
    );
};

export default AppKidsActivities; 