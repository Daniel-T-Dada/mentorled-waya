'use client'

import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardFooter,
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

const AppAccountSettings = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="w-full  mx-auto">
            {/* Profile Settings */}
            <SettingsCard title="Profile Settings">
                <Card className="bg-background">

                    <CardContent>
                        <form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Full Name</Label>
                                    <Input placeholder="Full Name" className="" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Email Address</Label>
                                    <Input placeholder="Email Address" className="text-primary/60" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Avatar/Profile Picture</Label>
                                    <Input type="file" className="text-primary/60" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Username/Family Name</Label>
                                    <Input placeholder="Username/Family Name" className="text-primary/60" />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-10">
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>
            </SettingsCard>

            {/* Kid's Account Settings */}
            <SettingsCard title="Kid&apos;s Account Settings">

                <Card className="bg-background">

                    <CardContent>
                        <form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Number of Kids</Label>
                                    <Input placeholder="Number of kids" className="" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Child&apos;s Full Name 1</Label>
                                    <Input placeholder="Full name" className="text-primary/60" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Child&apos;s Full Name 2</Label>
                                    <Input placeholder="Full name" className="text-primary/60" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label className="block text-sm font-medium mb-2">Username/Family Name</Label>
                                    <Input placeholder="Username/Family Name" className="text-primary/60" />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="md:flex justify-center gap-10 grid grid-cols-1 md:grid-cols-2">
                        <Button>Save Changes</Button>
                        <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">Delete kid&apos;s account</Button>
                    </CardFooter>
                </Card>
            </SettingsCard>

            {/* Password Reset Settings */}
            <SettingsCard title="Password Reset Settings">

                <Card className="bg-background">

                    <CardContent>
                        <form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Label className="block text-sm font-medium mb-2">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="***************"
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
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="***************"
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
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="***************"
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
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-10">
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>
            </SettingsCard>
        </div>
    )
}

export default AppAccountSettings