'use client'

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

interface Kid {
    id: string;
    username: string;
    name?: string;
    avatar?: string | null;
}

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: string; // API returns as string
    due_date: string;
    assignedTo: string; // This is the username, not ID
    parentId: string;
    status: "completed" | "pending" | "cancelled";
    created_at: string;
    completed_at?: string | null;
}

interface AppChoreManagementProps {
    kidId?: string; // Optional prop for kid-specific chore management
    refreshTrigger?: number; // Trigger to refresh data
}

export function AppChoreManagement({ kidId, refreshTrigger }: AppChoreManagementProps = {}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const [activeKidTab, setActiveKidTab] = useState("all");
    const [activeStatusTab, setActiveStatusTab] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPendingPage, setCurrentPendingPage] = useState(0);
    const [currentCompletedPage, setCurrentCompletedPage] = useState(0);
    const [chores, setChores] = useState<Chore[]>([]);
    const [kids, setKids] = useState<Kid[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            } setIsLoading(true);
            try {
                console.log('AppChoreManagement - Fetching data...');

                const [choresResponse, kidsResponse] = await Promise.all([
                    fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    }),
                    fetch(getApiUrl(API_ENDPOINTS.LIST_CHILDREN), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.user.accessToken}`,
                        },
                    })
                ]);

                console.log('AppChoreManagement - Response status:', {
                    chores: choresResponse.status,
                    kids: kidsResponse.status
                });

                if (!choresResponse.ok || !kidsResponse.ok) {
                    console.error('AppChoreManagement - API Error:', {
                        choresStatus: choresResponse.status,
                        kidsStatus: kidsResponse.status
                    });
                    throw new Error('Failed to fetch data');
                }

                const choresData = await choresResponse.json();
                const kidsData = await kidsResponse.json();

                console.log('AppChoreManagement - Raw API data:', {
                    choresData,
                    kidsData
                });

                // Handle different response formats
                const processedChores = Array.isArray(choresData) ? choresData :
                    (choresData.results && Array.isArray(choresData.results)) ? choresData.results : [];

                const processedKids = Array.isArray(kidsData) ? kidsData :
                    (kidsData.results && Array.isArray(kidsData.results)) ? kidsData.results : [];

                console.log('AppChoreManagement - Processed data:', {
                    choresCount: processedChores.length,
                    kidsCount: processedKids.length
                });

                setChores(processedChores);
                setKids(processedKids);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }        }; fetchData();    }, [session?.user?.id, session?.user?.accessToken, refreshTrigger]);

    // Select the first 3 kids for dynamic tabs
    const kidsForTabs = kids.slice(0, 3);

    // Function to get kid's username by ID
    const getKidUsername = useCallback((kidId: string): string => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.username || kidId; // fallback to ID if username not found
    }, [kids]);

    // Filter chores by the selected kid tab or kidId prop
    const filteredChores = useMemo(() => {
        let filtered = chores;

        if (kidId) {
            // Convert kidId to username for filtering
            const kidUsername = getKidUsername(kidId);
            filtered = chores.filter(chore => chore.assignedTo === kidUsername);
        } else if (activeKidTab !== "all") {
            // Convert activeKidTab (ID) to username for filtering
            const kidUsername = getKidUsername(activeKidTab);
            filtered = chores.filter(chore => chore.assignedTo === kidUsername);
        }        return filtered;
    }, [chores, activeKidTab, kidId, getKidUsername]);

    // Separate filtered chores by status for displaying counts
    const pendingFilteredChores = filteredChores.filter(chore => chore.status === "pending");
    const completedFilteredChores = filteredChores.filter(chore => chore.status === "completed");

    // Pagination logic
    const choresPerPage = 4;

    // Pending chores pagination
    const totalPendingPages = Math.ceil(pendingFilteredChores.length / choresPerPage);
    const startPendingIndex = currentPendingPage * choresPerPage;
    const endPendingIndex = startPendingIndex + choresPerPage;
    const currentPendingChores = pendingFilteredChores.slice(startPendingIndex, endPendingIndex);

    // Completed chores pagination
    const totalCompletedPages = Math.ceil(completedFilteredChores.length / choresPerPage);
    const startCompletedIndex = currentCompletedPage * choresPerPage;
    const endCompletedIndex = startCompletedIndex + choresPerPage;
    const currentCompletedChores = completedFilteredChores.slice(startCompletedIndex, endCompletedIndex);

    // Pagination handlers
    const handlePendingPrevPage = () => {
        setCurrentPendingPage(prev => Math.max(0, prev - 1));
    };

    const handlePendingNextPage = () => {
        setCurrentPendingPage(prev => Math.min(totalPendingPages - 1, prev + 1));
    };

    const handleCompletedPrevPage = () => {
        setCurrentCompletedPage(prev => Math.max(0, prev - 1));
    };

    const handleCompletedNextPage = () => {
        setCurrentCompletedPage(prev => Math.min(totalCompletedPages - 1, prev + 1));
    };

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPendingPage(0);
        setCurrentCompletedPage(0);    }, [activeKidTab, activeStatusTab]);

    // Function to get kid's name by username (from chore.assignedTo)
    const getKidNameByUsername = (username: string) => {
        const kid = kids.find(k => k.username === username);
        return kid?.name || kid?.username || 'Unknown Kid';
    };

    // Function to get kid's avatar by username (from chore.assignedTo)
    const getKidAvatarByUsername = (username: string): string | undefined => {
        const kid = kids.find(k => k.username === username);
        return kid?.avatar ?? undefined;
    };

    // Function to get kid's name by ID (for UI components that still use IDs)
    const getKidName = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.name || kid?.username || 'Unknown Kid';
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                {/* Main Tabs: All Chores and Kid Tabs - Visible only on TaskMaster page and when kidId is not provided */}
                {pathname === '/dashboard/parents/taskmaster' && !kidId && (
                    <Tabs value={activeKidTab} onValueChange={setActiveKidTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="all">All Chores</TabsTrigger>
                            {kidsForTabs.map(kid => (
                                <TabsTrigger key={kid.id} value={kid.id}>{kid.name}&apos;s Chore</TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={activeKidTab} className="mt-0 space-y-4">
                            {/* This TabsContent is just a container for the structure */}
                        </TabsContent>
                    </Tabs>
                )}
                <CardTitle className="text-xl font-semibold">
                    {kidId ? `${getKidName(kidId)}'s Chore Management` : 'Chore Management'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {kidId ? `Assign and manage ${getKidName(kidId)}'s chores` : "Assign and manage kid's chores"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Status Tabs: Pending and Completed */}
                <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full flex flex-col h-full">
                    <TabsList className="grid grid-cols-2 w-full h-12 flex-shrink-0">
                        <TabsTrigger value="pending" className="border p-2">
                            Pending ({pendingFilteredChores.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedFilteredChores.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Content based on selected Status tab */}
                    <TabsContent value="pending" className="flex-1 flex flex-col mt-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {isLoading ? (
                                    // Skeleton loading for pending chores
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="border rounded-md p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-5 w-5 rounded-full" />
                                                    <Skeleton className="h-3 w-12" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : currentPendingChores.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No pending chores found for {kidId ? getKidName(kidId) : (activeKidTab === "all" ? "all kids" : getKidName(activeKidTab))}.
                                    </div>
                                ) : (
                                    currentPendingChores.map((chore) => (
                                        <div key={chore.id} className="border rounded-md p-4">
                                            <div className="flex items-start justify-between">
                                                <div>                                                    <h3 className="font-medium">{chore.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                </div>
                                                {kidId ? (
                                                    // Kid view: Show avatar and amount
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-medium text-green-500">
                                                            ₦{Number(chore.reward).toLocaleString()}
                                                        </div>
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo)} />
                                                            <AvatarFallback>{getKidNameByUsername(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                ) : (
                                                    // Parent view: Show edit/delete buttons
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                                                            <Pencil className="w-5 h-5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                                            <Trash className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-sm font-medium text-green-500">
                                                    {kidId ? "" : `₦${Number(chore.reward).toLocaleString()}`}
                                                </div>
                                                {!kidId && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">                                                        <Avatar className="w-5 h-5">
                                                        <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo)} />
                                                        <AvatarFallback>{getKidNameByUsername(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                        <span className="text-xs">{getKidNameByUsername(chore.assignedTo)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Navigation for pending chores */}
                        {!isLoading && pendingFilteredChores.length > choresPerPage && (
                            <div className="flex items-center justify-between py-3 border-t mt-4 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePendingPrevPage}
                                    disabled={currentPendingPage === 0}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Page {currentPendingPage + 1} of {totalPendingPages}
                                    </span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPendingPages }).map((_, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => setCurrentPendingPage(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentPendingPage ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                aria-label={`Go to page ${index + 1}`}
                                                title={`Page ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePendingNextPage}
                                    disabled={currentPendingPage === totalPendingPages - 1}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="flex-1 flex flex-col mt-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {isLoading ? (
                                    // Skeleton loading for completed chores
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="border rounded-md p-4 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <Skeleton className="h-4 w-16" />
                                                <div className="flex items-center gap-1">
                                                    <Skeleton className="h-5 w-5 rounded-full" />
                                                    <Skeleton className="h-3 w-12" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : currentCompletedChores.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No completed chores found for {kidId ? getKidName(kidId) : (activeKidTab === "all" ? "all kids" : getKidName(activeKidTab))}.
                                    </div>
                                ) : (currentCompletedChores.map((chore) => (
                                    <div key={chore.id} className="border rounded-md p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium">{chore.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                            </div>
                                            {kidId ? (
                                                // Kid view: Show avatar and amount
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-green-500">
                                                        ₦{Number(chore.reward).toLocaleString()}
                                                    </div>
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo)} />
                                                        <AvatarFallback>{getKidNameByUsername(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            ) : (
                                                // Parent view: Show edit/delete buttons
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                                                        <Pencil className="w-5 h-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                                        <Trash className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="text-sm font-medium text-green-500">
                                                {kidId ? "" : `₦${Number(chore.reward).toLocaleString()}`}
                                            </div>
                                            {!kidId && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={getKidAvatarByUsername(chore.assignedTo)} alt={getKidNameByUsername(chore.assignedTo)} />
                                                        <AvatarFallback>{getKidNameByUsername(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{getKidNameByUsername(chore.assignedTo)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Navigation for completed chores */}
                        {!isLoading && completedFilteredChores.length > choresPerPage && (
                            <div className="flex items-center justify-between py-3 border-t mt-4 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCompletedPrevPage}
                                    disabled={currentCompletedPage === 0}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        Page {currentCompletedPage + 1} of {totalCompletedPages}
                                    </span>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalCompletedPages }).map((_, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => setCurrentCompletedPage(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentCompletedPage ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                aria-label={`Go to page ${index + 1}`}
                                                title={`Page ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCompletedNextPage}
                                    disabled={currentCompletedPage === totalCompletedPages - 1}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default AppChoreManagement; 