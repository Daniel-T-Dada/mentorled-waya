"use client";

import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getAvatarDebugInfo } from "@/lib/utils/avatarUtils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    BellIcon,
    LogOut,
    Menu,
    Settings,
    User,
} from "lucide-react";
import { useCallback, useState, memo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";

// Extracted Left greeting for memoization and performance
const Greeting = memo(function Greeting({ name, isLoading }: { name?: string; isLoading: boolean }) {
    if (isLoading) {
        return (
            <>
                <Skeleton className="h-7 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
            </>
        );
    }
    return (
        <>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                Hello {name || "User"}
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm leading-tight">
                Building Smart Money Habits, One Chore at a Time.
            </p>
        </>
    );
});

// NotificationPanel loaded dynamically to avoid SSR issues
const NotificationPanel = dynamic(() => import("@/components/dashboard/notification/NotificationPanel"), { ssr: false });

const NotificationButton = memo(function NotificationButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Notifications"
            onClick={onClick}
        >
            <BellIcon className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
            </span>
        </button>
    );
});

// Avatar fallback logic
function getAvatarFallback(name?: string) {
    return name?.charAt(0).toUpperCase() || "U";
}

const DashboardNavbar = () => {

    const { user, isLoading } = useUser();
    const [avatarError, setAvatarError] = useState(false);
    const router = useRouter();
    const [notificationOpen, setNotificationOpen] = useState(false);

    // Memoize logout for performance
    const handleLogout = useCallback(() => {
        signOut({ callbackUrl: "/" });
    }, []);

    // Profile navigation handler
    const handleProfile = useCallback(() => {
        router.push("/dashboard/parents/profile");
    }, [router]);

    // Settings navigation handler
    const handleSettings = useCallback(() => {
        router.push("/dashboard/parents/settings");
    }, [router]);

    return (
        <nav className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 sticky top-0 z-50 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear py-8">
            <div className="flex items-center justify-between w-full px-4">
                {/* Left Side */}
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="ml-2 data-[orientation=vertical]:h-4 hidden sm:block"
                    />
                    <div className="hidden sm:flex sm:flex-col sm:justify-center min-h-[52px]">
                        <Greeting name={user?.firstName} isLoading={isLoading} />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 mr-10">
                    {/* Notification - Visible on all screens */}
                    <NotificationButton onClick={() => setNotificationOpen(true)} />

                    {/* Notification Panel Sheet */}
                    <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
                        <SheetContent side="right" className="w-[50vw] max-w-[700px] min-w-[350px] p-0">
                            <NotificationPanel />
                        </SheetContent>
                    </Sheet>

                    {/* Mobile Menu Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="md:hidden" aria-label="Open mobile menu" variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-4">
                                {/* Mobile Notifications */}
                                <Button className="relative flex items-center gap-2 p-2 rounded-md hover:bg-muted" variant="ghost">
                                    <BellIcon className="w-5 h-5" />
                                    <span>Notifications</span>
                                    <span className="ml-auto w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                        3
                                    </span>
                                </Button>
                                {/* Mobile Menu Items */}
                                <div className="flex flex-col gap-2">
                                    <Button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted" variant="ghost" onClick={handleProfile}>
                                        <User className="w-5 h-5" />
                                        <span>Profile</span>
                                    </Button>
                                    <Button className="flex items-center gap-2 p-2 rounded-md hover:bg-muted" variant="ghost" onClick={handleSettings}>
                                        <Settings className="w-5 h-5" />
                                        <span>Settings</span>
                                    </Button>
                                    <Button
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-destructive/10 text-destructive"
                                        variant="ghost"
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
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden">
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
                                                        console.error(
                                                            "DashboardNavbar - Failed to load avatar image:",
                                                            debugInfo
                                                        );
                                                        setAvatarError(true);
                                                    }}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                            <AvatarFallback className="h-full w-full flex items-center justify-center">
                                                {getAvatarFallback(user?.name)}
                                            </AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent sideOffset={10} align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleProfile}>
                                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSettings}>
                                <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};

export default memo(DashboardNavbar);