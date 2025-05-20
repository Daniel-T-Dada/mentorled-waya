"use client"

import { cn } from "@/lib/utils"

interface TitleProps {
    label: string;
}

const Title = ({ label }: TitleProps) => {
    return (
        <div className="flex  flex-col  justify-start w-full">
            <h1 className={cn("text-xl font-semibold tracking-tight")}>{label}</h1>

        </div>
    )
}

export default Title
