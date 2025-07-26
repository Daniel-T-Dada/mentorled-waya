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
import { useSession } from "next-auth/react"

type NavbarProps = {
    authStatus: "authenticated" | "loading" | "unauthenticated";
};

const Navbar = ({ authStatus }: NavbarProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { theme } = useTheme()
    const { data: session } = useSession()

    // Get role from session, fallback to empty string if not available
    const role = session?.user?.role || ""

    const getDashboardPath = () => {
        if (role === "parent") return "/dashboard/parents"
        if (role === "kid") return "/dashboard/kids"
        // fallback if role is missing or new
        return "/"
    }

    const getNavItems = () => [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Features", path: "/features" },
        { name: "Contact Us", path: "/contact" }
    ]

    return (
        <header className="fixed top-0 left-0 right-0 bg-background border-b z-10 shadow-sm">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="flex items-center justify-between h-16 py-4">
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {authStatus === "unauthenticated" &&
                            getNavItems().map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="text-primary dark:text-foreground hover:text-primary/80 font-semibold"
                                >
                                    {item.name}
                                </Link>
                            ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4 ml-auto">
                        {authStatus === "authenticated" && (
                            <Link href={getDashboardPath()} className="text-primary dark:text-foreground hover:text-primary/80 font-semibold">
                                Dashboard
                            </Link>
                        )}

                        {authStatus === "unauthenticated" && (
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
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                                {authStatus === "unauthenticated" &&
                                    getNavItems().map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            onClick={() => { }}
                                            className="py-2 text-primary hover:text-primary/80 font-semibold"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}

                                {authStatus === "authenticated" && (
                                    <Link
                                        href={getDashboardPath()}
                                        className="py-2 text-primary hover:text-primary/80 font-semibold"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <div className="flex flex-col gap-2 py-4">
                                    {authStatus === "unauthenticated" && (
                                        <>
                                            <SignUpButton>
                                                <Button className="w-full bg-primary dark:text-foreground hover:bg-primary/90 text-primary-foreground font-semibold">
                                                    Sign Up
                                                </Button>
                                            </SignUpButton>
                                            <SignInButton>
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-primary dark:text-foreground hover:bg-primary/10 border-primary font-semibold"
                                                >
                                                    Sign In
                                                </Button>
                                            </SignInButton>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
export default Navbar