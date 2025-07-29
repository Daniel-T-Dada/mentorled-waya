"use client"

import ParentStatsProvider from "@/components/providers/stats-providers";
import AppChoreManagement from "../AppChoreManagement";
import { Task } from "@/components/dashboard/AppChoreManagement";
import { Button } from "@/components/ui/button";
import AppKidsManager from "./AppKidsManager/AppKidsManager";

interface TaskMasterDashboardProps {
    onCreateChoreClick?: () => void;
    onAssignChore?: (kidId: string) => void;
    choreSummary?: any;
    tasks?: any[];
    kids?: any[];
    isLoading?: boolean;
    // isError?: boolean;
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
    tasks = [],
    kids = [],
    onEditTask,
    onDeleteTask,
    // isError,
    page,
    totalPages,
    onPageChange,
    kidsPage,
    kidsTotalPages,
    onKidsPageChange,
    pagedKids = [],
}: TaskMasterDashboardProps) => {
    // Handle isError in the background (e.g., log or silent handling)
    // if (isError) {
    //     console.warn("An error occurred in TaskMasterDashboard, handled in background.");
    //     // Additional error handling can be added here (e.g., analytics, retry logic)
    // }

    const showInfoState = tasks.length === 0 && pagedKids.length === 0;

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
                    {showInfoState ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground text-center">
                                No chores or kids available. Create a chore to get started!
                            </p>
                        </div>
                    ) : (
                        <AppChoreManagement
                            tasks={tasks}
                            kids={kids}
                            page={page}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            onEditTask={onEditTask}
                            onDeleteTask={onDeleteTask}
                            choreSummary={choreSummary}
                        />
                    )}
                </div>
                <div className="lg:col-span-1 flex flex-col">
                    {showInfoState ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground text-center">
                                No kids available. Add a kid to manage their tasks!
                            </p>
                        </div>
                    ) : (
                        <AppKidsManager
                            kids={pagedKids}
                            kidsCount={kids.length}
                            kidsPage={kidsPage}
                            kidsTotalPages={kidsTotalPages}
                            isLoading={false}
                            // isError={false} // Errors handled in background, so set to false for UI
                            onCreateKid={onCreateChoreClick}
                            onAssignChore={onAssignChore}
                            onKidsPageChange={onKidsPageChange}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TaskMasterDashboard