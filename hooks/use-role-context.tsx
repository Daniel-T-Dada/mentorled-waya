"use client";

import { useUser } from "@/contexts/UserContext";
import { useKid } from "@/contexts/KidContext";

export function useRoleContext() {
    const { user, isLoading, isKidSession, isParentSession } = useUser();
    const {
        kids,
        isLoadingKids,
        activeKid,
        currentKid,
        setActiveKid,
        refreshKids
    } = useKid();

    return {
        // User info
        user,
        isLoading,

        // Role identification
        isKidSession,
        isParentSession,

        // Kid management (for parents)
        kids,
        isLoadingKids,
        refreshKids,

        // Active kid (parent viewing kid's perspective)
        activeKid,
        setActiveKid,

        // Current kid (when kid is logged in)
        currentKid,

        // Helper functions
        isParentUser: () => user?.role === 'parent' && !isKidSession,
        isKidUser: () => isKidSession && currentKid !== null,
        hasKids: () => kids.length > 0,
        getKidById: (id: string) => kids.find(kid => kid.id === id),

        // Context switching helpers
        switchToParentView: () => setActiveKid(null),
        switchToKidView: (kid: any) => setActiveKid(kid),
    };
}

// Specialized hooks for common patterns
export function useParentContext() {
    const context = useRoleContext();

    if (!context.isParentUser()) {
        throw new Error('useParentContext can only be used in parent context');
    }

    return context;
}

export function useKidSessionContext() {
    const context = useRoleContext();

    if (!context.isKidUser()) {
        throw new Error('useKidSessionContext can only be used when kid is logged in');
    }

    return {
        ...context,
        kid: context.currentKid!,
    };
}
