'use client'

import { useRouter } from 'next/navigation';
import { useKidProgressData } from './useKidProgressData';
import { KidProgressHeader } from './KidProgressHeader';
import { ProgressMetrics } from './ProgressMetrics';
import { ProgressTabs } from './ProgressTabs';
import { ProgressLoading } from './ProgressLoading';
import { ProgressError } from './ProgressError';
import type { KidProgressManagementProps } from './types';

export const KidProgressManagement = ({ kidId }: KidProgressManagementProps) => {
    const router = useRouter();
    const {
        kid,
        isLoading,
        error,
        progressData,
        completedTasks,
        totalTasks,
        completionRate,
        refetch
    } = useKidProgressData(kidId);

    if (isLoading) {
        return <ProgressLoading />;
    }

    if (error || !kid) {
        return <ProgressError onRetry={refetch} />;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <KidProgressHeader
                kid={kid}
                onBack={() => router.back()}
            />

            {/* Key Metrics */}
            <ProgressMetrics
                kid={kid}
                completionRate={completionRate}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
                streaks={progressData.streaks}
            />

            {/* Progress Analytics Tabs */}
            <ProgressTabs
                progressData={progressData}
                kid={kid}
            />
        </div>
    );
};
