'use client'

import BarChartAllowance from "./barchart/BarChartAllowance"
import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"
import AppPieChart from "../AppPieChart"
import AppStatCard from "../AppStatCard"
import { Button } from "@/components/ui/button"
import { memo } from "react"
// import DebugBarChart from "../DebugBarChart"

interface ParentDashboardProps {
    onCreateKidClick?: () => void;
    refreshTrigger?: number;
}


const ParentDashboardOverview = memo<ParentDashboardProps>(({ onCreateKidClick, refreshTrigger }: ParentDashboardProps = {}) => {

    return (
        <main className="">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onCreateKidClick}
                >
                    Create kid&apos;s account

                </Button>

            </div>            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <AppStatCard refreshTrigger={refreshTrigger} />
                {/* <DebugBarChart/> */}

                <div className="lg:col-span-2 ">
                    <BarChartAllowance />
                </div>


                <div className="lg:col-span-1 self-start">
                    <AppPieChart refreshTrigger={refreshTrigger} />
                </div>



                <div className="lg:col-span-2 min-h-[400px] rounded">




                    <AppChoreManagement refreshTrigger={refreshTrigger} />




                </div>

                <div className="lg:col-span-1 min-h-[400px] self-start">


                    <AppKidsManagement onCreateKidClick={onCreateKidClick} />
                </div>



            </div>
        </main>
    )
});

ParentDashboardOverview.displayName = 'ParentDashboardOverview';

export default ParentDashboardOverview