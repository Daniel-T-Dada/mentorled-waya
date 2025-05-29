"use client"

// import { cn } from "@/lib/utils"

interface HeaderProps {
    label: string;
}

const Header = ({ label }: HeaderProps) => {
    return (
        <div className="flex items-center flex-col  justify-center w-full">
            {/* <h1 className={cn("text-xl font-semibold tracking-tight")}>Waya</h1> */}

            <p className="text-muted-foreground text-xs sm:text-sm">
                {label}
            </p>
        </div>
    )
}

export default Header
