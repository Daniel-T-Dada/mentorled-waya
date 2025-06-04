import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import type { KidTasksHeaderProps } from './types';

export const KidTasksHeader = ({ kid, totalTasks, completionRate, onBack }: KidTasksHeaderProps) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                        <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{kid.name}&apos;s Tasks</h1>
                        <div className="text-muted-foreground text-sm">
                            {totalTasks} total tasks
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-1/3">
                <div className="flex justify-between text-sm">
                    <span>Task Completion</span>
                    <span className="font-medium">{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
            </div>
        </div>
    );
};
