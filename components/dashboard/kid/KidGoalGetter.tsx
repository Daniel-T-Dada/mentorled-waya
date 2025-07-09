'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import KidStatCards from "./KidStatCards";
import KidGoalsList from "./KidGoalsList";
import { CreateGoalLazy as CreateGoal } from "@/components/lazy/modals/CreateGoalLazy";

interface KidGoalGetterProps {
    kidId?: string;
}

const KidGoalGetter = ({ kidId: propKidId }: KidGoalGetterProps) => {
    const { data: session } = useSession();
    const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId && !propKidId) {
        console.log(`KidGoalGetter - Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    }

    const handleCreateGoal = () => {
        setIsCreateGoalOpen(true);
    };

    const handleCreateGoalSuccess = () => {
        // Goal created successfully - the modal will close itself
        // The KidGoalsList component should automatically refresh
    };

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div className="">
                    <h2 className="text-xl font-semibold">Goal Getter</h2>
                    <p className="text-muted-foreground">Set savings goals, track progress and achieve goals</p>
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleCreateGoal}
                >
                    Create New Goal
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="mb-8">
                <KidStatCards kidId={kidId} section="goal-getter" />
            </div>

            {/* Goals List and Achievements */}
            <KidGoalsList kidId={kidId} />

            {/* Create Goal Modal */}
            <CreateGoal
                isOpen={isCreateGoalOpen}
                onClose={() => setIsCreateGoalOpen(false)}
                onSuccess={handleCreateGoalSuccess}
                kidId={kidId}
            />
        </main>
    );
};

export default KidGoalGetter;
