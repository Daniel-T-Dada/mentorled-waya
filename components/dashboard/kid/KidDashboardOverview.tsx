"use client"

import KidStatCards from "./KidStatCards"
import KidBarChart from "./KidBarChart"
import KidPieChart from "./KidPieChart"
import AppChoreManagement from "../AppChoreManagement"
import KidDailyStreaks from "./KidDailyStreaks"
import { useSession } from "next-auth/react"
import { useKid } from "@/contexts/KidContext"
import { memo } from "react"

interface KidDashboardOverviewProps {
    kidId?: string;
    refreshTrigger?: number;
}

const KidDashboardOverview = memo<KidDashboardOverviewProps>(({ kidId: propKidId, refreshTrigger }) => {
    const { data: session } = useSession();
    const { currentKid, isKidSession } = useKid();

    // For kid sessions, use childId; for parent sessions viewing a kid, use the session user ID
    const sessionKidId = session?.user?.isChild ? session.user.childId : session?.user?.id;

    // Priority: prop kidId, then session kid ID, then fallback
    const kidId = propKidId || sessionKidId || "kid-001";

    console.log('KidDashboardOverview - Using kidId:', kidId, {
        propKidId,
        sessionKidId,
        isChildSession: session?.user?.isChild,
        childId: session?.user?.childId,
        userId: session?.user?.id,
        finalKidId: kidId,
        currentKid,
        isKidSession
    });

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

                    <AppChoreManagement kidId={kidId} refreshTrigger={refreshTrigger} />

                </div><div className="lg:col-span-1 min-h-[400px] self-start">
                    <KidDailyStreaks kidId={kidId} />
                </div>



            </div>
        </main>
    )
});

KidDashboardOverview.displayName = 'KidDashboardOverview';

export default KidDashboardOverview