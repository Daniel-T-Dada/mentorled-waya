"use client";

import { BarChart, ChartSpline, Clipboard, Goal, HandCoins, Home, List, LogOut, Settings, UsersRound, Wallet } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu,  SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar } from "../ui/sidebar"

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage, } from "../ui/avatar";
import { Button } from "../ui/button";
import ThemeToggle from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";



/* interface AppSidebarProps {
    isParent: boolean;
} */

const AppSidebar = (/* { isParent }: AppSidebarProps */) => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { state } = useSidebar();
    const { user, isLoading } = useUser();

    const isParentRoute = pathname?.startsWith('/dashboard/parents');


    const navItems = isParentRoute
        ? [
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
        ] : [
            {
                name: "Dashboard",
                href: "/dashboard/kids",
                icon: Home,
            },
            {
                name: "Chore Quest",
                href: "/dashboard/kids/chore-quest",
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
            <SidebarSeparator />

            {/* The Sidebar Content */}
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-8 mt-8">
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild className="text-xl hover:bg-primary ">
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>

                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />


            {/* The Sidebar Footer Content */}
            <SidebarFooter className="mt-6 space-y-4">
                <SidebarMenu>
                    <Button
                        variant="outline"
                        className={`w-full ${state === 'collapsed' ? 'justify-center' : 'justify-start'}`}
                        onClick={() => navigateToView(isParentRoute)}
                    >
                        <UsersRound className={`${state === 'collapsed' ? '' : 'mr-2'} h-4 w-4`} />
                        {state !== 'collapsed' && <span>Switch to {isParentRoute ? "Kid" : "Parent"} View</span>}
                    </Button>
                </SidebarMenu>
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
                                                    }}
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

const navigateToView = (isParent: boolean) => {
    if (isParent) {
        window.location.href = '/dashboard/kids';
    } else {
        window.location.href = '/dashboard/parents';
    }
}