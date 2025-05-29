'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Header from "./header";
import Social from "./socials";
import BackButton from "./back-button";
import Image from "next/image"
import { useTheme } from "next-themes"
import Title from "./title";

interface CardWrapperProps {
    children: React.ReactNode
    headerLabel: string;
    titleLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;
    className?: string;
}

const CardWrapper = ({
    children,
    headerLabel,
    titleLabel,
    backButtonLabel,
    backButtonHref,
    showSocial,
    className
}: CardWrapperProps) => {
    const { theme } = useTheme()

    return (
        <Card className={className || "w-[320px] sm:w-[450px] md:w-[600px] lg:w-[700px] max-w-md mx-auto sm:p-4"}>
            <CardHeader>
                <div className="flex flex-col items-center gap-4">
                
                    <Image
                        src={theme === 'dark' ? "/Logo/White.svg" : "/Logo/Purple.svg"}
                        alt="Waya Logo"
                        width={120}
                        height={120}
                    />
                    <Header label={headerLabel} />
                </div>
                <div className="flex flex-col mt-4">
                    <Title label={titleLabel} />
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {showSocial && (
                <CardFooter>
                    <Social />
                </CardFooter>
            )}
            <CardFooter>
                <BackButton
                    label={backButtonLabel}
                    href={backButtonHref}
                />
            </CardFooter>
        </Card >
    )
}

export default CardWrapper
