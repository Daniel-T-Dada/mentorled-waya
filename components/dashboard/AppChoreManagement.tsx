'use client'

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import mockChores from "@/mockdata/mockChores.json"; 
import { Pencil, Trash } from "lucide-react";


interface Kid {
    id: string;
    name: string;
    avatar?: string | null; 
}

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    assignedTo: string; 
    status: "completed" | "pending" | "cancelled"; 
    createdAt?: string; 
    completedAt?: string | null; 
}

interface AppChoreManagementProps {
        
    kids: Kid[];

}

export function AppChoreManagement({ kids }: AppChoreManagementProps) { 
    const [activeTab, setActiveTab] = useState("pending");


        const chores: Chore[] = mockChores as Chore[];

    // Filter chores by status
    const filteredChores = useMemo(() => {
        return chores.filter(chore => {
            return activeTab === "all" || chore.status === activeTab;
        });
    }, [chores, activeTab]);

    // Separate chores by status for displaying in tabs
    const pendingChores = filteredChores.filter(chore => chore.status === "pending");
    const completedChores = filteredChores.filter(chore => chore.status === "completed");

    // Function to get kid's name by ID
    const getKidName = (kidId: string) => {
        const kid = kids.find(k => k.id === kidId);
        return kid?.name || 'Unknown Kid';
    };

    // Function to get kid's avatar by ID
    const getKidAvatar = (kidId: string): string | undefined => {
                const kid = kids.find(k => k.id === kidId);
    
                    return kid?.avatar ?? undefined;
            };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Chore Management</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Assign and manage kid&apos;s chores</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="pending">Pending ({pendingChores.length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({completedChores.length})</TabsTrigger>
                        
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingChores.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No pending chores found.</div>
                        ) : (
                            pendingChores.map((chore) => (
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

                    <TabsContent value="completed" className="space-y-4">
                        {completedChores.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No completed chores found.</div>
                        ) : (
                            completedChores.map((chore) => (
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