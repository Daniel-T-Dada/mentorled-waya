'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
// Removed unused useState and Select imports

interface RewardSettingItemProps {
    title: string;
    description: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    input?: React.ReactNode;
    showSwitch?: boolean;
}

const RewardSettingItem = ({ title, description, checked, onCheckedChange, input, showSwitch = true }: RewardSettingItemProps) => {
    return (
        <Card className="mb-4">
            <CardContent className="p-6 flex justify-between items-center">
                <div>
                    <h3 className="font-medium text-base mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {input && <div className="mt-2">{input}</div>}
                </div>
                {showSwitch && (
                    <Switch
                        checked={checked}
                        onCheckedChange={onCheckedChange}
                        className="data-[state=checked]:bg-primary"
                    />
                )}
            </CardContent>
        </Card>
    );
};

interface AppRewardSettingsProps {
    rewardSettings: {
        reward_approval_required: boolean;
        max_daily_reward: number;
        allow_savings: boolean;
    };
    loading: boolean;
    success: boolean;
    onChange: (name: keyof AppRewardSettingsProps["rewardSettings"], value: boolean | number) => void;
    onSave: () => void;
}

const AppRewardSettings = ({ rewardSettings, loading, success, onChange, onSave }: AppRewardSettingsProps) => {
    return (
        <div className="w-full mx-auto">
            <Card className="mb-6 bg-background">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Reward Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <RewardSettingItem
                        title="Reward Approval"
                        description="Automatically approve rewards when a kid redeems them."
                        checked={!rewardSettings.reward_approval_required}
                        onCheckedChange={checked => onChange("reward_approval_required", !checked)}
                        showSwitch={true}
                        input={undefined}
                    />
                    <RewardSettingItem
                        title="Maximum Daily Reward"
                        description="Limit the maximum reward a kid can earn in a day."
                        input={
                            <input
                                type="number"
                                min={0}
                                className="border rounded px-2 py-1 w-32"
                                placeholder="Enter max reward"
                                value={rewardSettings.max_daily_reward}
                                onChange={e => onChange("max_daily_reward", Number(e.target.value))}
                                disabled={loading}
                            />
                        }
                        showSwitch={false}
                    />
                    <RewardSettingItem
                        title="Allow Child's Savings"
                        description="Allow kids to save reward for a bigger reward."
                        checked={rewardSettings.allow_savings}
                        onCheckedChange={checked => onChange("allow_savings", checked)}
                        showSwitch={true}
                        input={undefined}
                    />
                    <div className="flex justify-center mt-4">
                        <Button
                            className="bg-primary hover:bg-primary/80"
                            onClick={onSave}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : success ? "Saved!" : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AppRewardSettings
