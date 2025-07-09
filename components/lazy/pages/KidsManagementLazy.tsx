'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import KidsManagementSkeleton from './skeletons/KidsManagementSkeleton';

// Lazy load the KidsManagement component
const KidsManagement = dynamic(
    () => import('@/components/dashboard/parent/kids').then(mod => ({ default: mod.KidsManagement })),
    {
        loading: () => <KidsManagementSkeleton />,
        ssr: false
    }
);

interface KidsManagementLazyProps {
    onAddKid?: () => void;
}

export const KidsManagementLazy = ({ onAddKid }: KidsManagementLazyProps) => {
    return (
        <Suspense fallback={<KidsManagementSkeleton />}>
            <KidsManagement onAddKid={onAddKid} />
        </Suspense>
    );
};

KidsManagementLazy.displayName = 'KidsManagementLazy';

export default KidsManagementLazy;
