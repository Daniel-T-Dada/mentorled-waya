'use client'

import { useState } from "react";
import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"
import AppStatCard from "../AppStatCard"
import { Button } from "@/components/ui/button";
import { CreateChore } from "@/components/modals/CreateChore";
import { toast } from "sonner";


interface TaskMasterDashboardProps {
    onCreateChoreClick?: () => void;
}

const TaskMasterDashboard = ({ onCreateChoreClick }: TaskMasterDashboardProps = {}) => {
    const [isCreateChoreModalOpen, setIsCreateChoreModalOpen] = useState(false);
    const [selectedKidId, setSelectedKidId] = useState<string>("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateChore = () => {
        setSelectedKidId(""); // Clear selection for general chore creation
        setIsCreateChoreModalOpen(true);
        onCreateChoreClick?.(); // Call the parent handler if provided
    };

    const handleAssignChore = (kidId: string) => {
        setSelectedKidId(kidId); // Pre-select the kid
        setIsCreateChoreModalOpen(true);
    }; const handleCreateChoreSuccess = () => {
        toast.success('Chore created successfully!');
        setIsCreateChoreModalOpen(false);
        setSelectedKidId("");
        // Trigger refresh of chore data
        setRefreshTrigger(prev => prev + 1);
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
                {/* <DebugBarChart/> */}




                <div className="lg:col-span-2 min-h-[550px] rounded">




                    <AppChoreManagement refreshTrigger={refreshTrigger} />


                </div>
                <div className="lg:col-span-1 min-h-[550px] self-start">
                    <AppKidsManagement onAssignChore={handleAssignChore} />
                </div>
            </div>

            {/* Create Chore Modal */}
            <CreateChore
                isOpen={isCreateChoreModalOpen}
                onClose={() => {
                    setIsCreateChoreModalOpen(false);
                    setSelectedKidId("");
                }}
                onSuccess={handleCreateChoreSuccess}
                preSelectedKid={selectedKidId || undefined}
            />
        </>
    )
}
export default TaskMasterDashboard