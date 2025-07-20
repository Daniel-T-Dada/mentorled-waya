'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";



interface Chore {
    id: string;
    title: string;
    description: string;
    amount: number;
    assignee: string;
    status: string;
}
// Example data
const MOCK_CHORES = [
    {
        id: "1",
        title: "Clean your room",
        description: "Make your bed, organize your wardrobe, clothes and toys.",
        amount: 2000,
        assignee: "Tobi",
        status: "pending",
    },
    {
        id: "2",
        title: "Take out the trash",
        description: "Empty all the trash can in the house.",
        amount: 2000,
        assignee: "Fade",
        status: "pending",
    },
    {
        id: "3",
        title: "Wash the dishes",
        description: "Wash all the dishes in the kitchen and put them away.",
        amount: 2000,
        assignee: "Tobi",
        status: "pending",
    },
];

export default function ChoreManagement() {
    const [activeTab, setActiveTab] = useState("pending");

    // In real use, replace with API data
    const pendingChores = MOCK_CHORES.filter(c => c.status === "pending");
    const completedChores: Chore[] = [];

    return (
        <Card className="border rounded-2xl bg-[color:var(--card)]">
            <CardContent className="p-6">
                {/* Title & Subtitle */}
                <div className="mb-6">
                    <div className="font-semibold text-lg text-[color:var(--card-foreground)]">Chore Management</div>
                    <div className="text-sm text-[color:var(--muted-foreground)]">Assign and manage kid&apos;s chores</div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full flex rounded-md bg-muted mb-6 px-2 py-0 h-10">
                        <TabsTrigger
                            value="pending"
                            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[color:var(--primary)] data-[state=active]:shadow-sm h-9 font-semibold rounded-l-md flex items-center justify-center text-[15px]"
                        >
                            Pending ({pendingChores.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[color:var(--primary)] data-[state=active]:shadow-sm h-9 font-semibold rounded-r-md flex items-center justify-center text-[15px]"
                        >
                            Completed ({completedChores.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Pending Chores */}
                    <TabsContent value="pending">
                        <div className="space-y-4">
                            {pendingChores.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">No pending chores.</div>
                            ) : (
                                pendingChores.map(chore => (
                                    <div
                                        key={chore.id}
                                        className="bg-background border rounded-lg px-6 py-4 flex items-start justify-between"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-[16px] mb-1 text-[color:var(--foreground)]">{chore.title}</div>
                                            <div className="text-xs text-[color:var(--muted-foreground)] mb-3">{chore.description}</div>
                                        </div>
                                        <div className="flex flex-col items-end min-w-[110px] ml-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[color:var(--status-success)] font-semibold text-[15px]">{chore.amount.toLocaleString()}</span>
                                                <span className="bg-muted rounded-full px-2 py-1 text-xs text-[color:var(--muted-foreground)] font-medium flex items-center">
                                                    <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] inline-block mr-1" />
                                                    {chore.assignee}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Edit className="w-4 h-4 text-[color:var(--muted-foreground)]" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Trash2 className="w-4 h-4 text-[color:var(--destructive)]" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Completed Chores */}
                    <TabsContent value="completed">
                        <div className="space-y-4">
                            {completedChores.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">No completed chores.</div>
                            ) : (
                                completedChores.map(chore => (
                                    <div
                                        key={chore.id}
                                        className="bg-background border rounded-lg px-6 py-4 flex items-start justify-between"
                                    >
                                        {/* ...similar to pending, maybe with a checkmark or different color */}
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}