'use client'

import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image"; // <-- Import next/image

export default function UserProfile() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-2 sm:px-0">
            <div className="w-full max-w-4xl mx-auto pt-8 pb-2">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-1">My Profile</h2>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                            Role: Parent
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-primary text-primary bg-[#F6EDFB] hover:bg-[#f3e7f8] font-medium text-sm"
                    >
                        <UserPlus size={18} />
                        Invite Friends
                    </Button>
                </div>

                <Card className="p-0 md:p-6">
                    <CardContent className="p-0">
                        {/* Profile Avatar + Name */}
                        <div className="flex flex-col items-center mt-2 mb-6">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 relative">
                                <Image
                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                    alt="User avatar"
                                    fill
                                    style={{ objectFit: "cover" }}
                                    sizes="160px"
                                    priority
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold">Adeola</div>
                                <div className="text-muted-foreground text-base sm:text-lg font-medium">@adeola</div>
                            </div>
                        </div>

                        {/* Info Sections */}
                        <form>
                            <div className="grid grid-cols-1 gap-6">
                                {/* Personal Data Section */}
                                <Card className="bg-[#faf9f6] border rounded-xl p-5">
                                    <div className="text-base font-semibold mb-3">Personal Data</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                                                Full Name
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="w-full text-base bg-[#f5f5f5] focus:outline-none"
                                            />
                                        </div>
                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="w-full text-base bg-[#f5f5f5] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                {/* Security Section */}
                                <Card className="bg-[#faf9f6] border rounded-xl p-5">
                                    <div className="text-base font-semibold mb-3">Security</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Password */}
                                        <div className="relative">
                                            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                                                Current Password
                                            </label>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your current password"
                                                className="w-full text-base bg-[#f5f5f5] focus:outline-none pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-9 text-gray-400"
                                                onClick={() => setShowPassword((v) => !v)}
                                                tabIndex={-1}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {/* Wallet Pin */}
                                        <div className="relative">
                                            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                                                Current Wallet Pin
                                            </label>
                                            <Input
                                                type={showPin ? "text" : "password"}
                                                placeholder="Enter your current wallet pin"
                                                className="w-full text-base bg-[#f5f5f5] focus:outline-none pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-9 text-gray-400"
                                                onClick={() => setShowPin((v) => !v)}
                                                tabIndex={-1}
                                                aria-label={showPin ? "Hide wallet pin" : "Show wallet pin"}
                                            >
                                                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            {/* You can add a Save Changes button here if desired */}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}