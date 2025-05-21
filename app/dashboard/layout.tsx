import AppSidebar from "@/components/dashboard/AppSidebar"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen">
            <AppSidebar isParent={true} />
            <div className="flex-1 flex flex-col">
                <DashboardNavbar />
                <main className="flex-1 overflow-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    )
}
export default DashboardLayout