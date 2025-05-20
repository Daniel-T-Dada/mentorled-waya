"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SignInForm from '@/components/auth/signin-form';
import { toast } from 'sonner';

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for redirect messages
        const error = searchParams.get('error');
        const redirectMsg = searchParams.get('message');

        if (error) {
            toast.error('Error', { description: error });
        }

        if (redirectMsg) {
            toast.info('Info', { description: redirectMsg });
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <SignInForm />
        </div>
    );
} 