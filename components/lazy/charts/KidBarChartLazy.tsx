'use client'

import { Suspense, lazy } from 'react';
import KidBarChartSkeleton from '../skeletons/KidBarChartSkeleton';

const KidBarChart = lazy(() => import('../../dashboard/kid/KidBarChart'));

// interface KidBarChartLazyProps {
//     kidId?: string;
// }

const KidBarChartLazy = () => {
    return (
        <Suspense fallback={<KidBarChartSkeleton />}>
            <KidBarChart />
        </Suspense>
    );
};

export default KidBarChartLazy;
