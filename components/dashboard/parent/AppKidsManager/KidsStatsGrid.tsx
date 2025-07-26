import React from "react";
import { formatNaira } from "@/lib/utils/currency";

interface KidsStatsGridProps {
    balance: number;
    completedChoreCount: number;
    pendingChoreCount: number;
}

const KidsStatsGrid = ({
    balance,
    completedChoreCount,
    pendingChoreCount,
}: KidsStatsGridProps) => (
    <div className="grid grid-cols-3 gap-4 xl:gap-4 md:gap-6 mt-4 xl:mt-4 md:mt-6 text-center text-sm">
        <div className="flex flex-col items-center p-2 md:p-4 rounded-md bg-muted">
            <span className="font-semibold xl:text-base md:text-lg">{formatNaira(balance)}</span>
            <span className="text-xs text-muted-foreground xl:text-xs md:text-sm mt-1">Balance</span>
        </div>
        <div className="flex flex-col items-center p-2 md:p-4 rounded-md bg-muted">
            <span className="font-semibold xl:text-base md:text-lg">{completedChoreCount}</span>
            <span className="text-xs text-muted-foreground xl:text-xs md:text-sm mt-1">Completed</span>
        </div>
        <div className="flex flex-col items-center p-2 md:p-4 rounded-md bg-muted">
            <span className="font-semibold xl:text-base md:text-lg">{pendingChoreCount}</span>
            <span className="text-xs text-muted-foreground xl:text-xs md:text-sm mt-1">Pending</span>
        </div>
    </div>
);

export default KidsStatsGrid;