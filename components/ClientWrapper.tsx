'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth/');
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <div>
            {!isDashboard && !isAuthPage && <Navbar />}
            
            <main className="min-h-screen">
                {children}
            </main>
            {!isDashboard && !isAuthPage && <Footer />}
        </div>
    )
}
export default ClientWrapper