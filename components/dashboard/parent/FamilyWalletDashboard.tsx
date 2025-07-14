'use client'

import { Button } from "@/components/ui/button"
import AppPieChartLazy from "../../lazy/charts/AppPieChartLazy"
import AppStatCard from "../AppStatCard"
import { Key, Plus, Wallet } from "lucide-react"
import BarChartEarnersLazy from "../../lazy/charts/BarChartEarnersLazy"
import AppTable from "../AppTable"
// import AllowanceList from "../AllowanceList"

interface FamilyWalletDashboardProps {
    onAddAllowanceClick?: () => void;
    onAddFundsClick?: () => void;
    onSetPinClick?: () => void;
}

const FamilyWalletDashboard = ({ onAddAllowanceClick, onAddFundsClick, onSetPinClick }: FamilyWalletDashboardProps = {}) => {
    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={onAddFundsClick}
                    >
                        <Wallet className="h-4 w-4 mr-2" />
                        Add Funds
                    </Button>

                    <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={typeof onSetPinClick === 'function' ? onSetPinClick : undefined}
                    >
                        <Key className="h-4 w-4 mr-2" />
                        Set Wallet PIN
                    </Button>

                    <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={onAddAllowanceClick}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Make Payment
                    </Button>


                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <AppStatCard />

                <div className="md:col-span-2">
                    <BarChartEarnersLazy />
                </div>

                <div className="lg:col-span-1 self-start">
                    <AppPieChartLazy />
                </div>

                <div className="lg:col-span-3">
                    <AppTable />
                </div>

                {/* <div className="lg:col-span-1">
                    <AllowanceList onRefresh={() => { }} />
                </div> */}
            </div>
        </main>
    )
}
export default FamilyWalletDashboard