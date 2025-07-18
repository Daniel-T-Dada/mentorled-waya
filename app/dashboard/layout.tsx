import AppSidebar from "@/components/dashboard/AppSidebar"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar"
import { UserProvider } from "@/contexts/UserContext"
import { KidProvider } from "@/contexts/KidContext"
import { RoleBasedLayout } from "@/components/dashboard/RoleBasedLayout"

import QueryProvider from "@/components/providers/query-provider"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryProvider>
            <UserProvider>
                <KidProvider>
                    <RoleBasedLayout>
                        <div className="flex">
                            <AppSidebar />
                            <div className="w-full">
                                <DashboardNavbar />
                                <main className="px-8 lg:px-16 mb-4 pt-16">
                                    {children}
                                </main>
                            </div>
                        </div>
                    </RoleBasedLayout>
                </KidProvider>
            </UserProvider>
        </QueryProvider>
    )
}

export default DashboardLayout;
