"use client";

import VerifyEmailForm from "@/components/auth/verify-email-form";
import { useSearchParams } from "next/navigation";


export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const uidb64 = searchParams.get("uidb64");

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md p-6 bg-background text-foreground rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Verification Link</h1>
                    <p className="text-muted-foreground">
                        The verification link is invalid or has expired. Please try signing up again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <VerifyEmailForm
                email={email}
                token={token || ""}
                uidb64={uidb64 || ""}
            />
        </div>
    );
} 