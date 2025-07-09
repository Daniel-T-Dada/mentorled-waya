import { lazy, Suspense } from 'react';
import { CreateKidAccountSkeleton } from '@/components/lazy/skeletons/CreateKidAccountSkeleton';

// Lazy load the CreateKidAccount component
const CreateKidAccountComponent = lazy(() =>
    import('@/components/modals/CreateKidAccount').then(module => ({
        default: module.CreateKidAccount
    }))
);

interface CreateKidAccountLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (kidData: any) => void;
}

export function CreateKidAccountLazy({ isOpen, onClose, onSuccess }: CreateKidAccountLazyProps) {
    return (
        <Suspense fallback={<CreateKidAccountSkeleton isOpen={isOpen} onClose={onClose} />}>
            <CreateKidAccountComponent isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        </Suspense>
    );
}
