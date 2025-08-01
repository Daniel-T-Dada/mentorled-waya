"use client";

import {
    BarChart, ChartSpline, Clipboard, Goal, HandCoins, Home, List, LogOut, Settings, User, UsersRound, Wallet
} from "lucide-react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar
} from "../ui/sidebar";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getAvatarUrl, getAvatarDebugInfo } from "@/lib/utils/avatarUtils";
import { Button } from "../ui/button";
// import ThemeToggle from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { useRoleAccess } from "@/hooks/use-role-access";
import { memo, useCallback, useMemo } from "react";
import { useState } from "react";

// Memoized logo component
const Logo = memo(function Logo({ collapsed, theme }: { collapsed: boolean, theme: string | undefined }) {
    return (
        <Image
            src={
                collapsed
                    ? (theme === "dark" ? "/Logo/WhiteHead.svg" : "/Logo/PurpleHead.svg")
                    : (theme === "dark" ? "/Logo/White.svg" : "/Logo/Purple.svg")
            }
            alt="Waya Logo"
            width={collapsed ? 60 : 120}
            height={collapsed ? 60 : 120}
            priority
            sizes={collapsed ? "60px" : "120px"}
            className="transition-all duration-300"
        />
    );
});

// Memoized user avatar and info
const UserProfile = memo(function UserProfile({
    user, isLoading, state, getAvatarFallback, handleLogout
}: {
    user: any,
    isLoading: boolean,
    state: string,
    getAvatarFallback: () => string,
    handleLogout: () => void
}) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <SidebarMenuItem>
            <div className="flex items-center gap-2">
                <SidebarMenuButton
                    size="lg"
                    className="hover:bg-transparent flex-1"
                >
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden flex-shrink-0">
                        <Avatar className="h-full w-full">
                            {isLoading ? (
                                <Skeleton className="h-full w-full rounded-full" />
                            ) : (
                                <>
                                    {user?.avatar && !avatarError ? (
                                        <AvatarImage
                                            src={getAvatarUrl(user.avatar)}
                                            alt={user.name || "User avatar"}
                                            onError={() => {
                                                const debugInfo = getAvatarDebugInfo(user.avatar);
                                                setAvatarError(true);
                                                console.error("AppSidebar - Failed to load avatar image:", debugInfo);
                                            }}
                                            referrerPolicy="no-referrer"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="h-full w-full flex items-center justify-center">
                                        {getAvatarFallback()}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                    </div>
                    {state !== "collapsed" && (
                        <div className="grid flex-1 text-left text-sm leading-tight min-h-[40px] justify-center">
                            {isLoading ? (
                                <>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32 mt-1" />
                                </>
                            ) : (
                                <>
                                    <span className="font-medium leading-tight">
                                        {user?.name || "User"}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground leading-tight">
                                        {user?.isChild ? `@${user.childUsername}` : user?.email || "No email"}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </SidebarMenuButton>
                {state !== "collapsed" && (
                    <Button variant="outline" size="icon" onClick={handleLogout}>
                        <LogOut className="size-4" />
                    </Button>
                )}
            </div>
        </SidebarMenuItem>
    );
});

const AppSidebar = () => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const { state } = useSidebar();
    const { user, isLoading } = useUser();
    const { isParent, isKid } = useRoleAccess();

    // Memoize nav items for performance
    const navItems = useMemo(() => {
        if (isParent) {
            return [
                { name: "Dashboard", href: "/dashboard/parents", icon: Home },
                { name: "TaskMaster", href: "/dashboard/parents/taskmaster", icon: List },
                { name: "Family Wallet", href: "/dashboard/parents/wallet", icon: Wallet },
                { name: "Insight Tracker", href: "/dashboard/parents/insights", icon: BarChart },
                { name: "Settings", href: "/dashboard/parents/settings", icon: Settings }
            ];
        } else if (isKid) {
            return [
                { name: "Dashboard", href: "/dashboard/kids", icon: Home },
                { name: "Chore Quest", href: "/dashboard/kids/chore", icon: Clipboard },
                { name: "Money Maze", href: "/dashboard/kids/money-maze", icon: HandCoins },
                { name: "Goal Getter", href: "/dashboard/kids/goal-getter", icon: Goal },
                { name: "Earning Meter", href: "/dashboard/kids/earning-meter", icon: ChartSpline }
            ];
        }
        return [];
    }, [isParent, isKid]);

    // Memoize fallback for avatar
    const getAvatarFallback = useCallback(() => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }, [user?.name]);

    // Memoize logout handler
    const handleLogout = useCallback(() => {
        signOut({ callbackUrl: "/" });
    }, []);

    // Memoize button logic
    const isOnKidRoute = pathname.startsWith("/dashboard/kids");
    const buttonConfig = useMemo(() => {
        if (isOnKidRoute && isKid) {
            return {
                text: "Choose Avatar/Profile Picture",
                icon: User,
                action: () => {
                    // TODO: Navigate to avatar/profile selection page
                    // router.push('/dashboard/kids/profile');
                }
            };
        }
        if (isParent) {
            return {
                text: "Kids Management",
                icon: UsersRound,
                // action: () => router.push('/dashboard/parents/kids')
            };
        }
        return null;
    }, [isOnKidRoute, isKid, isParent]);
    const showSpecialButton = buttonConfig !== null;

    return (
        <Sidebar collapsible="icon">
            {/* Sidebar Header */}
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-transparent">
                            <Link href="#">
                                <Logo collapsed={state === "collapsed"} theme={theme} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator className="mx-0" />

            {/* Sidebar Content */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-8 mt-8">
                            {isLoading
                                ? Array.from({ length: navItems.length }).map((_, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton className="w-full flex items-center gap-2">
                                            <Skeleton className="h-6 w-6" />
                                            {state !== "collapsed" && <Skeleton className="h-4 w-24" />}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                                : navItems.map(item => (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton
                                            asChild
                                            className={`text-lg hover:p-4 h-10 ${pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : ""
                                                }`}
                                        >
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
            <SidebarSeparator className="mx-0" />

            {/* Sidebar Footer */}
            <SidebarFooter className="mt-6 space-y-4">
                {showSpecialButton && (
                    <SidebarMenu>
                        {/* <Button
                            variant="outline"
                            className={`w-full ${state === "collapsed" ? "justify-center" : "justify-start"}`}
                            onClick={buttonConfig?.action}
                        >
                            {buttonConfig?.icon && (
                                <buttonConfig.icon className={`${state === "collapsed" ? "" : "mr-2"} h-4 w-4`} />
                            )}
                            {state !== "collapsed" && <span>{buttonConfig?.text}</span>}
                        </Button> */}
                    </SidebarMenu>
                )}
                <SidebarMenu>
                    <div className="flex items-center justify-between">
                        {state !== "collapsed" && <span className="text-sm">Theme</span>}
                        {/* <ThemeToggle /> */}
                    </div>
                </SidebarMenu>
                <SidebarMenu>
                    <UserProfile
                        user={user}
                        isLoading={isLoading}
                        state={state}
                        getAvatarFallback={getAvatarFallback}
                        handleLogout={handleLogout}
                    />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default memo(AppSidebar);