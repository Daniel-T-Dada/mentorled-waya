'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <div>
            <Navbar />

            <main className="min-h-screen">
                {children}
            </main>
        
            {pathname === '/' && <Footer />}
        </div>
    )
}
export default ClientWrapper