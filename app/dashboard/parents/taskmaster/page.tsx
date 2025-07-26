'use client'

import TaskMasterDashboard from "@/components/dashboard/parent/TaskMasterDashboard";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskRequest } from "@/lib/utils/taskTransforms";
import { useChoreApi } from "@/hooks/use-authenticated-api";
import { Task } from "@/components/dashboard/AppChoreManagement";
import { PaginatedResponse, usePaginatedApiQuery } from "@/hooks/usePagination";
import CreateChore from "@/components/modals/CreateChore";
import EditChore from "@/components/modals/EditChore";
import { ChoreFormValues } from "@/components/modals/ChoreForm";

const CHORES_PER_PAGE = 10;
const FRONTEND_KIDS_PER_PAGE = 3;
const BACKEND_KIDS_PER_PAGE = 10;

interface ChildWallet {
    child_name: string;
    balance: number;
    total_earned: number;
    total_spent?: number;
    savings_rate?: number;
    id?: string;
}

interface Kid {
    id: string;
    name: string;
    username: string;
    displayName?: string;
    child_name: string;
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
    created_at?: string;
    parent?: string;
}

interface TaskType {
    id: string;
    assignedTo: string;
    status: string;
    [key: string]: any;
}

const fetchChores = async (page: number, accessToken?: string) => {
    const res = await fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS) + `?page=${page}`, {
        headers: {
            Authorization: `Bearer ${accessToken ?? ""}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch chores");
    return res.json();
};

function formatToYMD(date: Date | string): string {
    if (!date) return "";
    if (typeof date === "string") {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        if (!isNaN(Date.parse(date))) return date.slice(0, 10);
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
    }
    return "";
}

const TaskMasterPage = () => {
    const [isCreateChoreOpen, setIsCreateChoreOpen] = useState(false);
    const [isEditChoreOpen, setIsEditChoreOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { data: session } = useSession();
    const [selectedKid, setSelectedKid] = useState("");
    const queryClient = useQueryClient();
    const { makeAuthenticatedCall } = useChoreApi();

    // Separate pagination for chores and kids
    const [page, setPage] = useState(1); // chores page
    const [kidsPage, setKidsPage] = useState(1);

    // Calculate which backend page to fetch for the current frontend page
    const backendKidsPage = Math.floor((kidsPage - 1) * FRONTEND_KIDS_PER_PAGE / BACKEND_KIDS_PER_PAGE) + 1;

    // Fetch paginated kids list (NEW)
    const paginatedKidsQuery = useApiQuery<PaginatedResponse<Kid>>({
        endpoint: getApiUrl(API_ENDPOINTS.LIST_CHILDREN) + `?page=${backendKidsPage}&page_size=${BACKEND_KIDS_PER_PAGE}`,
        queryKey: ['paginated-kids', backendKidsPage, BACKEND_KIDS_PER_PAGE],
        enabled: !!session?.user?.accessToken,
    });

    // Other queries
    const choreSummaryQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.CHORE_SUMMARY),
        queryKey: ['chore-summary'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const walletStatsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.WALLET_DASHBOARD_STATS),
        queryKey: ['wallet-dashboard-stats'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    const choresQuery = usePaginatedApiQuery(
        'chores-list',
        (page) => fetchChores(page, session?.user?.accessToken),
        page
    );

    // This can still be used for wallet balances, not for kids list
    const childrenWalletsQuery = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.CHILDREN_WALLETS),
        queryKey: ['children-wallets'],
        enabled: !!session?.user?.accessToken,
        refetchInterval: 5000,
    });

    // Flatten paginated results if necessary
    const tasks = (choresQuery.data?.results || []) as TaskType[];
    const kidsRaw = (paginatedKidsQuery.data?.results || []) as Kid[];
    const kidsCount = paginatedKidsQuery.data?.count || 0;
    const kidsTotalPages = Math.max(1, Math.ceil(kidsCount / FRONTEND_KIDS_PER_PAGE));
    const childrenWallets = (childrenWalletsQuery.data?.results || childrenWalletsQuery.data || []) as ChildWallet[];
    const totalPages = choresQuery.data ? Math.ceil(choresQuery.data.count / CHORES_PER_PAGE) : 1;

    // Slice backend results for the current frontend page
    const backendKidsResults = paginatedKidsQuery.data?.results || [];

    // --- Compose processedKids for the current backend page only ---
    const processedKids: Kid[] = backendKidsResults.map((kid) => {
        const displayName = kid.name || kid.displayName || kid.child_name || kid.username || "";
        const firstName = displayName.trim().split(" ")[0];

        const walletData = childrenWallets.find(
            (wallet: ChildWallet) =>
                wallet.child_name === displayName ||
                wallet.child_name === kid.username
        ) || {} as ChildWallet;

        const kidChores = tasks.filter(
            (task: TaskType) =>
                task.assignedTo === kid.id ||
                task.assignedTo === kid.username
        );
        const completedChoreCount = kidChores.filter(
            (chore: TaskType) => chore.status === "completed"
        ).length;
        const pendingChoreCount = kidChores.filter(
            (chore: TaskType) => chore.status === "pending"
        ).length;

        const totalEarned = walletData.total_earned || 0;
        const balance = walletData.balance || 0;
        const totalChores = kidChores.length;
        const progress =
            totalChores > 0
                ? Math.round((completedChoreCount / totalChores) * 100)
                : 0;

        return {
            ...kid,
            displayName,
            firstName,
            balance,
            completedChoreCount,
            pendingChoreCount,
            progress,
            child_id: kid.id,
            child_name: displayName,
            level: Math.max(1, Math.floor(totalEarned / 1000) + 1),
        };
    });

    // Sort kids by created_at (descending, newest first)
    const sortedKids = [...processedKids].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
    });

    const start = (kidsPage - 1) * FRONTEND_KIDS_PER_PAGE;
    const end = start + FRONTEND_KIDS_PER_PAGE;
    const pagedKids = sortedKids.slice(start, end);

    // --- Chore create mutation
    const createChoreMutation = useMutation({
        mutationFn: async (choreData: {
            title: string;
            description: string;
            reward: string | number;
            dueDate: Date;
            assignedTo: string;
        }) => {
            const rewardValue = Number(String(choreData.reward).replace(/[^0-9]/g, ''));
            const payload = createTaskRequest(
                choreData.title,
                choreData.description,
                choreData.assignedTo,
                rewardValue,
                choreData.dueDate
            );
            return await makeAuthenticatedCall({
                endpoint: getApiUrl(API_ENDPOINTS.CREATE_TASK),
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['chores-list'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    results: [data, ...old.results],
                    count: (old.count ?? 0) + 1,
                };
            });
            queryClient.invalidateQueries({ queryKey: ['chores-list'] });
            toast.success("Chore created!");
            setIsCreateChoreOpen(false);
            setSelectedKid("");
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to create chore');
        },
    });

    // Edit mutation
    const editChoreMutation = useMutation({
        mutationFn: async (updatedTask: Task) => {
            return await makeAuthenticatedCall({
                endpoint: getApiUrl(API_ENDPOINTS.UPDATE_TASK.replace(':taskId', updatedTask.id)),
                method: 'PATCH',
                body: JSON.stringify({
                    title: updatedTask.title,
                    description: updatedTask.description,
                    reward: Number(updatedTask.reward),
                    due_date: updatedTask.dueDate,
                    assigned_to: updatedTask.assignedTo,
                }),
                headers: { 'Content-Type': 'application/json' }
            });
        },
        onSuccess: () => {
            toast.success('Chore updated!');
            setIsEditChoreOpen(false);
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ['chores-list'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to update chore');
        }
    });

    // Delete mutation
    const deleteChoreMutation = useMutation({
        mutationFn: async (taskId: string) => {
            return await makeAuthenticatedCall({
                endpoint: getApiUrl(API_ENDPOINTS.DELETE_TASK.replace(':taskId', taskId)),
                method: 'DELETE'
            });
        },
        onSuccess: () => {
            toast.success('Chore deleted!');
            queryClient.invalidateQueries({ queryKey: ['chores-list'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete chore');
        }
    });

    // --- Handlers ---
    const handleCreateChore = () => {
        setSelectedKid("");
        setIsCreateChoreOpen(true);
    };

    const handleAssignChore = (kidId: string) => {
        setSelectedKid(kidId);
        setIsCreateChoreOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsEditChoreOpen(true);
    };

    // Merge ChoreFormValues with Task for updating
    const handleEditChoreSubmit = (formData: ChoreFormValues) => {
        if (!editingTask) return;
        const updatedTask: Task = {
            ...editingTask,
            ...formData,
            dueDate: formatToYMD(formData.dueDate),
            reward: formData.reward,
        };
        editChoreMutation.mutate(updatedTask);
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this chore?')) {
            deleteChoreMutation.mutate(taskId);
        }
    };

    useEffect(() => {
        if (kidsPage > kidsTotalPages) {
            setKidsPage(kidsTotalPages);
        }
    }, [kidsPage, kidsTotalPages]);

    const handleKidsPageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > kidsTotalPages) return;
        setKidsPage(nextPage);
    };

    // Loading/Error
    const isLoading =
        choreSummaryQuery.isLoading ||
        walletStatsQuery.isLoading ||
        choresQuery.isLoading ||
        paginatedKidsQuery.isLoading ||
        childrenWalletsQuery.isLoading;

    const isError =
        !!choreSummaryQuery.error ||
        !!walletStatsQuery.error ||
        !!choresQuery.error ||
        !!paginatedKidsQuery.error ||
        !!childrenWalletsQuery.error;

    return (
        <div className="">
            <TaskMasterDashboard
                onCreateChoreClick={handleCreateChore}
                onAssignChore={handleAssignChore}
                choreSummary={choreSummaryQuery.data}
                walletStats={walletStatsQuery.data}
                isLoading={isLoading}
                isError={isError}
                tasks={tasks}
                kids={processedKids}
                pagedKids={pagedKids}
                kidsCount={kidsCount}
                kidsPage={kidsPage}
                kidsTotalPages={kidsTotalPages}
                onKidsPageChange={handleKidsPageChange}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
            />

            <CreateChore
                isOpen={isCreateChoreOpen}
                onClose={() => {
                    setIsCreateChoreOpen(false);
                    setSelectedKid("");
                }}
                preSelectedKid={selectedKid}
                isLoading={createChoreMutation.isPending}
                onSubmit={(formData) => createChoreMutation.mutate(formData)}
            />

            {/* Edit Chore Modal */}
            {isEditChoreOpen && editingTask && (
                <EditChore
                    isOpen={isEditChoreOpen}
                    onClose={() => {
                        setIsEditChoreOpen(false);
                        setEditingTask(null);
                    }}
                    task={editingTask}
                    kids={kidsRaw}
                    onSubmit={handleEditChoreSubmit}
                    isLoading={editChoreMutation.isPending}
                />
            )}
        </div>
    );
};

export default TaskMasterPage;