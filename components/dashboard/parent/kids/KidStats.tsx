import type { KidStatsProps } from './types';

export const KidStats = ({ completedChores, pendingChores, balance }: KidStatsProps) => {
    return (
        <div className="grid grid-cols-3 gap-4 text-center">
            <div>
                <div className="text-2xl font-bold text-green-600">{completedChores}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingChores}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-blue-600">NGN {balance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Balance</div>
            </div>
        </div>
    );
};
