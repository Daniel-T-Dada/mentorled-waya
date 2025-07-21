'use client'

import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"
import AppStatCard from "../AppStatCard"
import { Button } from "@/components/ui/button";

interface TaskMasterDashboardProps {
    onCreateChoreClick?: () => void;
    onAssignChore?: (kidId: string) => void;
    refreshTrigger?: number;
}

const TaskMasterDashboard = ({ onCreateChoreClick, onAssignChore, refreshTrigger }: TaskMasterDashboardProps = {}) => {

    const handleCreateChore = () => {
        onCreateChoreClick?.(); // Call the parent handler
    };

    const handleAssignChore = (kidId: string) => {
        onAssignChore?.(kidId); // Call the parent handler with kidId
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleCreateChore}
                >
                    Create Chore
                </Button>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AppStatCard />
                




                <div className="lg:col-span-2 min-h-[550px] rounded">




                    <AppChoreManagement refreshTrigger={refreshTrigger} />


                </div>
                <div className="lg:col-span-1 min-h-[550px] self-start">
                    <AppKidsManagement
                        onAssignChore={handleAssignChore}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </>
    )
}

export default TaskMasterDashboard