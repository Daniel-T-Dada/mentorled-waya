'use client'

import { Suspense, lazy } from 'react';
import KidBarChartSkeleton from '../skeletons/KidBarChartSkeleton';

const KidBarChart = lazy(() => import('../../dashboard/kid/KidBarChart'));

interface KidBarChartLazyProps {
    kidId?: string;
}

const KidBarChartLazy = ({ kidId }: KidBarChartLazyProps) => {
    return (
        <Suspense fallback={<KidBarChartSkeleton />}>
            <KidBarChart kidId={kidId} />
        </Suspense>
    );
};

export default KidBarChartLazy;
