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

const RewardSettingItem = ({ title, description, defaultChecked = true }: {
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

const AppRewardSettings = () => {
    return (
        <div className="w-full mx-auto">
            <Card className="mb-6 bg-background">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Reward Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <RewardSettingItem
                        title="Auto Approve Rewards"
                        description="Automatically approve rewards when a kid redeems them."
                    />
                    <RewardSettingItem
                        title="Reward Notifications"
                        description="Notify when a reward is available or has been earned."
                    />
                    <RewardSettingItem
                        title="Reward Expiry"
                        description="Set rewards to expire after a certain time period."
                    />
                    <RewardSettingItem
                        title="Weekly Reward Summary"
                        description="Send a weekly summary of all rewards earned and redeemed."
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

export default AppRewardSettings
