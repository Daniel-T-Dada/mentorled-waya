'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import KidDashboardSkeleton from './skeletons/KidDashboardSkeleton';

// Lazy load the KidDashboardOverview component
const KidDashboardOverview = dynamic(
    () => import('@/components/dashboard/kid/KidDashboardOverview'),
    {
        loading: () => <KidDashboardSkeleton />,
        ssr: false
    }
);

// interface KidDashboardLazyProps {
//     kidId?: string;
//     refreshTrigger?: number;
// }

export const KidDashboardLazy = () => {
    return (
        <Suspense fallback={<KidDashboardSkeleton />}>
            <KidDashboardOverview
                // kidId={kidId}
                // refreshTrigger={refreshTrigger}
                
            />
        </Suspense>
    );
};

KidDashboardLazy.displayName = 'KidDashboardLazy';

export default KidDashboardLazy;
