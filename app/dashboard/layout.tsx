import AppSidebar from "@/components/dashboard/AppSidebar"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar"
import { UserProvider } from "@/contexts/UserContext"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <UserProvider>
            <div className="flex h-screen">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <DashboardNavbar />
                    <main className="flex-1 overflow-auto p-4">
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    )
}

export default DashboardLayout