'use client'

import AppAccountSettings from "../AppAccountSettings"
import AppNotificationSettings from "../AppNotificationSettings"
import AppRewardSettings from "../AppRewardSettings"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

interface SettingsDashboardProps {
    accountSettings?: React.ReactNode;
    notificationSettings?: React.ReactNode;
    rewardSettings?: React.ReactNode;
}

const SettingsCardSkeleton = () => {
    return (
        <div className="mb-6">
            <div className="border rounded-lg">
                <div className="p-6 border-b">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6">
                    <div className="border rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1.5">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Skeleton className="h-4 w-28 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-center">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const AccountSettingsSkeleton = () => {
    return (
        <div className="w-full mx-auto space-y-6">
            {/* Profile Settings Card */}
            <SettingsCardSkeleton />

            {/* Kid's Account Settings Card */}
            <SettingsCardSkeleton />

            {/* Password Reset Settings Card */}
            <SettingsCardSkeleton />
        </div>
    )
}

const SettingsPageSkeleton = () => {
    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />

            <div className="mt-8">
                {/* Tabs */}
                <div className="gap-8 mb-8">
                    <div className="grid w-full grid-cols-3 h-10 mb-8">
                        <Skeleton className="h-full rounded-l-md" />
                        <Skeleton className="h-full" />
                        <Skeleton className="h-full rounded-r-md" />
                    </div>

                    {/* Tab Content - showing account settings skeleton as default */}
                    <AccountSettingsSkeleton />
                </div>
            </div>
        </div>
    )
}

const SettingsDashboard = ({
    accountSettings = <AppAccountSettings />,
    notificationSettings = <AppNotificationSettings />,
    rewardSettings = <AppRewardSettings />
}: SettingsDashboardProps) => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return <SettingsPageSkeleton />
    }

    return (
        <main>
            <div className="mb-6 flex flex-col items-start justify-between">
                <h2 className="text-xl font-semibold">Settings</h2>
                <p className="text-sm text-gray-500">Manage your account</p>
            </div>

            <div>
                <Tabs defaultValue="account" className="gap-8 mb-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="account">Account Settings</TabsTrigger>
                        <TabsTrigger value="notification">Notification Settings</TabsTrigger>
                        <TabsTrigger value="reward">Reward Setting</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account">
                        {accountSettings}
                    </TabsContent>

                    <TabsContent value="notification">
                        {notificationSettings}
                    </TabsContent>

                    <TabsContent value="reward">
                        {rewardSettings}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
export default SettingsDashboard