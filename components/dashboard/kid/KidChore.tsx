'use client'

import { getAvatarUrl } from '@/lib/utils/avatarUtils';
import Image from 'next/image';
import { useState, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Task } from '@/lib/utils/taskTransforms';
import { useKid } from '@/contexts/KidContext';

interface KidChoreProps {
    kidId?: string;
    refreshTrigger?: number;
}

const KidChore = memo(function KidChore({ kidId: propKidId, refreshTrigger }: KidChoreProps) {
    const { data: session } = useSession();
    const { kids } = useKid();
    const [chores, setChores] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState("pending");



    // Debug: log activeTab on change
    useEffect(() => {
        console.log('Active Tab:', activeTab);
    }, [activeTab]);

    const sessionKidId = session?.user?.isChild ? session.user.childId : session?.user?.id;
    const kidId = propKidId || sessionKidId || "kid-001";

    // Removed unused effect for kidName

    useEffect(() => {
        const fetchChoreData = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) {
                return;
            }
            try {
                const apiUrl = getApiUrl(API_ENDPOINTS.CHILD_CHORES + '?page=1');
                const choresResponse = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });
                if (!choresResponse.ok) {
                    throw new Error('Failed to fetch chores');
                }
                const choresData: any = await choresResponse.json();
                const processedChores = Array.isArray(choresData) ? choresData :
                    ('results' in choresData && Array.isArray(choresData.results)) ? choresData.results : [];
                // Map backend fields to local Task type
                const mappedChores = processedChores.map((chore: any) => ({
                    id: chore.id,
                    title: chore.description,
                    description: chore.description,
                    status: chore.status,
                    reward: Number(chore.reward),
                    kidName: chore.child_name,
                    completedAt: chore.completed_at,
                    dueDate: chore.due_date,
                    assignedTo: chore.assigned_to,
                    createdAt: chore.created_at,
                }));
                setChores(mappedChores);
            } catch {
                setChores([]);
            }
        };
        fetchChoreData();
    }, [kidId, session?.user?.id, session?.user?.accessToken, refreshTrigger]);

    const pendingChores = chores.filter(chore => chore.status !== 'completed');
    const completedChores = chores.filter(chore => chore.status === 'completed');

    // For all activities tab, use all chores

    return (
        <main>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card className="col-span-3 md:min-h-[755px]">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full mb-6 flex">
                                <TabsTrigger
                                    value="pending"
                                    className="text-sm px-4 py-2 rounded transition-colors"
                                >
                                    Pending ({pendingChores.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="completed"
                                    className="text-sm px-4 py-2 rounded transition-colors"
                                >
                                    Completed ({completedChores.length})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="pending" className="mt-0 space-y-4">
                                
                                <div className="space-y-3">
                                    {pendingChores.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No pending chores found.</p>
                                        </div>
                                    ) : (
                                        pendingChores.map((chore: Task) => (
                                            <div key={chore.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base text-gray-900 mb-1">{chore.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {chore.description}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <div className="text-right flex space-x-2 ">
                                                            <div className="text-base font-semibold text-teal-600">
                                                                {chore.reward.toLocaleString()}
                                                            </div>
                                                            {/* Display kid's avatar and first name with fallback using avatarUtils */}
                                                            <div className="flex items-center gap-2">
                                                                {/* Avatar rendering logic */}
                                                                {(() => {
                                                                    // Try to get avatar from context (kids array)
                                                                    let avatarPath: string | undefined;
                                                                    const kid = kids.find(k => k.id === kidId);
                                                                    if (kid && kid.avatar) {
                                                                        avatarPath = kid.avatar;
                                                                    }
                                                                    const avatarUrl = getAvatarUrl(avatarPath);
                                                                    const name = chore.kidName;
                                                                    if (avatarUrl) {
                                                                        return (
                                                                            <>
                                                                                <Image
                                                                                    src={avatarUrl}
                                                                                    alt={name || ""}
                                                                                    className="w-6 h-6 rounded-full object-cover mr-1 border border-gray-200"
                                                                                />
                                                                            </>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs mr-1">
                                                                                {name?.charAt(0).toUpperCase() || ''}
                                                                            </span>
                                                                        );
                                                                    }
                                                                })()}
                                                                <span className="text-xs text-gray-500">
                                                                    {chore.kidName?.split(' ')[0] || ''}
                                                                </span>
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
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right flex gap-2">
                                                                <div className="text-base font-semibold text-teal-600">
                                                                    {chore.reward.toLocaleString()}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {/* Avatar rendering logic */}
                                                                    {(() => {
                                                                        let avatarPath: string | undefined;
                                                                        const kid = kids.find(k => k.id === kidId);
                                                                        if (kid && kid.avatar) {
                                                                            avatarPath = kid.avatar;
                                                                        }
                                                                        const avatarUrl = getAvatarUrl(avatarPath);
                                                                        const name = chore.kidName;
                                                                        if (avatarUrl) {
                                                                            return (
                                                                                <>
                                                                                    <Image
                                                                                        src={avatarUrl}
                                                                                        alt={name || ""}
                                                                                        className="w-6 h-6 rounded-full object-cover mr-1 border border-gray-200"
                                                                                    />
                                                                                </>
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs mr-1">
                                                                                    {name?.charAt(0).toUpperCase() || ''}
                                                                                </span>
                                                                            );
                                                                        }
                                                                    })()}
                                                                    <span className="text-xs text-gray-500">
                                                                        {chore.kidName?.split(' ')[0] || ''}
                                                                    </span>
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
    );
});
KidChore.displayName = 'KidChore';

export default KidChore;
