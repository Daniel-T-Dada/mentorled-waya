"use client"


import KidStatCards from "./KidStatCards"
import KidBarChart from "./KidBarChart"
import KidPieChart from "./KidPieChart"
import AppChoreManagement from "../AppChoreManagement"
import KidDailyStreaks from "./KidDailyStreaks"
import { useSession } from "next-auth/react"

interface KidDashboardOverviewProps {
    kidId?: string;
}

const KidDashboardOverview = ({ kidId: propKidId }: KidDashboardOverviewProps) => {
    const { data: session } = useSession();

    // Get kid data - prioritize prop, then session, then fallback
    // Ensure we use a valid kidId that exists in our mock data
    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];

    let kidId = propKidId || "kid-001";

    // If we have a session kid ID, check if it's valid, otherwise use fallback
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    } else if (sessionKidId) {
        console.log(`Session kidId "${sessionKidId}" not found in mock data, using fallback: kid-001`);
    }

    console.log('KidDashboardOverview - Final kidId:', kidId);

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                {/* <Button
                    className="bg-primary hover:bg-primary/90"
                
                >
                    Create kid&apos;s account

                </Button> */}

            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards kidId={kidId} />
                </div>                <div className="lg:col-span-2 ">
                    <KidBarChart kidId={kidId} />
                </div>

                <div className="lg:col-span-1 self-start">
                    <KidPieChart kidId={kidId} />
                </div>                
                <div className="lg:col-span-2 min-h-[400px] rounded">

                    <AppChoreManagement kidId={kidId} />

                </div><div className="lg:col-span-1 min-h-[400px] self-start">
                    <KidDailyStreaks kidId={kidId} />
                </div>



            </div>
        </main>
    )
}
export default KidDashboardOverview