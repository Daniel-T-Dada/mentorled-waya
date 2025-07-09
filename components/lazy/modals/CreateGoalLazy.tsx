import { lazy, Suspense } from 'react';
import { CreateGoalSkeleton } from '@/components/lazy/skeletons/CreateGoalSkeleton';

// Lazy load the CreateGoal component
const CreateGoalComponent = lazy(() =>
    import('@/components/modals/CreateGoal').then(module => ({
        default: module.CreateGoal
    }))
);

interface CreateGoalLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    kidId: string;
}

export function CreateGoalLazy({ isOpen, onClose, onSuccess, kidId }: CreateGoalLazyProps) {
    return (
        <Suspense fallback={<CreateGoalSkeleton isOpen={isOpen} onClose={onClose} />}>
            <CreateGoalComponent isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} kidId={kidId} />
        </Suspense>
    );
}
