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
    showActionButtons?: boolean;
    mobile?: boolean;
}


const KidsList = ({ kids, onAssignChore, showActionButtons = false, mobile = false }: KidsListProps) => (
    <div>
        {kids.map((kid) => (
            <KidCard
                key={kid.id}
                kid={kid}
                onAssignChore={onAssignChore}
                showActionButtons={showActionButtons}
                mobile={mobile}
            />
        ))}
    </div>
);
export default KidsList;