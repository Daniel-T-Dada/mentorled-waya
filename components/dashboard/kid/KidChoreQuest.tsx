'use client'


import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task, transformTasksFromBackend, BackendTask } from '@/lib/utils/taskTransforms';
import { useKid } from '@/contexts/KidContext';

// Type for paginated API responses
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface KidMyChoreProps {
    kidId?: string;
    refreshTrigger?: number;
}

const KidChoreQuest = ({ kidId: propKidId, refreshTrigger }: KidMyChoreProps) => {
    const { data: session } = useSession();
    const { kids, getKidDisplayName } = useKid();
    
    const [chores, setChores] = useState<Task[]>([]);
    const [kidName, setKidName] = useState<string>("Kid");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    // For kid sessions, use childId; for parent sessions viewing a kid, use the session user ID
    const sessionKidId = session?.user?.isChild ? session.user.childId : session?.user?.id;
    
    // Use real session kid ID instead of mock fallbacks
    const kidId = propKidId || sessionKidId || "kid-001";

    console.log('KidChoreQuest - Using kidId:', kidId, {
        propKidId,
        sessionKidId,
        isChildSession: session?.user?.isChild,
        childId: session?.user?.childId,
        userId: session?.user?.id,
        finalKidId: kidId
    });

    // Get kid name from the kids context
    useEffect(() => {
        const kid = kids.find(k => k.id === kidId);
        if (kid) {
            setKidName(getKidDisplayName(kid));
        }
    }, [kidId, kids, getKidDisplayName]);    useEffect(() => {
        const fetchChoreData = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) {
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);

                console.log('KidChoreQuest - Fetching chores for kidId:', kidId);

                // Use the same API pattern as AppChoreManagement
                const apiUrl = `${getApiUrl(API_ENDPOINTS.LIST_TASKS)}?page_size=100&assignedTo=${kidId}`;

                const choresResponse = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });

                console.log('KidChoreQuest - Response status:', choresResponse.status);

                if (!choresResponse.ok) {
                    console.error('KidChoreQuest - API Error:', choresResponse.status);
                    throw new Error('Failed to fetch chores');
                }
                
                const choresData: BackendTask[] | PaginatedResponse<BackendTask> = await choresResponse.json();

                console.log('KidChoreQuest - Raw API data:', choresData);

                // Handle different response formats
                const processedChores = Array.isArray(choresData) ? choresData :
                    ('results' in choresData && Array.isArray(choresData.results)) ? choresData.results : [];

                console.log('KidChoreQuest - Processed data:', {
                    choresCount: processedChores.length
                });

                // Transform backend task data to frontend format
                const transformedChores = transformTasksFromBackend(processedChores);
                setChores(transformedChores);
            } catch (err) {
                console.error("KidChoreQuest - Error fetching chores:", err);
                setError('Failed to load chore data');
                setChores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChoreData();
    }, 
    [kidId, session?.user?.id, session?.user?.accessToken, refreshTrigger]);    // Show all chores in the All Activities column
    const allChores = chores;
    const completedChores = chores.filter(chore => chore.status === "completed");    // Handle status change for chores
    const handleStatusChange = async (choreId: string, newStatus: "completed" | "pending") => {
        if (!session?.user?.accessToken) return;
        
        try {
            // Optimistically update the UI
            setChores(prevChores =>
                prevChores.map(chore =>
                    chore.id === choreId
                        ? { ...chore, status: newStatus }
                        : chore
                )
            );

            console.log(`KidChoreQuest - Updating chore ${choreId} status to ${newStatus}`);

            // Make API call to update the status
            const statusUpdateUrl = API_ENDPOINTS.UPDATE_TASK_STATUS.replace(':taskId', choreId);
            const response = await fetch(getApiUrl(statusUpdateUrl), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update chore status');
            }

            console.log(`KidChoreQuest - Successfully updated chore ${choreId} status to ${newStatus}`);
        } catch (error) {
            console.error('KidChoreQuest - Error updating chore status:', error);
            // Revert the optimistic update on error
            setChores(prevChores =>
                prevChores.map(chore =>
                    chore.id === choreId
                        ? { ...chore, status: newStatus === "completed" ? "pending" : "completed" }
                        : chore
                )
            );
        }
    };

    if (loading) {
        return (
            <Card className="col-span-3">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Tabs Skeleton */}
                        <div className="flex space-x-1 p-1 bg-muted rounded-lg">
                            <Skeleton className="h-9 flex-1" />
                            <Skeleton className="h-9 flex-1" />
                        </div>

                        {/* Content Skeleton */}
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>                                    
                                    
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <div className="text-right space-y-1">
                                            <Skeleton className="h-5 w-12" />
                                            <Skeleton className="h-3 w-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <div className="col-span-3">
                <Card>
                    <CardContent className="flex items-center justify-center py-8">
                        <p className="text-red-500">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div className="">

                    <h2 className="text-xl font-semibold">My Chore</h2>
                    <p className="text-muted-foreground">View, complete your chore and gain reward.</p>
                </div>
                {/* <Button
                    className="bg-primary hover:bg-primary/90"
                
                >
                    Create kid&apos;s account

                </Button> */}

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card className="col-span-3">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-2 w-full mb-6">
                                <TabsTrigger value="all" className="text-sm">
                                    All Activities
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="text-sm">
                                    Completed Activities ({completedChores.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-0 space-y-4">
                                <div className="space-y-3">
                                    {allChores.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No chores found.</p>
                                        </div>
                                    ) : (
                                        allChores.map((chore) => (
                                            <div key={chore.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base text-gray-900 mb-1">{chore.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {chore.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">                                                <div className="flex flex-col gap-2">
                                                        <RadioGroup
                                                            value={chore.status}
                                                            onValueChange={(value) => handleStatusChange(chore.id, value as "completed" | "pending")}
                                                            className="flex flex-col gap-1"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <RadioGroupItem
                                                                    value="completed"
                                                                    id={`completed-${chore.id}`}
                                                                    className="h-4 w-4"
                                                                />
                                                                <Label htmlFor={`completed-${chore.id}`} className="text-sm text-gray-600">
                                                                    Completed
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <RadioGroupItem
                                                                    value="pending"
                                                                    id={`pending-${chore.id}`}
                                                                    className="h-4 w-4"
                                                                />
                                                                <Label htmlFor={`pending-${chore.id}`} className="text-sm text-gray-600">
                                                                    Pending
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                        <div className="text-right">
                                                            <div className="text-base font-semibold text-teal-600">
                                                                {chore.reward.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                                {kidName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="completed" className="mt-0 space-y-4">
                                <div className="space-y-3">
                                    {completedChores.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <div className="text-4xl mb-2">🎯</div>
                                            <p className="font-medium">No completed chores yet</p>
                                            <p className="text-xs">Complete your chores to see them here!</p>
                                        </div>
                                    ) : (
                                        completedChores.map((chore) => (
                                            <div key={chore.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base text-gray-900 mb-1">{chore.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {chore.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 ml-4">
                                                        <div className="flex items-center gap-4">                                                    <div className="flex items-center gap-3">
                                                            <span className="text-sm text-green-600 font-medium">Completed</span>
                                                        </div>
                                                            <div className="text-right">
                                                                <div className="text-base font-semibold text-teal-600">
                                                                    {chore.reward.toLocaleString()}
                                                                </div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                                    {kidName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

        </main>
    )
}
export default KidChoreQuest