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
}

export const FamilyWalletLazy = ({
    onAddAllowanceClick,
    onAddFundsClick,
    onSetPinClick
}: FamilyWalletLazyProps & { onSetPinClick?: () => void }) => {
    return (
        <Suspense fallback={<FamilyWalletSkeleton />}>
            <FamilyWalletDashboard
                onAddAllowanceClick={onAddAllowanceClick}
                onAddFundsClick={onAddFundsClick}
                onSetPinClick={onSetPinClick}
            />
        </Suspense>
    );
};

FamilyWalletLazy.displayName = 'FamilyWalletLazy';

export default FamilyWalletLazy;
