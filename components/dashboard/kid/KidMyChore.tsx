'use client'

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { MockApiService } from "@/lib/services/mockApiService";
import { mockDataService } from "@/lib/services/mockDataService";

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    status: "completed" | "pending" | "cancelled";
    assignedTo: string;
    createdAt: string;
}

interface KidMyChoreProps {
    kidId?: string;
}

const KidMyChore = ({ kidId: propKidId }: KidMyChoreProps) => {
    const { data: session } = useSession(); const [chores, setChores] = useState<Chore[]>([]);
    const [kidName, setKidName] = useState<string>("Kid");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    // Get kid data - prioritize prop, then session, then fallback
    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId && !propKidId) {
        console.log(`KidMyChore - Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    } useEffect(() => {
        const fetchChoreData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from API first
                try {
                    const choresData = await MockApiService.fetchChoresByKidId(kidId);
                    setChores(choresData);

                    // Also fetch kid data to get the name
                    try {
                        const kidData = await MockApiService.fetchKidById(kidId);
                        setKidName(kidData.name || "Kid");
                    } catch (kidError) {
                        console.log('Failed to fetch kid data, using fallback:', kidError);
                        const kidData = mockDataService.getKidById(kidId);
                        setKidName(kidData?.name || "Kid");
                    }
                } catch (apiError) {
                    console.log('API fetch failed, falling back to direct mock data service:', apiError);

                    // Fallback to direct mock data service
                    const choresData = mockDataService.getChoresByKidId(kidId);
                    setChores(choresData);

                    // Also get kid name from fallback
                    const kidData = mockDataService.getKidById(kidId);
                    setKidName(kidData?.name || "Kid");
                }
            } catch (err) {
                console.error('Error fetching chore data:', err);
                setError('Failed to load chore data');

                // Last resort fallback
                setChores([]);
                setKidName("Kid");
            } finally {
                setLoading(false);
            }
        };

        fetchChoreData();
    }, [kidId]);    // Show all chores in the All Activities column
    const allChores = chores;
    const completedChores = chores.filter(chore => chore.status === "completed");    // Handle status change for chores
    const handleStatusChange = async (choreId: string, newStatus: "completed" | "pending") => {
        try {
            // Optimistically update the UI
            setChores(prevChores =>
                prevChores.map(chore =>
                    chore.id === choreId
                        ? { ...chore, status: newStatus }
                        : chore
                )
            );

            // Make API call to update the status
            await MockApiService.updateChoreStatus(choreId, newStatus);
            console.log(`Successfully updated chore ${choreId} status to ${newStatus}`);
        } catch (error) {
            console.error('Error updating chore status:', error);
            // Revert the optimistic update on error
            try {
                const originalChores = await MockApiService.fetchChoresByKidId(kidId);
                setChores(originalChores);
            } catch (fetchError) {
                console.error('Error reverting chore data:', fetchError);
            }
        }
    }; if (loading) {
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
                                    </div>                                    <div className="flex items-center gap-4 ml-4">
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
    } return (
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
    );
};

export default KidMyChore;