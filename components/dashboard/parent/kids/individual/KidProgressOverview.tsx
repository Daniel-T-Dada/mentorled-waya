import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { KidProgressOverviewProps } from './types';

export const KidProgressOverview = ({ kid, stats }: KidProgressOverviewProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{Math.round(stats.progress)}%</span>
                    </div>
                    <Progress value={stats.progress} className="w-full" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.completedChores}</div>
                            <div className="text-sm text-muted-foreground">Completed Tasks</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingChores}</div>
                            <div className="text-sm text-muted-foreground">Pending Tasks</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">NGN {kid.balance.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Current Balance</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
