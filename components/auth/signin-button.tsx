'use client'

import { useRouter } from "next/navigation"

interface SignInButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect",
    asChild?: boolean
}

export const SignInButton = ({
    children,
    mode = "redirect",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asChild
}: SignInButtonProps) => {
    const router = useRouter()
    const onClick = () => {
        router.push("/auth/signin")
    }

    if (mode === "modal"){
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
