'use client'

import { lazy, Suspense } from 'react';
import AppPieChartSkeleton from '../skeletons/AppPieChartSkeleton';

// Lazy load the AppPieChart component
const AppPieChart = lazy(() => import('../../dashboard/AppPieChart'));

interface AppPieChartProps {
    refreshTrigger?: number;
}

const AppPieChartLazy = ({ refreshTrigger }: AppPieChartProps = {}) => {
    return (
        <Suspense fallback={<AppPieChartSkeleton />}>
            <AppPieChart refreshTrigger={refreshTrigger} />
        </Suspense>
    );
};

export default AppPieChartLazy;
