'use client'

import { useSearchParams } from 'next/navigation'
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const token = searchParams.get('token') || ''
    const uidb64 = searchParams.get('uidb64') || ''

    console.log('VerifyEmailPage received URL parameters:', { email, token, uidb64 })

    // if (!email || !token || !uidb64) {
    //     console.log('Missing required parameters in URL:', { email, token, uidb64 })
    //     return (
    //         <div className="flex flex-col items-center justify-center min-h-screen p-4">
    //             <div className="w-full max-w-md space-y-8">
    //                 <div className="text-center">
    //                     <h1 className="text-2xl font-bold text-red-600">Invalid Verification Link</h1>
    //                     <p className="mt-2 text-gray-600">
    //                         The verification link is missing required parameters. Please check your email for the correct verification link.
    //                     </p>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    <p className="mt-2 text-gray-600">
                        Please verify your email address to continue.
                    </p>
                </div>
                <VerifyEmailForm email={email} token={token} uidb64={uidb64} />
            </div>
        </div>
    )
}