"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "./ui/button"
import { SignInButton } from "./auth/signin-button"
import { SignUpButton } from "./auth/signup-button"
import { useTheme } from "next-themes"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

type NavbarProps = {
    authStatus: "authenticated" | "loading" | "unauthenticated";
};

// Reusable AuthButtons component
const AuthButtons = ({ authStatus, dashboardPath }: { authStatus: NavbarProps["authStatus"], dashboardPath: string }) => {
    if (authStatus === "authenticated") {
        return (
            <div className="flex items-center space-x-4">
                <Link href={dashboardPath} className="text-primary dark:text-foreground hover:text-primary/80 font-semibold">
                    Dashboard
                </Link>
                <Button
                    variant="outline"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-primary dark:text-foreground hover:bg-primary/10 border-primary font-semibold"
                >
                    Logout
                </Button>
            </div>
        );
    }
    return (
        <>
            <SignUpButton>
                <Button className="bg-primary dark:text-foreground hover:bg-primary/90 text-primary-foreground font-semibold mr-4">
                    Sign Up
                </Button>
            </SignUpButton>
            <SignInButton>
                <Button
                    variant="outline"
                    className="text-primary dark:text-foreground hover:bg-primary/10 border-primary font-semibold"
                >
                    Sign In
                </Button>
            </SignInButton>
        </>
    );
};

// Reusable NavItems component
const NavItems = ({ items, onClick, authStatus }: { items: { name: string; path: string }[], onClick?: () => void, authStatus: NavbarProps["authStatus"] }) => {
    if (authStatus !== "unauthenticated") return null;
    return (
        <>
            {items.map((item) => (
                <Link
                    key={item.name}
                    href={item.path}
                    onClick={onClick}
                    className="text-primary dark:text-foreground hover:text-primary/80 font-semibold"
                >
                    {item.name}
                </Link>
            ))}
        </>
    );
};

const Navbar = ({ authStatus }: NavbarProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();
    const { data: session } = useSession(); // Removed 'status' from destructuring

    const role = session?.user?.role || "";
    const dashboardPath = role === "parent" ? "/dashboard/parents" : role === "kid" ? "/dashboard/kids" : "/";
    const navItems = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Features", path: "/features" },
        { name: "Contact Us", path: "/contact" },
    ];

    const handleMenuItemClick = () => setIsMenuOpen(false);

    if (authStatus === "loading") {
        return (
            <header className="fixed top-0 left-0 right-0 bg-background border-b z-10 shadow-sm h-16">
                <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 flex items-center justify-between">
                    <div className="font-bold text-2xl text-primary flex items-center space-x-2">
                        <div className="w-10 h-10 bg-muted animate-pulse" />
                    </div>
                    <div className="w-40 h-10 bg-muted animate-pulse" />
                </div>
            </header>
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-background border-b z-10 shadow-sm">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="flex items-center justify-between h-16 py-4">
                    {/* Logo */}
                    <Link href="/" className="font-bold text-2xl text-primary flex items-center space-x-2">
                        <Image
                            src={theme === 'dark' ? "/Logo/White.svg" : "/Logo/Purple.svg"}
                            alt="Waya Logo"
                            width={80}
                            height={80}
                            priority
                            sizes="80px"
                        />
                    </Link>

                    {/* Nav Items (centered for unauthenticated) */}
                    <nav className="flex-1 flex justify-center mx-4 gap-8">
                        <NavItems items={navItems} onClick={handleMenuItemClick} authStatus={authStatus} />
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        <AuthButtons authStatus={authStatus} dashboardPath={dashboardPath} />
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                className="md:hidden p-2"
                                aria-label="Toggle menu"
                            >
                                <Menu className="w-6 h-6 text-primary" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col px-4 py-2">
                                <NavItems items={navItems} onClick={handleMenuItemClick} authStatus={authStatus} />
                                <div className="flex flex-col gap-2 py-4">
                                    <AuthButtons authStatus={authStatus} dashboardPath={dashboardPath} />
                                    {authStatus === "authenticated" && (
                                        <Button
                                            variant="outline"
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="text-primary dark:text-foreground hover:bg-primary/10 border-primary font-semibold"
                                        >
                                            Logout
                                        </Button>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Navbar;