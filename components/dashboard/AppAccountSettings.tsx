'use client'

import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"


interface SettingsCardProps {
    title: string
    children: React.ReactNode
}

const SettingsCard = ({ title, children }: SettingsCardProps) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-lg font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

interface AppAccountSettingsProps {
    passwordForm: {
        current_password: string;
        new_password: string;
        confirm_new_password: string;
    };
    passwordLoading: boolean;
    passwordSuccess: boolean;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordSubmit: (e: React.FormEvent) => void;
    formState: {
        full_name: string;
        email: string;
        avatar: string | File;
        username: string;
    };
    saving: boolean;
    success: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;

    // Kid account props
    kidFormState: {
        id: string;
        name: string;
        username: string;
        avatar: string | File;
    };
    kidSaving: boolean;
    kidSuccess: boolean;
    kidError: string | null;
    onKidChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKidSubmit: (e: React.FormEvent) => void;
    onKidDelete: () => void;
    childrenList: Array<{ id: string; name: string; username: string; }>;
    selectedChildId: string;
    onSelectChild: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const AppAccountSettings = ({
    formState,
    saving,
    onChange,
    onSubmit,
    kidFormState,
    kidSaving,
    onKidChange,
    onKidSubmit,
    onKidDelete,
    childrenList = [],
    selectedChildId,
    onSelectChild,
    passwordForm,
    passwordLoading,
    onPasswordChange,
    onPasswordSubmit
}: AppAccountSettingsProps) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="w-full  mx-auto">
            {/* Profile Settings */}
            <SettingsCard title="Profile Settings">
                <Card className="bg-background">
                    <CardContent>
                        <form onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Full Name</Label>
                                    <Input name="full_name" placeholder="Full Name" className="" value={formState.full_name} onChange={onChange} disabled={saving} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Email Address</Label>
                                    <Input name="email" placeholder="Email Address" className="text-primary/60" value={formState.email} onChange={onChange} disabled={saving} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Avatar/Profile Picture</Label>
                                    <Input name="avatar" type="file" className="text-primary/60" onChange={onChange} disabled={saving} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Username/Family Name</Label>
                                    <Input name="username" placeholder="Username/Family Name" className="text-primary/60" value={formState.username} onChange={onChange} disabled={saving} />
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </SettingsCard>

            {/* Kid's Account Settings */}
            <SettingsCard title="Kid&apos;s Account Settings">

                <Card className="bg-background">
                    <CardContent>
                        <form onSubmit={onKidSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="mb-6">
                                    <Label className="block text-sm font-medium mb-2">Select Kid</Label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={selectedChildId}
                                        onChange={onSelectChild}
                                        disabled={kidSaving}
                                    >
                                        <option value="" disabled>Select a kid...</option>
                                        {childrenList.map(child => (
                                            <option key={child.id} value={child.id}>
                                                {child.name} ({child.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Kid&apos;s Name</Label>
                                    <Input name="kid_name" placeholder="Full name" className="text-primary/60" value={kidFormState.name} onChange={onKidChange} disabled={kidSaving} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Username</Label>
                                    <Input name="kid_username" placeholder="Username" className="text-primary/60" value={kidFormState.username} onChange={onKidChange} disabled={kidSaving} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Avatar</Label>
                                    <Input name="kid_avatar" type="file" className="text-primary/60" onChange={onKidChange} disabled={kidSaving} />
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <Button type="submit" disabled={kidSaving || !selectedChildId}>
                                    {kidSaving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button variant="outline" className="text-primary border-primary hover:bg-primary/10" type="button" onClick={onKidDelete} disabled={kidSaving || !selectedChildId}>
                                    Delete kid&apos;s account
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </SettingsCard>

            {/* Password Reset Settings */}
            <SettingsCard title="Password Reset Settings">

                <Card className="bg-background">

                    <CardContent>
                        <form onSubmit={onPasswordSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label className="block text-sm font-medium mb-2">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            name="current_password"
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={passwordForm.current_password}
                                            onChange={onPasswordChange}
                                            disabled={passwordLoading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <Input
                                            name="new_password"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={passwordForm.new_password}
                                            onChange={onPasswordChange}
                                            disabled={passwordLoading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Input
                                            name="confirm_new_password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={passwordForm.confirm_new_password}
                                            onChange={onPasswordChange}
                                            disabled={passwordLoading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-6">
                                <Button type="submit" disabled={passwordLoading}>
                                    {passwordLoading ? "Saving..." : "Save Changes"}
                                </Button>
                                
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </SettingsCard>
        </div>
    )
}

export default AppAccountSettings