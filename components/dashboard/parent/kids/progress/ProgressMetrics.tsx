import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle, Target, Award } from 'lucide-react';
import type { ProgressMetricsProps } from './types';

export const ProgressMetrics = ({
    kid,
    completionRate,
    completedTasks,
    totalTasks,
    streaks
}: ProgressMetricsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Overall Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{kid.progress}%</div>
                    <Progress value={kid.progress} className="h-2" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Completion Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">{completionRate.toFixed(0)}%</div>
                    <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} tasks</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium">Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">{streaks.current}</div>
                    <p className="text-xs text-muted-foreground">days in a row</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">Level</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">{kid.level}</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                </CardContent>
            </Card>
        </div>
    );
};
