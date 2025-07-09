"use client";

import { Suspense, lazy } from "react";
import { AddAllowanceSkeleton } from "../skeletons/AddAllowanceSkeleton";

// Lazy load the AddAllowance component
const AddAllowance = lazy(() =>
    import("@/components/modals/AddAllowance").then(module => ({
        default: module.AddAllowance
    }))
);

interface AddAllowanceLazyProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddAllowanceLazy({ isOpen, onClose, onSuccess }: AddAllowanceLazyProps) {
    return (
        <Suspense fallback={<AddAllowanceSkeleton isOpen={isOpen} onClose={onClose} />}>
            <AddAllowance isOpen={isOpen} onClose={onClose} onSuccess={onSuccess} />
        </Suspense>
    );
}
