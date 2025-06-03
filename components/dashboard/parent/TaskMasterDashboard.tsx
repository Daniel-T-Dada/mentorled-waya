'use client'


import AppChoreManagement from "../AppChoreManagement"
import AppKidsManagement from "../AppKidsManagement"

import AppStatCard from "../AppStatCard"


import { useState, useEffect } from "react";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { Button } from "@/components/ui/button";


interface TaskMasterDashboardProps {
    onCreateChoreClick?: () => void;
}

const TaskMasterDashboard = ({ onCreateChoreClick }: TaskMasterDashboardProps = {}) => {
    const [kids, setKids] = useState<Kid[]>([]);

    useEffect(() => {
        const mockKids = mockDataService.getAllKids();
        setKids(mockKids);
    }, []);

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>

                <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={onCreateChoreClick}
                >
                    Create Chore

                </Button>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AppStatCard />
                {/* <DebugBarChart/> */}




                <div className="lg:col-span-2 min-h-[550px] rounded">




                    <AppChoreManagement />


                </div>

                <div className="lg:col-span-1 min-h-[550px] self-start">


                    <AppKidsManagement kids={kids} />
                </div>



            </div>
        </>
    )
}
export default TaskMasterDashboard