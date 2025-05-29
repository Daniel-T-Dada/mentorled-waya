'use client';

import { Button } from "@/components/ui/button";

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="w-full max-w-md p-8 space-y-4 bg-background border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-primary">You are offline</h1>
                <p className="text-muted-foreground">
                    It looks like you&apos;re currently offline. Please check your internet connection and try again.
                </p>
                <div className="mt-6">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
} 