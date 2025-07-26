'use client'

import ParentStatsProvider from "@/components/providers/stats-providers";
import AppChoreManagement from "../AppChoreManagement";
import { Task } from "@/components/dashboard/AppChoreManagement";
import { Button } from "@/components/ui/button";
import AppKidsManager from "./AppKidsManager/AppKidsManager";

interface TaskMasterDashboardProps {
    onCreateChoreClick?: () => void;
    onAssignChore?: (kidId: string) => void;
    choreSummary?: any;
    walletStats?: any;
    tasks?: any[];
    kids?: any[];
    isLoading?: boolean;
    isError?: boolean;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    kidsPage: number;
    kidsTotalPages: number;
    onKidsPageChange: (page: number) => void;
    pagedKids: any[];
    kidsCount: number;

}

const TaskMasterDashboard = ({
    onCreateChoreClick,
    onAssignChore,
    choreSummary,
    // walletStats,
    tasks = [],
    kids = [],
    onEditTask,
    onDeleteTask,
    isLoading,
    isError,
    page,
    totalPages,
    onPageChange,
    kidsPage,
    kidsTotalPages,
    onKidsPageChange,
    pagedKids = [],
}: TaskMasterDashboardProps) => {

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading dashboard data.</div>;

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onCreateChoreClick}
                >
                    Create Chore
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ParentStatsProvider />

                <div className="lg:col-span-2 rounded h-full flex flex-col">
                    <AppChoreManagement
                        tasks={tasks}
                        kids={kids}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                        choreSummary={choreSummary}
                        // walletStats={walletStats}
                    />
                </div>
                <div className="lg:col-span-1  flex flex-col">
                    <AppKidsManager
                        kids={pagedKids}
                        kidsCount={kids.length}
                        kidsPage={kidsPage}
                        kidsTotalPages={kidsTotalPages}
                        isLoading={!!isLoading}
                        isError={!!isError}
                        onCreateKid={onCreateChoreClick ?? (() => { })}
                        onAssignChore={onAssignChore ?? (() => { })}
                        onKidsPageChange={onKidsPageChange}

                    />
                </div>
            </div>
        </>
    )
}

export default TaskMasterDashboard