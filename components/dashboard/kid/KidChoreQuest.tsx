'use client'

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useKid } from '@/contexts/KidContext';
import { getAvatarUrl } from '@/lib/utils/avatarUtils';
import Image from "next/image";

interface Task {
    id: string;
    title: string;
    description: string;
    status: "completed" | "pending";
    reward: string;
    kidName: string;
    completedAt?: string;
    dueDate?: string;
    assignedTo?: string;
    createdAt?: string;
    loading?: boolean;
}

interface KidChoreQuestProps {
    chores: Task[];
    onStatusChange: (choreId: string, newStatus: "completed" | "pending") => void;
    kidId?: string;
}

const KidChoreQuest = ({
    chores,
    onStatusChange,
    kidId: propKidId,
}: KidChoreQuestProps) => {
    const { data: session } = useSession();
    const { kids } = useKid();
    const [activeTab, setActiveTab] = useState("all");

    const completedChores = chores.filter((chore) => chore.status === "completed");
    const kidId =
        propKidId ||
        (session?.user?.isChild ? session?.user?.childId : session?.user?.id) ||
        "kid-001";

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">My Chore</h2>
                    <p className="text-muted-foreground">
                        View, complete your chore and gain reward.
                    </p>
                </div>
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
                                    {chores.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>No chores found.</p>
                                        </div>
                                    ) : (
                                        chores.map((chore) => (
                                            <div
                                                key={chore.id}
                                                className={`border-b border-gray-200 pb-4 last:border-b-0 ${chore.loading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base text-gray-900 mb-1">
                                                            {chore.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{chore.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <div className="flex flex-col gap-2 pb-6">
                                                            <RadioGroup
                                                                value={chore.status}
                                                                onValueChange={(value) =>
                                                                    onStatusChange(chore.id, value as "completed" | "pending")
                                                                }
                                                                className="flex flex-col gap-1"
                                                                disabled={chore.loading}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <RadioGroupItem
                                                                        value="completed"
                                                                        id={`completed-${chore.id}`}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`completed-${chore.id}`}
                                                                        className="text-sm text-gray-600"
                                                                    >
                                                                        Completed
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <RadioGroupItem
                                                                        value="pending"
                                                                        id={`pending-${chore.id}`}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <Label
                                                                        htmlFor={`pending-${chore.id}`}
                                                                        className="text-sm text-gray-600"
                                                                    >
                                                                        Pending
                                                                    </Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                        <div className="text-right ">
                                                            <div className="font-semibold text-sm pb-4">
                                                                {chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <div className="text-base font-semibold text-teal-600">
                                                                    {Number(chore.reward).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                </div>
                                                                <div className="flex items-center  gap-2">
                                                                    {(() => {
                                                                        let avatarPath: string | undefined;
                                                                        const kid = kids.find((k) => k.id === kidId);
                                                                        if (kid && kid.avatar) avatarPath = kid.avatar;
                                                                        const avatarUrl = getAvatarUrl(avatarPath);
                                                                        const name = chore.kidName;
                                                                        if (avatarUrl) {
                                                                            return (
                                                                                <Image
                                                                                    src={avatarUrl}
                                                                                    alt={name || ""}
                                                                                    className="w-4 h-4 rounded-full object-cover mr-1 border border-gray-200"
                                                                                />
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs mr-1">
                                                                                    {name?.charAt(0).toUpperCase() || ""}
                                                                                </span>
                                                                            );
                                                                        }
                                                                    })()}
                                                                    <span className="text-xs text-gray-500">
                                                                        {chore.kidName?.split(" ")[0] || ""}
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
                            <TabsContent value="completed" className="mt-0 space-y-4">
                                <div className="space-y-3">
                                    {completedChores.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <div className="text-4xl mb-2">🎯</div>
                                            <p className="font-medium">No completed chores yet</p>
                                            <p className="text-xs">
                                                Complete your chores to see them here!
                                            </p>
                                        </div>
                                    ) : (
                                        completedChores.map((chore) => (
                                            <div
                                                key={chore.id}
                                                className={`border-b border-gray-200 pb-4 last:border-b-0 ${chore.loading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base text-gray-900 mb-1">
                                                            {chore.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">{chore.description}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 ml-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium">Completed</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 ">
                                                            <div className="text-right flex gap-4">
                                                                <div className="text-base font-semibold text-teal-600">
                                                                    {Number(chore.reward).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {(() => {
                                                                        let avatarPath: string | undefined;
                                                                        const kid = kids.find((k) => k.id === kidId);
                                                                        if (kid && kid.avatar) avatarPath = kid.avatar;
                                                                        const avatarUrl = getAvatarUrl(avatarPath);
                                                                        const name = chore.kidName;
                                                                        if (avatarUrl) {
                                                                            return (
                                                                                <Image
                                                                                    src={avatarUrl}
                                                                                    alt={name || ""}
                                                                                    className="w-6 h-6 rounded-full object-cover mr-1 border border-gray-200"
                                                                                />
                                                                            );
                                                                        } else {
                                                                            return (
                                                                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs mr-1">
                                                                                    {name?.charAt(0).toUpperCase() || ""}
                                                                                </span>
                                                                            );
                                                                        }
                                                                    })()}
                                                                    <span className="text-xs text-gray-500">
                                                                        {chore.kidName?.split(" ")[0] || ""}
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
};

export default KidChoreQuest;