"use client";

import React from "react";
import { BarChart, ChartSpline, Clipboard, Goal, HandCoins, Home, List, LogOut, Settings, User, UsersRound, Wallet } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar } from "../ui/sidebar"

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage, } from "../ui/avatar";
import { Button } from "../ui/button";
import ThemeToggle from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { useRoleAccess } from "@/hooks/use-role-access";

const AppSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();
    const { state } = useSidebar();
    const { user, isLoading } = useUser();
    const { isParent, isKid } = useRoleAccess();

    // Debug: Log user avatar for troubleshooting
    React.useEffect(() => {
        if (user && !isLoading) {
            console.log("AppSidebar - User data:", {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            });
        }
    }, [user, isLoading]);

    // Determine navigation items based on user role
    const getNavItems = () => {
        if (isParent) {
            return [
                {
                    name: "Dashboard",
                    href: "/dashboard/parents",
                    icon: Home,
                },
                {
                    name: "TaskMaster",
                    href: "/dashboard/parents/taskmaster",
                    icon: List,
                },
                {
                    name: "Family Wallet",
                    href: "/dashboard/parents/wallet",
                    icon: Wallet,
                },
                {
                    name: "Insight Tracker",
                    href: "/dashboard/parents/insights",
                    icon: BarChart,
                },
                {
                    name: "Settings",
                    href: "/dashboard/parents/settings",
                    icon: Settings,
                }
            ];
        } else if (isKid) {
            return [
                {
                    name: "Dashboard",
                    href: "/dashboard/kids",
                    icon: Home,
                },
                {
                    name: "Chore Quest",
                    href: "/dashboard/kids/chore",
                    icon: Clipboard,
                },
                {
                    name: "Money Maze",
                    href: "/dashboard/kids/money-maze",
                    icon: HandCoins,
                },
                {
                    name: "Goal Getter",
                    href: "/dashboard/kids/goal-getter",
                    icon: Goal
                },
                {
                    name: "Earning Meter",
                    href: "/dashboard/kids/earning-meter",
                    icon: ChartSpline
                },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    const getAvatarFallback = () => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Determine button config using ternary conditions
    const isOnKidRoute = pathname.startsWith('/dashboard/kids');

    const buttonConfig = (isOnKidRoute && isKid) ? {
        text: "Choose Avatar/Profile Picture",
        icon: User,
        action: () => {
            // TODO: Navigate to avatar/profile selection page
            console.log("Navigate to avatar/profile selection");
            // router.push('/dashboard/kids/profile'); // Uncomment when profile page exists
        }
    } : isParent ? {
        text: "Kids Management",
        icon: UsersRound,
        action: () => router.push('/dashboard/parents/kids')
    } : null;

    const showSpecialButton = buttonConfig !== null;

    return (
        <Sidebar collapsible="icon" >
            {/* The Sidebar Header */}
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-transparent">
                            <Link href="#">
                                <Image
                                    src={state === 'collapsed'
                                        ? (theme === 'dark' ? "/Logo/WhiteHead.svg" : "/Logo/PurpleHead.svg")
                                        : (theme === 'dark' ? "/Logo/White.svg" : "/Logo/Purple.svg")
                                    }
                                    alt="Waya Logo"
                                    width={state === 'collapsed' ? 60 : 120}
                                    height={state === 'collapsed' ? 60 : 120}
                                    className="transition-all duration-300"
                                />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator className="mx-0" />

            {/* The Sidebar Content */}
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-8 mt-8">
                            {isLoading ? (
                                // Skeleton loading for navigation items
                                Array.from({ length: navItems.length }).map((_, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton className="w-full flex items-center gap-2">
                                            <Skeleton className="h-6 w-6" />
                                            {state !== 'collapsed' && <Skeleton className="h-4 w-24" />}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                navItems.map((item) => (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton
                                            asChild
                                            className={`text-lg hover:bg-primary hover:p-4 h-10 hover:text-primary-foreground ${pathname === item.href ? 'bg-primary text-primary-foreground' : ''
                                                }`}
                                        >
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.name}</span>
                                            </Link>
                                        </SidebarMenuButton>

                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator className="mx-0" />


            {/* The Sidebar Footer Content */}
            <SidebarFooter className="mt-6 space-y-4">
                {showSpecialButton && (
                    <SidebarMenu>
                        <Button
                            variant="outline"
                            className={`w-full ${state === 'collapsed' ? 'justify-center' : 'justify-start'}`}
                            onClick={buttonConfig.action}
                        >
                            <buttonConfig.icon className={`${state === 'collapsed' ? '' : 'mr-2'} h-4 w-4`} />
                            {state !== 'collapsed' && <span>{buttonConfig.text}</span>}
                        </Button>
                    </SidebarMenu>
                )}
                <SidebarMenu>
                    <div className="flex items-center justify-between">
                        {state !== 'collapsed' && <span className="text-sm">Theme</span>}
                        <ThemeToggle />
                    </div>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2">
                            <SidebarMenuButton
                                size="lg"
                                className="hover:bg-transparent flex-1"
                            >
                                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                    {isLoading ? (
                                        <Skeleton className="h-full w-full rounded-full" />
                                    ) : (
                                        <>
                                            {user?.avatar ? (
                                                <AvatarImage
                                                    src={user.avatar}
                                                    alt={user.name || "User avatar"}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        console.error("AppSidebar - Failed to load avatar image:", {
                                                            avatarUrl: user.avatar,
                                                            userName: user.name,
                                                            userEmail: user.email,
                                                            error: e
                                                        });
                                                    }}
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : null}
                                            <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                {state !== 'collapsed' && (
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        {isLoading ? (
                                            <>
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32 mt-1" />
                                            </>
                                        ) : (
                                            <>
                                                <span className="truncate font-medium">{user?.name || "User"}</span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {user?.email || "No email"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </SidebarMenuButton>
                            {state !== 'collapsed' && (
                                <Button variant="outline" size="icon" onClick={handleLogout}>
                                    <LogOut className="size-4" />
                                </Button>
                            )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar

