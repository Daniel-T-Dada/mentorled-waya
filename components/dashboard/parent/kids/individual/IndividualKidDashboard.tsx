'use client'

import { useRouter } from "next/navigation";
import { useIndividualKidData } from './useIndividualKidData';
import { KidDashboardHeader } from './KidDashboardHeader';
import { KidProgressOverview } from './KidProgressOverview';
import { KidQuickActions } from './KidQuickActions';
import { KidDashboardMain } from './KidDashboardMain';
import { KidDashboardLoading } from './KidDashboardLoading';
import { KidDashboardError } from './KidDashboardError';
import type { IndividualKidDashboardProps } from './types';

export const IndividualKidDashboard = ({ kidId }: IndividualKidDashboardProps) => {
    const router = useRouter();
    const { kid, loading, error, stats } = useIndividualKidData(kidId);

    const handleBack = () => {
        router.push('/dashboard/parents/kids');
    };

    const handleProfileClick = () => {
        router.push(`/dashboard/parents/kids/${kidId}/profile`);
    };

    if (loading) {
        return <KidDashboardLoading />;
    }

    if (error || !kid) {
        return (
            <KidDashboardError
                message={error || "The kid you're looking for doesn't exist."}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <KidDashboardHeader
                kid={kid}
                onBack={handleBack}
                onProfileClick={handleProfileClick}
            />

            {/* Progress Card */}
            <KidProgressOverview kid={kid} stats={stats} />

            {/* Quick Actions */}
            <KidQuickActions kidId={kidId} />

            {/* Main Dashboard Content */}
            <KidDashboardMain kidId={kidId} />
        </div>
    );
};
