// Types for Kid Progress components

export interface ProgressData {
    weeklyProgress: WeeklyProgress[];
    categoryStats: CategoryStat[];
    streaks: {
        current: number;
        longest: number;
    };
    recentAchievements: Achievement[];
}

export interface WeeklyProgress {
    week: string;
    completed: number;
    assigned: number;
}

export interface CategoryStat {
    category: string;
    completed: number;
    total: number;
}

export interface Achievement {
    title: string;
    date: string;
    type: 'weekly' | 'streak' | 'special' | 'milestone';
}

export interface Badge {
    name: string;
    description: string;
    earned: boolean;
}

export interface KidProgressManagementProps {
    kidId: string;
}

export interface KidProgressHeaderProps {
    kid: {
        id: string;
        name: string;
        avatar?: string | null;
    };
    onBack: () => void;
}

export interface ProgressMetricsProps {
    kid: {
        progress: number;
        level: number;
    };
    completionRate: number;
    completedTasks: number;
    totalTasks: number;
    streaks: {
        current: number;
        longest: number;
    };
}

export interface ProgressTabsProps {
    progressData: ProgressData;
    kid: {
        name: string;
        progress: number;
        level: number;
    };
}

export interface ProgressErrorProps {
    onRetry: () => void;
}
