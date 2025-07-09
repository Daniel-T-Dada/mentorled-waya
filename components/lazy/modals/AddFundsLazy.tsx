import { lazy, Suspense } from 'react';
import { AddFundsSkeleton } from '@/components/lazy/skeletons/AddFundsSkeleton';

// Lazy load the AddFunds component
const AddFundsComponent = lazy(() =>
    import('@/components/modals/AddFunds').then(module => ({
        default: module.AddFunds
    }))
);

interface AddFundsLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddFundsLazy({ isOpen, onClose, onSuccess }: AddFundsLazyProps) {
    return (
        <Suspense fallback={<AddFundsSkeleton isOpen={isOpen} onClose={onClose} />}>
            <AddFundsComponent isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        </Suspense>
    );
}
