'use client'

import PWADiagnostics from '@/components/PWADiagnostics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import { clearAllAuthData } from '@/lib/utils/auth-utils'
import { useState, useEffect } from 'react'

export default function DebugPage() {
    const { data: session } = useSession()
    const [authProvider, setAuthProvider] = useState<string>('Unknown')
    const [currentUrl, setCurrentUrl] = useState<string>('https://your-domain.com/debug')

    useEffect(() => {
        // Set client-side only values
        if (typeof window !== 'undefined') {
            setAuthProvider(localStorage.getItem('auth-provider') || 'Unknown')
            setCurrentUrl(`${window.location.origin}/debug`)
        }
    }, [])

    const handleClearAuthData = () => {
        clearAllAuthData()
        alert('Auth data cleared! Please refresh the page.')
        window.location.reload()
    }

    const handleForceSignOut = async () => {
        await signOut({ redirect: false })
        clearAllAuthData()
        alert('Signed out and cleared all data! Please refresh the page.')
        window.location.reload()
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">Debug & Diagnostics</h1>

            {/* Session Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Session</CardTitle>
                </CardHeader>
                <CardContent>
                    {session ? (
                        <div className="space-y-2">
                            <p><strong>User ID:</strong> {session.user?.id}</p>
                            <p><strong>Email:</strong> {session.user?.email}</p>
                            <p><strong>Name:</strong> {session.user?.name}</p>
                            <p><strong>Role:</strong> {session.user?.role}</p>
                            <p><strong>Provider:</strong> {authProvider}</p>
                        </div>
                    ) : (
                        <p>No active session</p>
                    )}

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleClearAuthData} variant="outline">
                            Clear Auth Data
                        </Button>
                        <Button onClick={handleForceSignOut} variant="destructive">
                            Force Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* PWA Diagnostics */}
            <PWADiagnostics />

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Common Issues & Solutions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">                    <div>
                    <h3 className="font-semibold">Issue: &quot;Configuration Error&quot; after switching providers</h3>
                    <p className="text-sm text-muted-foreground">
                        1. Click &quot;Clear All Data&quot; above<br />
                        2. Refresh the page<br />
                        3. Try signing in again
                    </p>
                </div>

                    <div>
                        <h3 className="font-semibold">Issue: Can&apos;t sign in after closing browser</h3>
                        <p className="text-sm text-muted-foreground">
                            1. Clear browser cache manually<br />
                            2. Use &quot;Force Sign Out&quot; button<br />
                            3. Try incognito/private mode
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">For Testers</h3>
                        <p className="text-sm text-muted-foreground">
                            Share this URL with testers who encounter issues:<br />                            <code className="bg-muted p-1 rounded">
                                {currentUrl}
                            </code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
