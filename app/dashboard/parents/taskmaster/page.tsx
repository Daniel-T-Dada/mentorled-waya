'use client'

import TaskMasterDashboard from "@/components/dashboard/parent/TaskMasterDashboard"
import { CreateChore } from "@/components/modals/CreateChore";
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
    return (
        <div className="">
            <TaskMasterDashboard onCreateChoreClick={() => setIsCreateChoreOpen(true)} />
            {/* Create Chore Modal */}
            <CreateChore
                isOpen={isCreateChoreOpen}
                onClose={() => {
                    setIsCreateChoreOpen(false);
                    setSelectedKid("");
                }}
                onSuccess={() => {
                    // Refresh chores list
                    const fetchChores = async () => {
                        if (!session?.user?.id) return;
                        try {
                            const response = await fetch(`${getApiUrl(API_ENDPOINTS.CHORES)}?parentId=${session.user.id}`);
                            if (!response.ok) throw new Error('Failed to fetch chores');
                            const data = await response.json();
                            setChores(data);
                        } catch (error) {
                            console.error('Error fetching chores:', error);
                            toast.error('Failed to load chores');
                        }
                    };
                    fetchChores(); setSelectedKid("");
                }}
                preSelectedKid={selectedKid}
            />
        </div>)
}

export default TaskMasterPage;