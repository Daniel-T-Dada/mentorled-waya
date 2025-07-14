'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface NotificationItemProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

const NotificationItem = ({ title, description, checked, onChange }: NotificationItemProps) => (
    <Card className="mb-4">
        <CardContent className="p-6 flex justify-between items-center">
            <div>
                <h3 className="font-medium text-base mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                className="data-[state=checked]:bg-primary"
            />
        </CardContent>
    </Card>
);


interface AppNotificationSettingsProps {
    settings: {
        chore_completion: boolean;
        reward_redemption: boolean;
        chore_reminder: boolean;
        weekly_summary: boolean;
    };
    loading: boolean;
    onChange: (name: string, value: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const AppNotificationSettings = ({ settings, loading, onChange, onSubmit }: AppNotificationSettingsProps) => {
    return (
        <div className="w-full mx-auto">
            <Card className="mb-6 bg-background">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <NotificationItem
                            title="Chore Completion"
                            description="Notify when a kid completes a chore."
                            checked={settings.chore_completion}
                            onChange={val => onChange('chore_completion', val)}
                        />
                        <NotificationItem
                            title="Reward Redemption"
                            description="Notify when kids redeems rewards"
                            checked={settings.reward_redemption}
                            onChange={val => onChange('reward_redemption', val)}
                        />
                        <NotificationItem
                            title="Chore Reminder"
                            description="Notify kids when a new chore has been created and when a chore is almost due."
                            checked={settings.chore_reminder}
                            onChange={val => onChange('chore_reminder', val)}
                        />
                        <NotificationItem
                            title="Weekly Summary"
                            description="Notify all chore, task and reward for the week."
                            checked={settings.weekly_summary}
                            onChange={val => onChange('weekly_summary', val)}
                        />
                        <div className="flex justify-center mt-4">
                            <Button
                                className="bg-primary hover:bg-primary/80"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppNotificationSettings