'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function PWADiagnostics() {
    const [diagnostics, setDiagnostics] = useState<any>({})
    const [isLoading, setIsLoading] = useState(false)

    const runDiagnostics = async () => {
        setIsLoading(true)
        const results: any = {}

        try {
            // Check PWA installation status
            results.isInstalled = window.matchMedia('(display-mode: standalone)').matches
            
            // Check service worker status
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations()
                results.serviceWorker = {
                    registered: registrations.length > 0,
                    count: registrations.length,
                    active: registrations.some(reg => reg.active),
                    scope: registrations.map(reg => reg.scope)
                }
            } else {
                results.serviceWorker = { supported: false }
            }

            // Check cache status
            if ('caches' in window) {
                const cacheNames = await caches.keys()
                results.caches = {
                    available: true,
                    names: cacheNames,
                    count: cacheNames.length
                }
            } else {
                results.caches = { available: false }
            }

            // Check storage
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate()
                results.storage = {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    available: estimate.quota ? estimate.quota - (estimate.usage || 0) : 0
                }
            }

            // Check local storage
            results.localStorage = {
                available: typeof Storage !== 'undefined',
                items: localStorage ? Object.keys(localStorage).length : 0,
                authProvider: localStorage ? localStorage.getItem('auth-provider') : null
            }

            // Check session storage
            results.sessionStorage = {
                available: typeof Storage !== 'undefined',
                items: sessionStorage ? Object.keys(sessionStorage).length : 0
            }

            // Check cookies
            results.cookies = {
                available: navigator.cookieEnabled,
                count: document.cookie.split(';').filter(c => c.trim()).length,
                authCookies: document.cookie.split(';').filter(c => 
                    c.includes('next-auth') || c.includes('auth') || c.includes('session')
                ).length
            }

            // Check network status
            results.network = {
                online: navigator.onLine,
                connection: (navigator as any).connection ? {
                    effectiveType: (navigator as any).connection.effectiveType,
                    downlink: (navigator as any).connection.downlink,
                    rtt: (navigator as any).connection.rtt
                } : null
            }

            setDiagnostics(results)
        } catch (error) {
            console.error('Diagnostics error:', error)
            results.error = error?.toString()
            setDiagnostics(results)
        } finally {
            setIsLoading(false)
        }
    }

    const clearAllData = async () => {
        try {
            // Clear service worker registrations
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations()
                await Promise.all(registrations.map(reg => reg.unregister()))
            }

            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys()
                await Promise.all(cacheNames.map(name => caches.delete(name)))
            }

            // Clear storage
            localStorage.clear()
            sessionStorage.clear()

            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=")
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
            })

            alert('All data cleared! Please refresh the page.')
            window.location.reload()
        } catch (error) {
            console.error('Clear data error:', error)
            alert('Error clearing data: ' + error)
        }
    }

    useEffect(() => {
        runDiagnostics()
    }, [])

    const getStatusIcon = (status: boolean) => {
        return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
    }

    return (
        <div className="space-y-6 p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        PWA Diagnostics
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={runDiagnostics}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearAllData}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All Data
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* PWA Status */}
                    <div className="flex items-center justify-between">
                        <span>PWA Installed</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostics.isInstalled)}
                            <Badge variant={diagnostics.isInstalled ? "default" : "secondary"}>
                                {diagnostics.isInstalled ? "Yes" : "No"}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Service Worker */}
                    {diagnostics.serviceWorker && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Service Worker</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.serviceWorker.registered)}
                                    <Badge variant={diagnostics.serviceWorker.registered ? "default" : "secondary"}>
                                        {diagnostics.serviceWorker.registered ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                            {diagnostics.serviceWorker.scope && (
                                <div className="text-sm text-muted-foreground ml-4">
                                    Scope: {diagnostics.serviceWorker.scope.join(', ')}
                                </div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Cache Status */}
                    {diagnostics.caches && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Cache Storage</span>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(diagnostics.caches.available && diagnostics.caches.count > 0)}
                                    <Badge variant="outline">{diagnostics.caches.count || 0} caches</Badge>
                                </div>
                            </div>
                            {diagnostics.caches.names && diagnostics.caches.names.length > 0 && (
                                <div className="text-sm text-muted-foreground ml-4">
                                    {diagnostics.caches.names.join(', ')}
                                </div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Storage */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span>Local Storage</span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(diagnostics.localStorage?.available)}
                                <Badge variant="outline">{diagnostics.localStorage?.items || 0} items</Badge>
                            </div>
                        </div>
                        {diagnostics.localStorage?.authProvider && (
                            <div className="text-sm text-muted-foreground ml-4">
                                Auth Provider: {diagnostics.localStorage.authProvider}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Cookies */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span>Cookies</span>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(diagnostics.cookies?.available)}
                                <Badge variant="outline">{diagnostics.cookies?.count || 0} total</Badge>
                                <Badge variant="outline">{diagnostics.cookies?.authCookies || 0} auth</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Network */}
                    <div className="flex items-center justify-between">
                        <span>Network Status</span>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostics.network?.online)}
                            <Badge variant={diagnostics.network?.online ? "default" : "destructive"}>
                                {diagnostics.network?.online ? "Online" : "Offline"}
                            </Badge>
                        </div>
                    </div>

                    {diagnostics.error && (
                        <>
                            <Separator />
                            <div className="p-3 bg-destructive/10 rounded-md">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Error</span>
                                </div>
                                <div className="text-sm mt-1">{diagnostics.error}</div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
