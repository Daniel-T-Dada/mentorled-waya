'use client'

import { usePathname } from "next/navigation";
import Footer from "./Footer";




const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth/');
    return (
        <div>
            {children}
            {!isAuthPage && <Footer />}
        </div>
    )
}
export default ClientWrapper