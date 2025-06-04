import type { Kid } from '@/lib/services/mockDataService';

export interface IndividualKidStats {
    completedChores: number;
    pendingChores: number;
    progress: number;
}

export interface KidDashboardHeaderProps {
    kid: Kid;
    onBack: () => void;
    onProfileClick: () => void;
}

export interface KidProgressOverviewProps {
    kid: Kid;
    stats: IndividualKidStats;
}

export interface KidQuickActionsProps {
    kidId: string;
}

export interface KidDashboardMainProps {
    kidId: string;
}

export interface IndividualKidDashboardProps {
    kidId: string;
}
