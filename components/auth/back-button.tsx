"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link";

interface BackButtonProps {
    href: string;
    label: string;
};

const BackButton = ({
    href,
    label,
}: BackButtonProps) => {
    return (
        <Button
        variant={"link"}
        className="font-normal w-full dark:text-secondary-foreground"
        size="sm"
        asChild
        >
            <Link href={href}>
            {label}
            </Link>
        </Button>
    )
}
export default BackButton