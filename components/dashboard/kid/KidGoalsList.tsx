'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Trophy, Calendar, Edit, Trash2 } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { API_ENDPOINTS, getApiUrl } from "@/lib/utils/api";
import { formatNaira } from "@/lib/utils/currency";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

// Status pill styles using Tailwind classes
const getStatusPill = (progress: number) => {
    if (progress >= 60) return { bg: "bg-[color:var(--status-success-bg)] bg-opacity-50", color: "text-[color:var(--status-success-text)]" };
    if (progress >= 30) return { bg: "bg-[color:var(--status-warning-bg)]", color: "text-[color:var(--status-warning-text)]" };
    return { bg: "bg-[color:var(--status-error-bg)]", color: "text-[color:var(--status-error-text)]" };
};

const getTimeLeft = (days: number) => {
    if (days <= 0) return "Due soon";
    if (days >= 30) {
        const months = Math.floor(days / 30);
        return `${months} Month${months > 1 ? "s" : ""} left`;
    }
    if (days >= 7) {
        const weeks = Math.floor(days / 7);
        return `${weeks} Week${weeks > 1 ? "s" : ""} left`;
    }
    return `${days} Day${days > 1 ? "s" : ""} left`;
};

interface Goal {
    id: string;
    title: string;
    description: string;
    target_amount: string;
    target_duration_months: number;
    image: string | null;
    status: string;
    created_at: string;
    achieved_at: string | null;
    saved_amount: number;
    percent_completed: number;
    time_remaining: number;
    trophy_image: string | null;
    trophy_type: string | null;
}

