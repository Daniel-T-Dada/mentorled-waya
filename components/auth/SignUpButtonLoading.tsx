'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { SignUpButton } from "./signup-button";

export const SignUpButtonWithLoading = ({
    children,
    ...props
}: React.PropsWithChildren<object>) => {
    const [loading, setLoading] = useState(false);

    return (
        <SignUpButton>
            <Button
                className="bg-primary dark:text-foreground hover:bg-primary/90 text-primary-foreground font-semibold mr-4"
                disabled={loading}
                onClick={() => setLoading(true)}
                {...props}
            >
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {children}
            </Button>
        </SignUpButton>
    );
};