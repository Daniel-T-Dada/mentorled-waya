'use client'

import TaskMasterDashboard from "@/components/dashboard/parent/TaskMasterDashboard"
import { CreateChoreLazy as CreateChore } from "@/components/lazy/modals/CreateChoreLazy";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';


interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    dueDate: string;
    status: "pending" | "completed" | "cancelled";
    assignedTo: string;
    parentId: string;
    createdAt: string;
    completedAt?: string;
}

const TaskMasterPage = () => {
    const [isCreateChoreOpen, setIsCreateChoreOpen] = useState(false);
    const { data: session } = useSession();
    const [selectedKid, setSelectedKid] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [chores, setChores] = useState<Chore[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateChore = () => {
        setSelectedKid(""); // Clear any pre-selected kid
        setIsCreateChoreOpen(true);
    };

    const handleAssignChore = (kidId: string) => {
        setSelectedKid(kidId); // Pre-select the kid
        setIsCreateChoreOpen(true);
    }; const handleChoreSuccess = () => {
        // Trigger refresh of data immediately
        setRefreshTrigger(prev => prev + 1);

        // Also manually refresh chores list as backup
        const fetchChores = async () => {
            if (!session?.user?.id || !session?.user?.accessToken) return;
            try {
                console.log('TaskMaster - Refreshing chores after creation...');
                const response = await fetch(getApiUrl(API_ENDPOINTS.LIST_TASKS), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken}`,
                    },
                });
                if (!response.ok) throw new Error('Failed to fetch chores');
                const data = await response.json();
                console.log('TaskMaster - Refreshed chores:', data);
                setChores(data);
                toast.success('Chore created successfully!');
            } catch (error) {
                console.error('Error fetching chores:', error);
                toast.error('Failed to refresh chores list');
            }
        };

        // Add small delay to ensure backend consistency
        setTimeout(fetchChores, 600);
        setSelectedKid("");
    }; return (
        <div className="">            
        <TaskMasterDashboard
            onCreateChoreClick={handleCreateChore}
            onAssignChore={handleAssignChore}
            refreshTrigger={refreshTrigger}
        />
            {/* Create Chore Modal */}
            <CreateChore
                isOpen={isCreateChoreOpen}
                onClose={() => {
                    setIsCreateChoreOpen(false);
                    setSelectedKid("");
                }}
                onSuccess={handleChoreSuccess}
                preSelectedKid={selectedKid}
            />
        </div>)
}

export default TaskMasterPage;