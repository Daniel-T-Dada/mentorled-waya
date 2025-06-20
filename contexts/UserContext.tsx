"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface User {
    id: string
    name: string
    email: string
    role: string
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

    return (
        <UserContext.Provider value={{
            user: session?.user ? {
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
            } : null,
            isLoading: status === "loading",
            isKidSession,
            isParentSession,
        }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext) 