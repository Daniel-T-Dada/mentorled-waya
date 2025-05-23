'use client'

import AppBarChart from "../AppBarChart"
import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"
import AppPieChart from "../AppPiecChart"
import AppStatCard from "../AppStatCard"
// import DebugBarChart from "../DebugBarChart"

import { useState } from "react";
import mockKidsData from "@/mockdata/mockkid.json"; 

const ParentDashboardOverview = () => {
    
    const [kids] = useState(mockKidsData); 
    

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AppStatCard />
            {/* <DebugBarChart/> */}

            <div className="lg:col-span-2  self-start">
                <AppBarChart />
            </div>


            <div className="lg:col-span-1 self-start">
                <AppPieChart />
            </div>



            <div className="lg:col-span-2 h-64 rounded">



                
                <AppChoreManagement kids={kids} />


            </div>

            <div className="lg:col-span-1 h-64        self-start">
                
                    
                    <AppKidsManagement kids={kids} />
            </div>



        </div>
    )
}
export default ParentDashboardOverview