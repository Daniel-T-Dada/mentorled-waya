import { lazy, Suspense } from 'react';
import { CreateChoreSkeleton } from '@/components/lazy/skeletons/CreateChoreSkeleton';

// Lazy load the CreateChore component
const CreateChoreComponent = lazy(() =>
    import('@/components/modals/CreateChore').then(module => ({
        default: module.CreateChore
    }))
);

interface CreateChoreLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    preSelectedKid?: string;
}

export function CreateChoreLazy({ isOpen, onClose, onSuccess, preSelectedKid }: CreateChoreLazyProps) {
    return (
        <Suspense fallback={<CreateChoreSkeleton isOpen={isOpen} onClose={onClose} />}>
            <CreateChoreComponent
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={onSuccess}
                preSelectedKid={preSelectedKid}
            />
        </Suspense>
    );
}
