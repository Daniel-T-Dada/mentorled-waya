'use client'

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import KidStatCards from "./KidStatCards";
import KidGoalsList from "./KidGoalsList";
import CreateGoal from "@/components/modals/CreateGoal";


interface StatSummary {
    totalSaved: string;
    activeGoals: number;
    achievedGoals: number;

}

interface KidGoalGetterProps {
    kidId?: string;
    statSummary?: StatSummary;
    isCreateGoalOpen: boolean;
    onOpenCreateGoal: () => void;
    onSubmitCreateGoal: (goalData: any) => void;
    createGoalLoading?: boolean;
    createGoalError?: Error;
    onCloseCreateGoal: () => void;
}

const KidGoalGetter = ({
    kidId: propKidId,
    statSummary, 
    isCreateGoalOpen,
    onOpenCreateGoal,
    onSubmitCreateGoal,
    createGoalLoading,
    createGoalError,
    onCloseCreateGoal,
}: KidGoalGetterProps) => {
    const { data: session } = useSession();
    

    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId && !propKidId) {
        console.log(`KidGoalGetter - Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    }



    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div className="">
                    <h2 className="text-xl font-semibold">Goal Getter</h2>
                    <p className="text-muted-foreground">Set savings goals, track progress and achieve goals</p>
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onOpenCreateGoal}
                >
                    Create New Goal
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="mb-8">
                <KidStatCards kidId={kidId} section="goal-getter" summary={statSummary} />
            </div>

            {/* Goals List and Achievements */}
            <KidGoalsList />

            {/* Create Goal Modal */}
            <CreateGoal
                isOpen={isCreateGoalOpen}
                onClose={onCloseCreateGoal}
                onSubmit={onSubmitCreateGoal}
                isLoading={createGoalLoading}
                error={createGoalError}
                kidId={kidId}
            />
        </main>
    );
};

export default KidGoalGetter;
