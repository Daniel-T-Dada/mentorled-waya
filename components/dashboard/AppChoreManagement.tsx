'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback /*, AvatarImage */ } from "@/components/ui/avatar"; // AvatarImage unused, comment out
import { Pencil, Trash } from "lucide-react";
import { usePathname } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from '@/hooks/use-mobile';
import Pagination from "@/components/Pagination";

// Types for tasks and kids
export interface Task {
    id: string;
    title: string;
    firstName: string;
    description: string;
    reward: number | string;
    amount?: number | string;
    dueDate?: string;
    assignedTo: string;
    assignedToName?: string;
    assignedToUsername?: string;
    status: "pending" | "completed";
    createdAt: string;
    
}

export interface Kid {
    id: string;
    child_id: string;
    child_name: string;
    firstName: string;
    level: number;
    balance: number;
    total_earned?: string | number;
    total_spent?: string | number;
    avatar?: string | null;
    username: string;
    displayName?: string;
    name?: string;
    completedChoreCount: number;
    pendingChoreCount: number;
    progress: number;
    parent?: string;
    created_at?: string;
}

interface AppChoreManagementProps {
    tasks: Task[]; // This is a backend page (10 tasks max)
    kids: Kid[];
    kidId?: string;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    page: number; // frontend page (1-based)
    totalPages: number;
    onPageChange: (page: number) => void;
    choreSummary?: {
        pending: number;
        completed: number;
        missed?: number;
        total: number
    };
    // walletStats?: {
    //     family_wallet_balance: string;
    //     total_rewards_sent: string;
    //     total_rewards_pending: string;
    //     children_count: number;
    //     total_children_balance: string
    // };
}

function mapTasks(tasks: Task[]): Task[] {
    return tasks.map(task => ({
        ...task,
        reward: task.amount ?? task.reward ?? 0,
    }));
}

// Map assignedTo (task) to child_id (kid)
function getKidByTask(task: Task, kids: Kid[]): Kid | undefined {
    return (
        kids.find(k => k.child_id === task.assignedTo) ||
        kids.find(k => k.id === task.assignedTo) ||
        kids.find(k => k.username === task.assignedTo) ||
        kids.find(k => k.displayName === task.assignedToName) || // fallback
        kids.find(k => k.name === task.assignedToName)

    );
}

// Get the 3 most recent unique kids (by child_id) who have tasks
function getRecentKids(tasks: Task[], kids: Kid[]): Kid[] {
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const seen = new Set<string>();
    const recentKids: Kid[] = [];
    for (const task of sortedTasks) {
        const kid = getKidByTask(task, kids);
        if (kid && !seen.has(kid.child_id)) {
            recentKids.push(kid);
            seen.add(kid.child_id);
        }
        if (recentKids.length === 3) break;
    }
    return recentKids;
}

const FRONTEND_CHORES_PER_PAGE = 5;
const BACKEND_CHORES_PER_PAGE = 10;

