import React from "react";
import KidCard from "./KidCard";



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
    created_at?: string;
    parent?: string;
}

interface KidsListProps {
    kids: Kid[];
    onAssignChore: (kidId: string) => void;
    mobile?: boolean;
}

const KidsList = ({ kids, onAssignChore, mobile }: KidsListProps) => {
    // For mobile, render all kids in a vertical list.
    // For desktop/tablet, render only the passed-in kids (already paginated for screen size).
    return (
        <div className={mobile ? "block" : "space-y-4"}>
            {kids.map((kid) => (
                <KidCard
                    key={kid.id}
                    kid={kid}
                    onAssignChore={onAssignChore}
                />
            ))}
        </div>
    );
};

export default KidsList;