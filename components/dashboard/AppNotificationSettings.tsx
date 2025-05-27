'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

const NotificationItem = ({ title, description, defaultChecked = true }: {
    title: string;
    description: string;
    defaultChecked?: boolean
}) => {
    const [enabled, setEnabled] = useState(defaultChecked)

    return (
        <Card className="mb-4">
            <CardContent className="p-6 flex justify-between items-center">
                <div>
                    <h3 className="font-medium text-base mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    className="data-[state=checked]:bg-primary"
                />
            </CardContent>
        </Card>
    )
}

const AppNotificationSettings = () => {
    return (
        <div className="w-full mx-auto">
            <Card className="mb-6 bg-background">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <NotificationItem
                        title="Chore Completion"
                        description="Notify when a kid completes a chore."
                    />
                    <NotificationItem
                        title="Reward Redemption"
                        description="Notify when kids redeems rewards"
                    />
                    <NotificationItem
                        title="Chore Reminder"
                        description="Notify kids when a new chore has been created and when a chore is almost due."
                    />
                    <NotificationItem
                        title="Weekly Summary"
                        description="Notify all chore, task and reward for the week."
                        defaultChecked={false}
                    />
                    <div className="flex justify-center mt-4">
                        <Button className="bg-primary hover:bg-primary/80">Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AppNotificationSettings