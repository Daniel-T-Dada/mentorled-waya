import type { Kid } from '@/contexts/KidContext';

export interface KidStats {
    completedChores: number;
    pendingChores: number;
    progress: number;
}

export interface KidWithStats extends Kid {
    stats: KidStats;
}

export interface KidsPageHeaderProps {
    onAddKid?: () => void;
}

export interface KidsEmptyStateProps {
    onAddKid?: () => void;
}

export interface KidCardProps {
    kid: Kid;
    completedChores: number;
    pendingChores: number;
    progress: number;
}

export interface KidStatsProps {
    completedChores: number;
    pendingChores: number;
    balance: number;
}

export interface KidProgressBarProps {
    progress: number;
}

export interface KidsGridProps {
    children: React.ReactNode;
}

export interface KidsManagementProps {
    onAddKid?: () => void;
}
