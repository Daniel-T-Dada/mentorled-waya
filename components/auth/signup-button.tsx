'use client'

import { useRouter } from "next/navigation"

interface SignUpButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect",
    asChild?: boolean
}

export const SignUpButton = ({
    children,
    mode = "redirect",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asChild
}: SignUpButtonProps) => {
    const router = useRouter()
    const onClick = () => {
        router.push("/auth/signup")
    }

    if (mode === "modal") {
        return (
            <span className="cursor-pointer">
                TODO: Implement modal
            </span>
        )
    }
    return (
        <span className="cursor-pointer" onClick={onClick}>
            {children}
        </span>
    )
} 