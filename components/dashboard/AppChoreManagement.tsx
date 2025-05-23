'use client'

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash } from "lucide-react";
import { mockDataService } from '@/lib/services/mockDataService';
import { usePathname } from 'next/navigation';

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

    // Get all chores and kids from mockDataService
    const allChores = mockDataService.getAllChores();
    const allKids = mockDataService.getAllKids();

    // Select the first 3 kids for dynamic tabs (limitation with current mock data for 'recent activity')
    // TODO: Implement dynamic selection based on actual 'recent activity' which I am yet to do. 
    const kidsForTabs = allKids.slice(0, 3);

    // Filter chores by the selected kid tab and status tab
    const filteredChores = useMemo(() => {
        const choresToFilter = activeKidTab === "all" ? allChores : allChores.filter(chore => chore.assignedTo === activeKidTab);

        return choresToFilter.filter(chore => {
            return activeStatusTab === "all" || chore.status === activeStatusTab;
        });
    }, [allChores, activeKidTab, activeStatusTab]);

    // Separate filtered chores by status for displaying counts
    const pendingFilteredChores = filteredChores.filter(chore => chore.status === "pending");
    const completedFilteredChores = filteredChores.filter(chore => chore.status === "completed");

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
        <Card>
            <CardHeader>
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
            <CardContent>
                

                {/* Status Tabs: Pending and Completed will always show when component is mounted */}
                <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full">
                    <TabsList className="grid grid-cols-2  w-full h-12">
                        <TabsTrigger value="pending" className="border p-2">
                            Pending ({pendingFilteredChores.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({completedFilteredChores.length})
                        </TabsTrigger>
                    </TabsList>


                    {/* Content based on selected Status tab */}
                    <TabsContent value="pending" className="space-y-4 mt-4">
                        {pendingFilteredChores.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No pending chores found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.</div>
                        ) : (
                            pendingFilteredChores.map((chore) => (
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
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-4">
                        {completedFilteredChores.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No completed chores found for {activeKidTab === "all" ? "all kids" : getKidName(activeKidTab)}.</div>
                        ) : (
                            completedFilteredChores.map((chore) => (
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
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default AppChoreManagement; 