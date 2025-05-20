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
}

const CardWrapper = ({
    children,
    headerLabel,
    titleLabel,
    backButtonLabel,
    backButtonHref,
    showSocial
}: CardWrapperProps) => {
    const { theme } = useTheme()

    return (
        <Card className="w-[450px] max-w-md mx-auto p-6">
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
                <div className="flex flex-col mt-8">
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
        </Card>
    )
}

export default CardWrapper
