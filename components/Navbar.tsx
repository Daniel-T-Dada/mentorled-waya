"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "./ui/button"
import { SignInButton } from "./auth/signin-button"
import { SignUpButton } from "./auth/signup-button"


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const getNavItems = () => {
        return [
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
            { name: "Features", path: "/features" },
            { name: "Contact Us", path: "/contact" },
        ]
    }

    return (
        <header className="fixed top-0 left-0 right-0 bg-background border-b z-10 shadow-sm">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="flex items-center justify-between h-16 py-4">
                    <Link href="/" className="font-bold text-2xl text-primary flex items-center space-x-2">
                        <Image src="/Logo/Purple.svg" alt="Logo" width={80} height={80} />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">

                        {getNavItems().map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className="text-[#500061] dark:text-[#9333EA] hover:text-[#9514b7] font-semibold">
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Authentication Buttons */}
                    <div className="hidden md:flex space-x-4">
                        {/* <ThemeToggle /> */}
                        <SignUpButton>
                            <Button className="bg-[#500061] dark:bg-[#9333EA] hover:bg-[#9514b7] text-white hover:text-secondary font-semibold mr-4">
                                Sign Up
                            </Button>
                        </SignUpButton>

                        <SignInButton>
                            <Button variant="outline" className="text-primary hover:bg-[#ffe7fe] outline-[#500061] dark:outline-[#9333EA] outline-offset-2 font-semibold">
                                Sign In
                            </Button>
                        </SignInButton>

                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6 text-[#500061]"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg">
                        <nav className="flex flex-col px-4 py-2">
                            {getNavItems().map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setIsMenuOpen(false)
                                    }}
                                    className="py-2 text-[#500061] hover:text-[#9514b7] font-semibold"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 py-4">
                                <Link href="/login" onClick={(e) => e.preventDefault()}>
                                    <Button className="w-full bg-[#500061] hover:bg-[#9514b7] text-white hover:text-secondary font-semibold">
                                        Sign Up
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={(e) => e.preventDefault()}>
                                    <Button variant="outline" className="w-full text-primary hover:bg-[#ffe7fe] outline-[#500061] outline-offset-2 font-semibold">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
export default Navbar