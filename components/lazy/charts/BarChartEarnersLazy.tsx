'use client'

import { Suspense, lazy } from 'react';
import BarChartEarnersSkeleton from '../skeletons/BarChartEarnersSkeleton';

const BarChartEarners = lazy(() => import('../../dashboard/parent/barchart/BarChartEarners'));

const BarChartEarnersLazy = () => {
    return (
        <Suspense fallback={<BarChartEarnersSkeleton />}>
            <BarChartEarners />
        </Suspense>
    );
};

export default BarChartEarnersLazy;
