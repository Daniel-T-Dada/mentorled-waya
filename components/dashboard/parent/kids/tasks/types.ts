import { Kid, Chore } from '@/lib/services/mockDataService';

export interface TasksData {
    pending: Chore[];
    completed: Chore[];
    overdue: Chore[];
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
    task: Chore;
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
