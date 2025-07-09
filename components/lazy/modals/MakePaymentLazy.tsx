import { lazy, Suspense } from 'react';
import { MakePaymentSkeleton } from '@/components/lazy/skeletons/MakePaymentSkeleton';

// Lazy load the MakePayment component
const MakePaymentComponent = lazy(() =>
    import('@/components/modals/MakePayment').then(module => ({
        default: module.MakePayment
    }))
);

interface MakePaymentLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function MakePaymentLazy({ isOpen, onClose, onSuccess }: MakePaymentLazyProps) {
    return (
        <Suspense fallback={<MakePaymentSkeleton isOpen={isOpen} onClose={onClose} />}>
            <MakePaymentComponent isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        </Suspense>
    );
}
