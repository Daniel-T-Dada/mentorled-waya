import AppSidebar from "@/components/dashboard/AppSidebar"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar"
import { UserProvider } from "@/contexts/UserContext"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <UserProvider>
            <div className="flex">
                <AppSidebar />
                <div className="w-full">
                    <DashboardNavbar />
                    <main className="px-8 lg:px-16 mb-4 pt-16">
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    )
}

export default DashboardLayout