export default function AppChoreManagement({
    tasks,
    kids,
    kidId,
    onEditTask,
    onDeleteTask,
    page,
    totalPages,
    onPageChange,
    choreSummary,
    // walletStats,
}: AppChoreManagementProps) {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    // --- PAGINATION LOGIC ---
    // Calculate where to slice the backend 10-task page for the current frontend 5-task page
    const start = ((page - 1) % (BACKEND_CHORES_PER_PAGE / FRONTEND_CHORES_PER_PAGE)) * FRONTEND_CHORES_PER_PAGE;
    const end = start + FRONTEND_CHORES_PER_PAGE;
    const pagedTasks = tasks.slice(start, end);

    const mappedTasks = useMemo(() => mapTasks(pagedTasks), [pagedTasks]);
    const [activeStatusTab, setActiveStatusTab] = useState("pending");
    const [activeKidTab, setActiveKidTab] = useState("all");

    const kidsForTabs = useMemo(() => getRecentKids(mappedTasks, kids), [mappedTasks, kids]);

    // Filter tasks by kid tab or kidId
    const filteredTasks = useMemo(() => {
        let filtered = mappedTasks;
        if (!kidId && activeKidTab !== "all") {
            filtered = filtered.filter(task => {
                const kid = getKidByTask(task, kids);
                return kid && kid.child_id === activeKidTab;
            });
        }
        if (kidId) {
            filtered = filtered.filter(task => {
                const kid = getKidByTask(task, kids);
                return kid && kid.child_id === kidId;
            });
        }
        return filtered.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [mappedTasks, activeKidTab, kidId, kids]);

    // Pagination using FRONTEND_CHORES_PER_PAGE (already sliced!)
    const pendingTasks = filteredTasks.filter(task => task.status === "pending");
    const completedTasks = filteredTasks.filter(task => task.status === "completed");

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                {pathname === '/dashboard/parents/taskmaster' && !kidId && (
                    <Tabs value={activeKidTab} onValueChange={setActiveKidTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="all">All Chores</TabsTrigger>
                            {kidsForTabs.map(kid => (
                                <TabsTrigger key={`kid-tab-${kid.child_id}`} value={kid.child_id}>
                                    {kid.firstName}&apos;s Chores
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                )}
                <CardTitle className="text-xl font-semibold">
                    Chore Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Assign and manage kid&apos;s chores
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="w-full flex flex-col h-full">
                    <TabsList className="grid grid-cols-2 w-full h-12 flex-shrink-0">
                        <TabsTrigger value="pending" className="border p-2">
                            Pending ({choreSummary?.pending ?? 0})
                        </TabsTrigger>
                        <TabsTrigger value="completed">
                            Completed ({choreSummary?.completed ?? 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Pending */}
                    <TabsContent value="pending" className="flex-1 flex flex-col mt-4 overflow-hidden ">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {pendingTasks.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No pending chores found for {activeKidTab === "all" ? "all kids" : (kidsForTabs.find(k => k.child_id === activeKidTab)?.child_name.split(' ')[0] || "Unknown")}.
                                    </div>
                                ) : (
                                    pendingTasks.map((task) => {
                                        const kid = getKidByTask(task, kids);
                                        const taskFirstName = kid ? kid.firstName : "Unknown";
                                        return (
                                            <div key={`pending-chore-${task.id}`} className="border rounded-md p-4 bg-popover">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{task.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {onEditTask && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-primary hover:text-primary/90"
                                                                onClick={() => onEditTask(task)}
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                        {onDeleteTask && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive/90"
                                                                onClick={() => onDeleteTask(task.id)}
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-sm font-medium text-green-500">
                                                        ₦{task.reward && !isNaN(Number(task.reward)) ? Number(task.reward).toLocaleString() : '0'}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarFallback>{taskFirstName.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs">{taskFirstName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                        {!isMobile && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        )}
                    </TabsContent>
                    {/* Completed */}
                    <TabsContent value="completed" className="flex-1 flex flex-col mt-4 overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="space-y-4 pr-4">
                                {completedTasks.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No completed chores found for {activeKidTab === "all" ? "all kids" : (kidsForTabs.find(k => k.child_id === activeKidTab)?.child_name.split(' ')[0] || "Unknown")}.
                                    </div>
                                ) : (
                                    completedTasks.map((task) => {
                                        const kid = getKidByTask(task, kids);
                                        const taskFirstName = kid ? kid.firstName : "Unknown";

                                        return (
                                            <div key={`completed-chore-${task.id}`} className="border rounded-md p-4 bg-popover">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{task.title}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {onEditTask && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-primary hover:text-primary/90"
                                                                onClick={() => onEditTask(task)}
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                        {onDeleteTask && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive/90"
                                                                onClick={() => onDeleteTask(task.id)}
                                                            >
                                                                <Trash className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-sm font-medium text-green-500">
                                                        ₦{task.reward && !isNaN(Number(task.reward)) ? Number(task.reward).toLocaleString() : '0'}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarFallback>{taskFirstName.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs">{taskFirstName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                        {!isMobile && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}