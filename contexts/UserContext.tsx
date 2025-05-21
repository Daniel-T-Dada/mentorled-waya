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
}

interface UserContextType {
    user: User | null
    isLoading: boolean
}

const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
})

export function UserProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()

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
            } : null,
            isLoading: status === "loading"
        }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext) 