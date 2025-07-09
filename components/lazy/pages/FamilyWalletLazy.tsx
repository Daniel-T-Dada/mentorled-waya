'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import FamilyWalletSkeleton from './skeletons/FamilyWalletSkeleton';

// Lazy load the FamilyWalletDashboard component
const FamilyWalletDashboard = dynamic(
    () => import('@/components/dashboard/parent/FamilyWalletDashboard'),
    {
        loading: () => <FamilyWalletSkeleton />,
        ssr: false
    }
);

interface FamilyWalletLazyProps {
    onAddAllowanceClick?: () => void;
    onAddFundsClick?: () => void;
    refreshTrigger?: number;
}

export const FamilyWalletLazy = ({
    onAddAllowanceClick,
    onAddFundsClick,
    refreshTrigger
}: FamilyWalletLazyProps) => {
    return (
        <Suspense fallback={<FamilyWalletSkeleton />}>
            <FamilyWalletDashboard
                onAddAllowanceClick={onAddAllowanceClick}
                onAddFundsClick={onAddFundsClick}
                refreshTrigger={refreshTrigger}
            />
        </Suspense>
    );
};

FamilyWalletLazy.displayName = 'FamilyWalletLazy';

export default FamilyWalletLazy;
