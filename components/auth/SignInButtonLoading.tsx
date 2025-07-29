'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { SignInButton } from "./signin-button";

export const SignInButtonWithLoading = ({
    children,
    ...props
}: React.PropsWithChildren<object>) => {
    const [loading, setLoading] = useState(false);

    return (
        <SignInButton>
            <Button
                variant="outline"
                className="text-primary dark:text-foreground hover:bg-primary/10 border-primary font-semibold"
                disabled={loading}
                onClick={() => setLoading(true)}
                {...props}
            >
                {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                {children}
            </Button>
        </SignInButton>
    );
};