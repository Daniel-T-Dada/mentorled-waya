"use client";

import { useRoleAccess } from "@/hooks/use-role-access";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface RoleBasedLayoutProps {
    children: React.ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
    const { data: session, status } = useSession();
    const { userRole, isLoading, canAccessRoute } = useRoleAccess();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If not authenticated, redirect to signin
        if (status !== "loading" && !session) {
            router.replace("/auth/signin");
            return;
        }        // If user is authenticated but no role, redirect to signin
        if (session && status === "authenticated" && (!userRole || (userRole !== 'parent' && userRole !== 'kid'))) {
            console.log("User authenticated but invalid role:", userRole, "redirecting to signin");
            router.replace("/auth/signin");
            return;
        }

        // Check route access
        if (session && userRole && pathname && !canAccessRoute(pathname)) {
            const redirectRoute = userRole === 'kid' ? '/dashboard/kids' : '/dashboard/parents';
            console.log(`Unauthorized access to ${pathname}, redirecting to ${redirectRoute}`);
            router.replace(redirectRoute);
            return;
        }
    }, [session, status, userRole, pathname, router, canAccessRoute]);

    // Show loading state while checking authentication
    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }    // Don't render anything if user is not authenticated or doesn't have a valid role
    if (!session || !userRole || (userRole !== 'parent' && userRole !== 'kid')) {
        return null;
    }

    return <>{children}</>;
}
