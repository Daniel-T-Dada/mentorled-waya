'use client'


import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"

import AppStatCard from "../AppStatCard"


import { useState, useEffect } from "react";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';

const TaskMasterDashboard = () => {
    const [kids, setKids] = useState<Kid[]>([]);

    useEffect(() => {
        const mockKids = mockDataService.getAllKids();
        setKids(mockKids);
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AppStatCard />
            {/* <DebugBarChart/> */}




            <div className="lg:col-span-2 h-64 rounded">




                <AppChoreManagement />


            </div>

            <div className="lg:col-span-1 h-64        self-start">


                <AppKidsManagement kids={kids} />
            </div>



        </div>
    )
}
export default TaskMasterDashboard