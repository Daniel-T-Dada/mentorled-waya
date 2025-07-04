'use client'
import React from 'react'
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BellIcon, LogOut, Menu, Settings, SlidersHorizontal, User } from "lucide-react"
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const DashboardNavbar = () => {
    const [filter, setFilter] = useState("");
    const { user, isLoading } = useUser();
    const [avatarError, setAvatarError] = useState(false);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const getAvatarFallback = () => {
        if (!user?.name) return "U";
        return user.name.charAt(0).toUpperCase();
    };

    // Helper function to get display name
    const getDisplayName = () => {
        if (!user?.name) return "User";

        // Check if this is a kid session and extract first name
        if (user.isChild && user.name) {
            const firstName = user.name.split(' ')[0];
            return firstName;
        }

        // For parents, show full name
        return user.name;
    };

    // Debug: Log user avatar for troubleshooting
    React.useEffect(() => {
        if (user && !isLoading) {
            console.log("DashboardNavbar - User data:", {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            });
        }
    }, [user, isLoading]);

    return (
        <nav className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 sticky top-0 z-10 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear py-8">
            <div className="flex items-center justify-between w-full px-4">
                {/* Left Side */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="ml-2 data-[orientation=vertical]:h-4 hidden sm:block"
                    />
                    <div className="hidden sm:block">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-7 w-48 mb-1" />
                                <Skeleton className="h-4 w-64" />
                            </>
                        ) : (
                            <>
                                <h1 className="text-xl md:text-2xl font-semibold">Hello {getDisplayName()}</h1>
                                <p className="text-muted-foreground text-xs md:text-sm">Building Smart Money Habits, One Chore at a Time.</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 mr-10">

                    {/* Search - Hidden on mobile */}
                    <div className="relative hidden md:block">
                        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter"
                            className="pl-9 pr-4 py-2 text-sm rounded-md bg-muted/50 w-48 lg:w-64 border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    {/* Notification - Visible on all screens */}
                    <button className="relative">
                        <BellIcon className="w-6 h-6 text-foreground" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </button>

                    {/* Mobile Menu Trigger - Hidden on mobile */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="hidden md:hidden" aria-label="Open mobile menu">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-4">
                                {/* Mobile Search */}
                                <div className="relative">
                                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Filter"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-muted/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={filter}
                                        onChange={e => setFilter(e.target.value)}
                                    />
                                </div>

                                {/* Mobile Notifications */}
                                <Button className="relative flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                    <BellIcon className="w-5 h-5" />
                                    <span>Notifications</span>
                                    <span className="ml-auto w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                        3
                                    </span>
                                </Button>

                                {/* Mobile Menu Items */}
                                <div className="flex flex-col gap-2">
                                    <Button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                        <User className="w-5 h-5" />
                                        <span>Profile</span>
                                    </Button>
                                    <Button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                        <Settings className="w-5 h-5" />
                                        <span>Settings</span>
                                    </Button>
                                    <Button
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-destructive/10 text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                {isLoading ? (
                                    <Skeleton className="h-full w-full rounded-full" />
                                ) : (
                                    <>
                                        {(user?.avatar && !avatarError) ? (
                                            <AvatarImage
                                                src={user.avatar}
                                                alt={user.name || "User avatar"}
                                                onError={() => {
                                                    console.error("DashboardNavbar - Failed to load avatar image:", {
                                                        avatarUrl: user.avatar,
                                                        userName: user.name,
                                                        userEmail: user.email
                                                    });
                                                    setAvatarError(true);
                                                }}
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : null}
                                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={10} align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem variant='destructive' onClick={handleLogout}>
                                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}

export default DashboardNavbar