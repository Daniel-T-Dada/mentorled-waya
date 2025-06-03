'use client'

import { Button } from "@/components/ui/button"
import AppPieChart from "../AppPieChart"
import AppStatCard from "../AppStatCard"
import { Plus } from "lucide-react"
import AppBarChart from "../AppBarChart"
import AppTable from "../AppTable"
import { useSession } from "next-auth/react"

interface FamilyWalletDashboardProps {
    onAddAllowanceClick?: () => void;
}

const FamilyWalletDashboard = ({ onAddAllowanceClick }: FamilyWalletDashboardProps = {}) => {
    const { data: session } = useSession();
    const parentId = session?.user?.id;

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>

                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onAddAllowanceClick}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Make Payment
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <AppStatCard />

                <div className="md:col-span-2">
                    <AppBarChart />
                </div>

                <div className="lg:col-span-1 self-start">
                    <AppPieChart />
                </div>

                <div className="lg:col-span-3 h-64 rounded">
                    <AppTable parentId={parentId} />
                </div>
            </div>
        </main>
    )
}
export default FamilyWalletDashboard