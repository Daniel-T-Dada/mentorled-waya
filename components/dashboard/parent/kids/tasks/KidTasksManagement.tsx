

import { useRouter } from 'next/navigation';
import { KidTasksManagementProps } from './types';
import { useKidTasksData } from './useKidTasksData';
import { TasksLoading } from './TasksLoading';
import { TasksError } from './TasksError';
import { KidTasksHeader } from './KidTasksHeader';
import { TaskStatus } from './TaskStatus';
import { TaskTabs } from './TaskTabs';
import { Card } from "@/components/ui/card";

export const KidTasksManagement = ({ kidId }: KidTasksManagementProps) => {
    const router = useRouter();
    const { kid, loading, error, tasks, stats } = useKidTasksData(kidId);

    if (loading) {
        return <TasksLoading />;
    }

    if (error || !kid) {
        return <TasksError onBack={() => router.push('/dashboard/parents/kids')} />;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <KidTasksHeader
                kid={kid}
                totalTasks={stats.totalTasks}
                completionRate={stats.completionRate}
                onBack={() => router.back()}
            />

            <Card className="shadow-md">
                <TaskStatus
                    kid={kid}
                    totalTasks={stats.totalTasks}
                    completedCount={stats.completedCount}
                    pendingCount={stats.pendingCount}
                    overdueCount={stats.overdueCount}
                />
            </Card>

            <TaskTabs kid={kid} tasks={tasks} />
        </div>
    );
};