// Edit Modal for updating title
function EditGoalModal({
    open,
    onClose,
    goal,
    onSave,
    isLoading,
}: {
    open: boolean;
    onClose: () => void;
    goal: Goal | null;
    onSave: (title: string) => void;
    isLoading: boolean;
}) {
    const [title, setTitle] = useState(goal?.title ?? "");

    // Sync title with goal when opening
    useEffect(() => {
        setTitle(goal?.title ?? "");
    }, [goal]);

    if (!open || !goal) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-[color:var(--card)] rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="font-semibold text-lg mb-4">Edit Goal Title</h2>
                <Input
                    className="w-full px-3 py-2 border rounded mb-4"
                    style={{ borderColor: "var(--border)" }}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={() => onSave(title)} disabled={isLoading || !title.trim()}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

const KidGoalsList = () => {
    const queryClient = useQueryClient();
    const { makeAuthenticatedCall } = useAuthenticatedApi();

    const { data, isLoading, error } = useApiQuery<{
        count: number;
        next: string | null;
        previous: string | null;
        results: Goal[];
    }>({
        endpoint: getApiUrl(API_ENDPOINTS.GOAL_GETTER),
        queryKey: ["goalgetter-goals"],
        enabled: true,
        refetchInterval: 10000
    });

    const goals = (data?.results ?? []).filter(g => g.status === "active");
    const achievements = (data?.results ?? []).filter(
        g => g.status === "completed" || g.status === "achieved"
    );

    // EDIT logic
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const editMutation = useMutation({
        mutationFn: async (payload: { id: string; title: string }) => {
            return await makeAuthenticatedCall({
                endpoint: getApiUrl(`${API_ENDPOINTS.GOAL_GETTER}${payload.id}/`),
                method: "PATCH",
                body: JSON.stringify({ title: payload.title }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goalgetter-goals"] });
            setEditingGoal(null);
        },
    });

    // DELETE logic
    const deleteMutation = useMutation({
        mutationFn: async (goalId: string) => {
            return await makeAuthenticatedCall({
                endpoint: getApiUrl(`${API_ENDPOINTS.GOAL_GETTER}${goalId}/`),
                method: "DELETE"
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goalgetter-goals"] });
        },
    });

    return (
        <div className="p-0 bg-transparent rounded-xl">
            {/* Edit Modal */}
            <EditGoalModal
                open={!!editingGoal}
                onClose={() => setEditingGoal(null)}
                goal={editingGoal}
                onSave={title => {
                    if (editingGoal) editMutation.mutate({ id: editingGoal.id, title });
                }}
                isLoading={editMutation.isPending}
            />

            <Card className="shadow-none">
                <CardContent className="px-10 py-0">
                    <Tabs defaultValue="goals" className="">
                        <TabsList className="w-full flex rounded-md bg-muted mb-5 px-1 py-0 h-11">
                            <TabsTrigger value="goals" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[color:var(--primary)] data-[state=active]:shadow-sm h-10 font-semibold text-base rounded-l-md flex items-center justify-center">
                                <Target className="w-5 h-5 mr-2" /> My Goals
                            </TabsTrigger>
                            <TabsTrigger value="achievements" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[color:var(--status-warning-text)] data-[state=active]:shadow-sm h-10 font-semibold text-base rounded-r-md flex items-center justify-center">
                                <Trophy className="w-5 h-5 mr-2 text-[color:var(--status-warning-text)]" /> Achievement
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="goals">
                            <div className="space-y-5">
                                {isLoading ? (
                                    <div className="text-center py-10">
                                        <p>Loading goals...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-10 text-red-500">
                                        {error.message || String(error)}
                                    </div>
                                ) : goals.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p className="font-medium">No goals set yet</p>
                                        <p className="text-sm">Create your first savings goal to get started!</p>
                                    </div>
                                ) : (
                                    goals.map(goal => {
                                        const progress = Math.round(goal.percent_completed);
                                        const status = getStatusPill(progress);
                                        return (
                                            <div
                                                key={goal.id}
                                                className="bg-background rounded-md border px-6 py-5 flex items-center justify-between shadow-sm"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-[15px] mb-1">{goal.title}</div>
                                                    <div className="text-xs text-[color:var(--muted-foreground)] mb-3">
                                                        {goal.description}
                                                    </div>
                                                    {/* Progress bar */}
                                                    <div className="w-full bg-[color:var(--muted)] rounded-full h-[7px] mt-2 mb-2">
                                                        <div
                                                            className="h-[7px] rounded-full transition-all"
                                                            style={{
                                                                width: `${progress}%`,
                                                                background: "var(--primary)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Right side */}
                                                <div className="flex flex-col items-end min-w-[125px] ml-3 space-y-2">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="text-[color:var(--status-success)] font-semibold text-[15px]">
                                                            {formatNaira(goal.target_amount)}
                                                        </span>
                                                        <span
                                                            className={`font-semibold text-xs px-3 py-1 rounded-lg min-w-[46px] text-center ${status.bg} ${status.color}`}
                                                        >
                                                            {progress}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="font-semibold">
                                                            {getTimeLeft(goal.time_remaining)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => setEditingGoal(goal)}
                                                            disabled={editMutation.isPending || deleteMutation.isPending}
                                                        >
                                                            <Edit className="w-4 h-4 text-[color:var(--muted-foreground)]" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => deleteMutation.mutate(goal.id)}
                                                            disabled={editMutation.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-[color:var(--destructive)]" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="achievements">
                            <div className="space-y-5">
                                {isLoading ? (
                                    <div className="text-center py-10">
                                        <p>Loading achievements...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-10 text-red-500">
                                        {error.message || String(error)}
                                    </div>
                                ) : achievements.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p className="font-medium">No achievements yet</p>
                                        <p className="text-sm">Complete goals to unlock achievements!</p>
                                    </div>
                                ) : (
                                    achievements.map(goal => (
                                        <div
                                            key={goal.id}
                                            className="bg-[color:var(--card)] rounded-md border px-6 py-5 flex items-center justify-between shadow-sm"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-[15px] mb-1">{goal.title}</div>
                                                <div className="text-xs text-[color:var(--muted-foreground)] mb-3">
                                                    {goal.description}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {goal.achieved_at
                                                            ? new Date(goal.achieved_at).toLocaleDateString()
                                                            : "Completed"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end min-w-[120px] ml-3 space-y-2">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className="text-[color:var(--status-success)] font-semibold text-[15px]">
                                                        {formatNaira(goal.target_amount)}
                                                    </span>
                                                    <span
                                                        className="font-semibold text-xs px-3 py-1 rounded-lg"
                                                        style={{
                                                            minWidth: 46,
                                                            textAlign: "center",
                                                            background: "var(--status-success-bg)",
                                                            color: "var(--status-success-text)",
                                                        }}
                                                    >
                                                        100%
                                                    </span>
                                                </div>
                                                <Trophy className="w-7 h-7 text-[color:var(--status-warning-text)] my-1" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default KidGoalsList;