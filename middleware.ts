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

    // For debugging - remove in production
    console.log("Path:", nextUrl.pathname);
    console.log("Is logged in:", isLoggedIn);
    console.log("Auth object:", isLoggedIn ? "Auth exists" : "No auth");

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    console.log("Is API auth route:", isApiAuthRoute);
    console.log("Is public route:", isPublicRoute);
    console.log("Is auth route:", isAuthRoute);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // For auth routes (signin, signup)
    if (isAuthRoute) {
        // Only redirect if user is actually logged in (valid auth)
        if (isLoggedIn) {
            console.log("User is logged in and trying to access auth route, redirecting to:", DEFAULT_LOGIN_REDIRECT);
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        // Otherwise allow access to auth pages
        return NextResponse.next();
    }

    // For protected routes
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        console.log("User is not logged in and trying to access protected route, redirecting to signin with callback:", encodedCallbackUrl);
        return Response.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl));
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

