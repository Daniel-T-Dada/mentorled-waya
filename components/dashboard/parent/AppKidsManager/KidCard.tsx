import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import KidsStatsGrid from "./KidsStatsGrid";
import KidsActionButtons from "./KidsActionButton";

// Types
interface Kid {
    id: string;
    username: string;
    firstName: string;
    displayName?: string;
    avatar?: string | null;
    level: number;
    balance: number;
    progress: number;
    completedChoreCount: number;
    pendingChoreCount: number;
}

interface KidCardProps {
    kid: Kid;
    onAssignChore: (kidId: string) => void;
    showActionButtons?: boolean;
    mobile?: boolean;
}

const KidCard = ({ kid, onAssignChore, showActionButtons }: KidCardProps) => {
    return (
        <div className="border rounded-md p-4 mb-6 bg-background">
            <div className="flex items-center gap-6">
                <Avatar className="w-12 h-12 xl:w-12 xl:h-12 md:w-16 md:h-16">
                    <AvatarImage src={kid.avatar ?? undefined} alt={kid.displayName || kid.username} />
                    <AvatarFallback>
                        {(kid.displayName || kid.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium leading-none text-base xl:text-base md:text-lg">
                                {kid.firstName}
                            </h3>
                            <p className="text-sm text-muted-foreground xl:text-sm md:text-base mt-1">
                                Level {kid.level}
                            </p>
                        </div>
                    </div>
                    <Progress value={kid.progress} className="w-full mt-2 md:mt-3 md:h-2" />
                </div>
            </div>

            {/* Stats Grid */}
            <KidsStatsGrid
                balance={kid.balance}
                completedChoreCount={kid.completedChoreCount}
                pendingChoreCount={kid.pendingChoreCount}
            />

            {/* Action Buttons */}
            {showActionButtons && (
                <KidsActionButtons
                    kidId={kid.id}
                    onAssignChore={onAssignChore}
                />
            )}
        </div>
    );
};

export default KidCard;