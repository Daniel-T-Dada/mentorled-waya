"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"
import { useSession } from "next-auth/react"

interface User {
    id: string
    name: string
    email: string
    role: string
    firstName?: string;
    avatar?: string | null
    emailVerified?: Date | null
    parentId?: string

    // Kid-specific fields
    childId?: string
    childUsername?: string
    isChild?: boolean
    accessToken?: string
    refreshToken?: string
}

interface UserContextType {
    user: User | null
    isLoading: boolean

    // Kid session helpers
    isKidSession: boolean
    isParentSession: boolean
}

const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    isKidSession: false,
    isParentSession: false,
})

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()

    const isKidSession = session?.user?.isChild === true
    const isParentSession = session?.user?.role === 'parent' && !isKidSession

    // Memoize the user object to prevent unnecessary re-renders
    const user = useMemo(() => {
        if (!session?.user) return null;

        return {
            id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role,
            avatar: session.user.avatar,
            emailVerified: session.user.emailVerified,
            parentId: session.user.parentId,

            // Kid-specific fields
            childId: session.user.childId,
            childUsername: session.user.childUsername,
            isChild: session.user.isChild,
            accessToken: session.user.accessToken,
            refreshToken: session.user.refreshToken,
        };
    }, [session?.user]);

    // Memoize the context value to prevent re-renders when props haven't changed
    const contextValue = useMemo(() => ({
        user,
        isLoading: status === "loading",
        isKidSession,
        isParentSession,
    }), [user, status, isKidSession, isParentSession]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)

// Context selector hooks for granular subscriptions
export const useUserProfile = () => {
    const { user } = useUser();
    return useMemo(() => user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
    } : null, [user]);
};

export const useUserRole = () => {
    const { user, isKidSession, isParentSession } = useUser();
    return useMemo(() => ({
        role: user?.role,
        isKidSession,
        isParentSession,
    }), [user?.role, isKidSession, isParentSession]);
};

export const useUserAuth = () => {
    const { user, isLoading } = useUser();
    return useMemo(() => ({
        isAuthenticated: !!user,
        isLoading,
        accessToken: user?.accessToken,
        refreshToken: user?.refreshToken,
    }), [user, isLoading]);
};

export const useKidSessionInfo = () => {
    const { user, isKidSession } = useUser();
    return useMemo(() => ({
        isKidSession,
        childId: user?.childId,
        childUsername: user?.childUsername,
        parentId: user?.parentId,
    }), [user?.childId, user?.childUsername, user?.parentId, isKidSession]);
}; 