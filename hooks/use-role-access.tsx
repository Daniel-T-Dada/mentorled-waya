"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Extended user interface to include role property
interface ExtendedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    avatar?: string | null;
    emailVerified?: Date | null;
    parentId?: string;
}

interface ExtendedSession {
    user: ExtendedUser;
}

interface UseRoleAccessReturn {
    userRole: string | undefined;
    isLoading: boolean;
    isParent: boolean;
    isKid: boolean;
    canAccessRoute: (route: string) => boolean;
}

/**
 * Hook to manage role-based access control
 */
export function useRoleAccess(): UseRoleAccessReturn {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const userRole = (session as ExtendedSession)?.user?.role;
    const isLoading = status === "loading";
    const isParent = userRole === "parent";
    const isKid = userRole === "kid";

    /**
     * Check if user can access a specific route based on their role
     */
    const canAccessRoute = (route: string): boolean => {
        if (!userRole) return false;

        // Kids can only access kid routes
        if (isKid) {
            return route.startsWith('/dashboard/kids');
        }
        // Parents can access parent routes
        if (isParent) {
            return route.startsWith('/dashboard/parents');
        }

        return false;
    };

    /**
     * Redirect user if they're trying to access unauthorized routes
     */
    useEffect(() => {
        if (!isLoading && userRole && pathname) {
            if (!canAccessRoute(pathname)) {
                const redirectRoute = isKid ? '/dashboard/kids' : '/dashboard/parents';
                console.log(`Unauthorized access attempt to ${pathname}, redirecting to ${redirectRoute}`);
                router.replace(redirectRoute);
            }
        }
    }, [isLoading, userRole, pathname, router, isKid, canAccessRoute]); return {
        userRole,
        isLoading,
        isParent,
        isKid,
        canAccessRoute,
    };
}
