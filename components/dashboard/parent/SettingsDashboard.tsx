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

const SettingsPageSkeleton = () => {
    return (
        <div className="w-full space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />

            <div className="mt-8">
                <Skeleton className="h-10 w-full mb-8" />

                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-6 w-1/4 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>

                    <Skeleton className="h-10 w-1/4 mx-auto" />
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
                <Tabs defaultValue="account" className="gap-6 mb-8">
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