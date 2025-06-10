import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { TaskTabsProps } from './types';

export const TaskTabs = ({ kid, tasks }: TaskTabsProps) => {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="pending" className="flex gap-2 items-center">
                            <Clock className="h-4 w-4" />
                            <span>Pending ({tasks.pending.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex gap-2 items-center">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed ({tasks.completed.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="overdue" className="flex gap-2 items-center">
                            <XCircle className="h-4 w-4" />
                            <span>Overdue ({tasks.overdue.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        {tasks.pending.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No Pending Tasks</h3>
                                <p>There are no pending tasks for {kid.name} right now.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.pending.map(task => (
                                    <TaskCard key={task.id} task={task} status="pending" />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed">
                        {tasks.completed.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No Completed Tasks Yet</h3>
                                <p>Tasks that {kid.name} completes will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.completed.map(task => (
                                    <TaskCard key={task.id} task={task} status="completed" />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="overdue">
                        {tasks.overdue.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                                <h3 className="text-lg font-medium mb-2">Great Job!</h3>
                                <p>No overdue tasks. {kid.name} is staying on track!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <h4 className="font-medium text-red-800 mb-1">Attention Required</h4>
                                    <p className="text-sm text-red-600">
                                        {kid.name} has {tasks.overdue.length} overdue task{tasks.overdue.length > 1 ? 's' : ''}.
                                        Consider sending a reminder or adjusting the due dates.
                                    </p>
                                </div>
                                {tasks.overdue.map(task => (
                                    <TaskCard key={task.id} task={task} status="overdue" />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
