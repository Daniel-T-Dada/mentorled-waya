"use client"

import { cn } from "@/lib/utils"

interface HeaderProps {
    label: string;
}

const Header = ({ label }: HeaderProps) => {
    return (
        <div className="flex items-center flex-col gap-y-4 justify-center w-full">
            <h1 className={cn("text-2xl font-semibold tracking-tight")}>Waya</h1>

            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    )
}

export default Header
