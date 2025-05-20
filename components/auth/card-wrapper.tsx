'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Header from "./header";
import Social from "./socials";
import BackButton from "./back-button";

interface CardWrapperProps {
    children: React.ReactNode
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;

}

const CardWrapper = ({ 
    children, 
    headerLabel, 
    backButtonLabel, 
    backButtonHref, 
    showSocial
}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] max-w-md mx-auto p-6">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            {showSocial && (
                <CardFooter>
                    <Social/>
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
        