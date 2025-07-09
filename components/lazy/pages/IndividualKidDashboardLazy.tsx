'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import IndividualKidSkeleton from './skeletons/IndividualKidSkeleton';

// Lazy load the IndividualKidDashboard component
const IndividualKidDashboard = dynamic(
    () => import('@/components/dashboard/parent/kids/individual').then(mod => ({ default: mod.IndividualKidDashboard })),
    {
        loading: () => <IndividualKidSkeleton />,
        ssr: false
    }
);

interface IndividualKidDashboardLazyProps {
    kidId: string;
}

export const IndividualKidDashboardLazy = ({ kidId }: IndividualKidDashboardLazyProps) => {
    return (
        <Suspense fallback={<IndividualKidSkeleton />}>
            <IndividualKidDashboard kidId={kidId} />
        </Suspense>
    );
};

IndividualKidDashboardLazy.displayName = 'IndividualKidDashboardLazy';

export default IndividualKidDashboardLazy;
