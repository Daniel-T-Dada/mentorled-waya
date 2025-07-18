'use client'

import KidGoalGetter from "@/components/dashboard/kid/KidGoalGetter";
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useApiQuery } from '@/hooks/useApiQuery';
import { API_ENDPOINTS, getApiUrl } from '@/lib/utils/api';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";


const GoalGetterPage = () => {
    const queryClient = useQueryClient();
    const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
    const { makeAuthenticatedCall } = useAuthenticatedApi();

    // Fetch goal summary
    const { data: summary, error } = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.GOALGETTER_SUMMARY),
        queryKey: ['goalgetter-summary'],
        enabled: true
    });

    // Fetch goals list (optional, for refetch)
    const { refetch: refetchGoals } = useApiQuery({
        endpoint: getApiUrl(API_ENDPOINTS.GOAL_GETTER),
        queryKey: ['goalgetter-goals'],
        enabled: false // only when needed, e.g. after create

    });

    const createGoalMutation = useMutation({
        mutationFn: async (goalData: any) => {
            const res = await makeAuthenticatedCall({
                endpoint: API_ENDPOINTS.GOAL_GETTER,
                method: "POST",
                body: JSON.stringify(goalData)
                
            });
            if (!res.success) throw new Error(res.error ?? "Failed to create goal");
            return res.data;


        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goalgetter-summary'] });
            queryClient.invalidateQueries({ queryKey: ['goalgetter-goals'] });
            refetchGoals();
            setIsCreateGoalOpen(false);
        }
    });



    // Determine if we should show stats at all
    let statCardProps = {
        totalSaved: "0",
        activeGoals: 0,
        achievedGoals: 0,
        error: undefined as string | undefined
    };

    if (summary) {
        statCardProps = {
            totalSaved: summary.total_saved,
            activeGoals: summary.active_goals,
            achievedGoals: summary.achieved_goals,
            error: undefined
        };
    } else if (error && error.message && error.message.toLowerCase().includes('not found')) {
        // 404 error: just display empty stats, but do not render an error UI
        statCardProps.error = "No summary available yet.";
    } else if (error) {
        // Other errors: optionally show a message, but render the rest
        statCardProps.error = error.message;
    }

    const handleOpenCreateGoal = () => setIsCreateGoalOpen(true);

    // Handler to submit create goal
    const handleCreateGoal = (goalData: any) => {
        createGoalMutation.mutate(goalData);
    };
    return (
        <div>
            <KidGoalGetter
                statSummary={statCardProps}
                isCreateGoalOpen={isCreateGoalOpen}
                onOpenCreateGoal={handleOpenCreateGoal}
                onSubmitCreateGoal={handleCreateGoal}
                createGoalLoading={createGoalMutation.isPending}
                createGoalError={createGoalMutation.error as Error | undefined}
                onCloseCreateGoal={() => setIsCreateGoalOpen(false)}
            />
        </div>
    );
};

export default GoalGetterPage;