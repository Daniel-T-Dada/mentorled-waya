import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes
} from "@/routes";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;



    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    console.log("Is API auth route:", isApiAuthRoute);
    console.log("Is public route:", isPublicRoute);
    console.log("Is auth route:", isAuthRoute);

    if (isApiAuthRoute) {
        const response = NextResponse.next();
        // Add no-cache headers for authentication routes
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    // For auth routes (signin, signup)
    if (isAuthRoute) {
        // Only redirect if user is actually logged in (valid auth)
        if (isLoggedIn) {
            // Redirect based on user role
            const redirectUrl = userRole === 'kid' ? '/dashboard/kids' : '/dashboard/parents';
            console.log("User is logged in and trying to access auth route, redirecting to:", redirectUrl);
            const response = NextResponse.redirect(new URL(redirectUrl, nextUrl));
            // Add no-cache headers
            response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            response.headers.set('Pragma', 'no-cache');
            return response;
        }
        // Otherwise allow access to auth pages with no-cache headers
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        return response;
    }

    // For protected routes
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        console.log("User is not logged in and trying to access protected route, redirecting to signin with callback:", encodedCallbackUrl);
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl));

    }
    // Role-based access control for dashboard routes
    if (isLoggedIn && nextUrl.pathname.startsWith('/dashboard/')) {
        const isParentRoute = nextUrl.pathname.startsWith('/dashboard/parents');
        const isKidRoute = nextUrl.pathname.startsWith('/dashboard/kids');

        // If user is a kid
        if (userRole === 'kid') {
            // Kids can only access kid routes
            if (isParentRoute) {
                console.log("Kid trying to access parent route, redirecting to kid dashboard");
                return NextResponse.redirect(new URL('/dashboard/kids', nextUrl));
            }
        }
        // If user is a parent
        else if (userRole === 'parent') {
            // Parents can access parent routes, redirect kid routes to parent dashboard
            if (isKidRoute) {
                console.log("Parent trying to access kid route, redirecting to parent dashboard");
                return NextResponse.redirect(new URL('/dashboard/parents', nextUrl));
            }
        }
        // If user role is completely missing or unrecognized
        else {
            console.log("Invalid or missing user role:", userRole, "redirecting to signin");
            return NextResponse.redirect(new URL('/auth/signin', nextUrl));
        }
    }

    // Allow public routes and authenticated users to access protected routes
    return NextResponse.next();
});

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

