'use client'

import { useSearchParams } from 'next/navigation'
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const token = searchParams.get('token') || ''
    const uidb64 = searchParams.get('uidb64') || ''
    const verified = searchParams.get('verified') === '1'
    const { data: session } = useSession()
    const [verificationData, setVerificationData] = useState<{
        email: string;
        token: string;
        uidb64: string;
    } | null>(null)
    const [showHeader, setShowHeader] = useState(true)
    const [status, setStatus] = useState<string>("")

    console.log('VerifyEmailPage received URL parameters:', { email, token, uidb64 })

    // Handle verification data from query params first (highest priority)
    useEffect(() => {
        // If we have token and uidb64, prioritize them (user clicked email link)
        if (token && uidb64) {
            setVerificationData({
                email: email || '', // Email might be empty from email link
                token,
                uidb64
            })
            return
        }

        // If we only have email (from signup redirect), just wait for user to click email link
        if (email && !token && !uidb64) {
            setVerificationData({
                email,
                token: '',
                uidb64: ''
            })
            return
        }

        // Try to get verification data from user session if available
        if (session?.user && session.user.verification) {
            const verification = session.user.verification
            if (verification.token && verification.uidb64) {
                setVerificationData({
                    email: session.user.email as string,
                    token: verification.token,
                    uidb64: verification.uidb64
                })
                return
            }
        }
        // Keep existing verification data or set to null if no data is available
    }, [email, token, uidb64, session])

    // Hide header when user clicked email link (has token and uidb64) or when verified=1
    useEffect(() => {
        if (verified || (token && uidb64) || (verificationData?.token && verificationData?.uidb64)) {
            setShowHeader(false)
        } else {
            setShowHeader(true)
        }
    }, [token, uidb64, verificationData, verified])

    // Set status to 'success' if verified=1 in URL
    useEffect(() => {
        if (verified) {
            setStatus('success')
        }
    }, [verified])

    const hasVerificationParams = !!(email || token || uidb64 || verificationData)

    if (!hasVerificationParams) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Missing Verification Information</h1>
                        <p className="mt-2 text-gray-600">
                            The verification link is missing required parameters. Please check your email for the correct verification link.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-8">
                {showHeader && !verified && status !== "success" && (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Verify Your Email</h1>
                        <p className="mt-2 text-gray-600">
                            Please verify your email address to continue.
                        </p>
                    </div>
                )}
                <VerifyEmailForm
                    email={verificationData?.email || email}
                    token={verificationData?.token || token}
                    uidb64={verificationData?.uidb64 || uidb64}
                    onStatusChange={setStatus}
                    verified={verified}
                />
            </div>
        </div>
    )
}