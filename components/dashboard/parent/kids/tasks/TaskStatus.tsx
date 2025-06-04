import { CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { TaskStatusProps } from './types';

export const TaskStatus = ({ kid, totalTasks, completedCount, pendingCount, overdueCount }: TaskStatusProps) => {
    return (
        <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <div className="text-muted-foreground text-sm">Completed Tasks</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <div className="text-muted-foreground text-sm">Pending Tasks</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{overdueCount}</div>
                        <div className="text-muted-foreground text-sm">Overdue Tasks</div>
                    </div>
                </div>
            </div>

            {totalTasks === 0 && (
                <div className="text-center mt-4 text-muted-foreground">
                    <p>No tasks assigned to {kid.name} yet.</p>
                </div>
            )}
        </CardContent>
    );
};
