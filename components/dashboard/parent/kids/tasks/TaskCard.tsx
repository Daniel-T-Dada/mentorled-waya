import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import type { TaskCardProps } from './types';

export const TaskCard = ({ task, status }: TaskCardProps) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusIcon = () => {
        switch (status || task.status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'overdue':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status || task.status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusText = () => {
        switch (status || task.status) {
            case 'completed':
                return 'Completed';
            case 'overdue':
                return 'Overdue';
            default:
                return 'Pending';
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-full ${status === 'completed' ? 'bg-green-100' : status === 'overdue' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {getStatusIcon()}
                </div>
                <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(task.dueDate)}</span>
                        </div>
                        <Badge className={getStatusColor()}>
                            {getStatusText()}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="font-bold">NGN {task.reward.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Reward</div>
            </div>
        </div>
    );
};
