'use client'

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { mockDataService } from '@/lib/services/mockDataService';
import { usePathname } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// interface Kid {
//     id: string;
//     name: string;
//     avatar?: string | null;
// }

// interface Chore {
//     id: string;
//     title: string;
//     description: string;
//     reward: number;
//     assignedTo: string;
//     status: "completed" | "pending" | "cancelled";
//     createdAt?: string;
//     completedAt?: string | null;
// }

// interface AppChoreManagementProps {

//     kids: Kid[];

// }

// export function AppChoreManagement({ kids }: AppChoreManagementProps) {




export function AppChoreManagement() {
    const pathname = usePathname();

    const [activeKidTab, setActiveKidTab] = useState("all");
    const [activeStatusTab, setActiveStatusTab] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPendingPage, setCurrentPendingPage] = useState(0);
    const [currentCompletedPage, setCurrentCompletedPage] = useState(0);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // Simulate a 500ms loading delay

        return () => clearTimeout(timer);
    }, []);

    // Get all chores and kids from mockDataService
    const allChores = mockDataService.getAllChores();
    const allKids = mockDataService.getAllKids();

    // Select the first 3 kids for dynamic tabs (limitation with current mock data for 'recent activity')
    // TODO: Implement dynamic selection based on actual 'recent activity' which I am yet to do. 
    const kidsForTabs = allKids.slice(0, 3);

    // Filter chores by the selected kid tab only (not by status)
    const filteredChores = useMemo(() => {
        return activeKidTab === "all" ? allChores : allChores.filter(chore => chore.assignedTo === activeKidTab);
    }, [allChores, activeKidTab]);

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
        setCurrentCompletedPage(0);
    }, [activeKidTab, activeStatusTab]);

    // Function to get kid's name by ID
    const getKidName = (kidId: string) => {
        const kid = mockDataService.getKidById(kidId);
        return kid?.name || 'Unknown Kid';
    };

    // Function to get kid's avatar by ID
    const getKidAvatar = (kidId: string): string | undefined => {
        const kid = mockDataService.getKidById(kidId);
        return kid?.avatar ?? undefined;
    };


    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                {/* Main Tabs: All Chores and Kid Tabs - Visible only on TaskMaster page */}
                {pathname === '/dashboard/parents/taskmaster' && (
                    <Tabs value={activeKidTab} onValueChange={setActiveKidTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="all">All Chores</TabsTrigger>
                            {kidsForTabs.map(kid => (
                                <TabsTrigger key={kid.id} value={kid.id}>{kid.name}&apos;s Chore</TabsTrigger>
                            ))}
                        </TabsList>


                        <TabsContent value={activeKidTab} className="mt-0 space-y-4">
                            {/* This TabsContent is just a container for the structure, 
                              its children (the status tabs and chore list) are rendered below */}
                        </TabsContent>
                    </Tabs>
                )}
                <CardTitle className="text-xl font-semibold">Chore Management</CardTitle>
                <CardDescription className="text-muted-foreground">Assign and manage kid&apos;s chores</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Status Tabs: Pending and Completed will always show when component is mounted */}
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
                                    <div className="text-center text-muted-foreground py-8">No pending chores found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.</div>
                                ) : (
                                    currentPendingChores.map((chore) => (
                                        <div key={chore.id} className="border rounded-md p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">{chore.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                                                        <Pencil className="w-5 h-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                                        <Trash className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-sm font-medium text-green-500">
                                                    ₦{chore.reward.toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={getKidAvatar(chore.assignedTo)} alt={getKidName(chore.assignedTo)} />
                                                        <AvatarFallback>{getKidName(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{getKidName(chore.assignedTo)}</span>
                                                </div>
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
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPendingPage(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentPendingPage ? 'bg-primary' : 'bg-muted-foreground/30'
                                                    }`}
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
                                    <div className="text-center text-muted-foreground py-8">No completed chores found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.</div>
                                ) : (
                                    currentCompletedChores.map((chore) => (
                                        <div key={chore.id} className="border rounded-md p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">{chore.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{chore.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/90">
                                                        <Pencil className="w-5 h-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                                        <Trash className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="text-sm font-medium text-green-500">
                                                    ₦{chore.reward.toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={getKidAvatar(chore.assignedTo)} alt={getKidName(chore.assignedTo)} />
                                                        <AvatarFallback>{getKidName(chore.assignedTo)?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs">{getKidName(chore.assignedTo)}</span>
                                                </div>
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
                                            <button
                                                key={index}
                                                onClick={() => setCurrentCompletedPage(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentCompletedPage ? 'bg-primary' : 'bg-muted-foreground/30'
                                                    }`}
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