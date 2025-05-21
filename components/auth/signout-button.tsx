'use client'

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

export const SignOutButton = ({
    variant = "default",
    size = "default",
    className
}: SignOutButtonProps) => {
    const handleSignOut = async () => {
        try {
            await signOut({
                redirect: true,
                callbackUrl: "/"
            })
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleSignOut}
        >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
        </Button>
    )
} 