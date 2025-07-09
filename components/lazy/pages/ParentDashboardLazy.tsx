'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ParentDashboardSkeleton from './skeletons/ParentDashboardSkeleton';

// Lazy load the ParentDashboardOverview component
const ParentDashboardOverview = dynamic(
    () => import('@/components/dashboard/parent/ParentDashboardOverview'),
    {
        loading: () => <ParentDashboardSkeleton />,
        ssr: false
    }
);

interface ParentDashboardLazyProps {
    onCreateKidClick?: () => void;
    refreshTrigger?: number;
}

export const ParentDashboardLazy = ({ onCreateKidClick, refreshTrigger }: ParentDashboardLazyProps) => {
    return (
        <Suspense fallback={<ParentDashboardSkeleton />}>
            <ParentDashboardOverview
                onCreateKidClick={onCreateKidClick}
                refreshTrigger={refreshTrigger}
            />
        </Suspense>
    );
};

ParentDashboardLazy.displayName = 'ParentDashboardLazy';

export default ParentDashboardLazy;
