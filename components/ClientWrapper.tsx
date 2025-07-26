'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { useSession } from "next-auth/react";
import { SignOutButton } from "./auth/signout-button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { status } = useSession();
    const queryClient = new QueryClient();

    return (
        <div>
            <Navbar authStatus={status} />

            {/* Main content area */}
            <QueryClientProvider client={queryClient}> 
                <main className="min-h-screen">
                    {children}
                </main>
            </QueryClientProvider>


            {pathname === '/' && <Footer />}
            {status === "authenticated" && <SignOutButton />}
        </div>
    )
}
export default ClientWrapper