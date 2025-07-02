import { Task } from '@/lib/utils/taskTransforms';

// Kid interface matching the one in useKidTasksData.ts
export interface Kid {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
    age?: number;
    created_at?: string;
    parentId?: string;
}

export interface TasksData {
    pending: Task[];
    completed: Task[];
    overdue: Task[];
}

export interface KidTasksManagementProps {
    kidId: string;
    onCreateChore?: () => void;
}

export interface KidTasksHeaderProps {
    kid: Kid;
    totalTasks: number;
    completionRate: number;
    onBack: () => void;
    onCreateChore?: () => void;
}

export interface TaskTabsProps {
    kid: Kid;
    tasks: TasksData;
}

export interface TaskCardProps {
    task: Task;
    status?: 'pending' | 'completed' | 'overdue';
}

export interface TaskStatusProps {
    kid: Kid;
    totalTasks: number;
    completedCount: number;
    pendingCount: number;
    overdueCount: number;
}

export interface TasksErrorProps {
    onBack: () => void;
}
