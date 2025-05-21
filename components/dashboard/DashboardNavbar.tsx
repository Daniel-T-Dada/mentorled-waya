'use client'
import { Separator } from "@/components/ui/separator"
// import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"
// import { useTheme } from "next-themes"
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BellIcon, LogOut, Menu, Settings, SlidersHorizontal, User } from "lucide-react"
import { useState } from "react";

const DashboardNavbar = () => {
    const [filter, setFilter] = useState("");
    return (
        <nav className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 sticky top-0 z-10 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear py-8">
            <div className="flex w-full items-center justify-between gap-1 pl-4 pr-4 lg:gap-2 lg:px-6">
                {/* Left Side */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4 hidden sm:block"
                    />
                    <div className="hidden sm:block">
                        <h1 className="text-xl md:text-2xl font-semibold">Hello Tobi</h1>
                        <p className="text-muted-foreground text-xs md:text-sm">Building Smart Money Habits, One Chore at a Time.</p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 md:gap-6 lg:gap-8 flex-shrink-0">
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

                    {/* Notification - Hidden on mobile */}
                    <button className="relative hidden md:block">
                        <BellIcon className="w-6 h-6 text-foreground" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </button>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden" aria-label="Open mobile menu">
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                <AvatarImage src="https://avatars.githubusercontent.com/u/103610391?v=4&size=64" />
                                <AvatarFallback>DD</AvatarFallback>
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
                            <DropdownMenuItem variant='destructive'>
                                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav >
    )
}

export default DashboardNavbar 