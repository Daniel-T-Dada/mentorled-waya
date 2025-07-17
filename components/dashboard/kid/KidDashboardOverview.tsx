"use client"

import KidStatCards from "./KidStatCards"
import KidBarChart from "./KidBarChart"
import KidPieChart from "./KidPieChart"
import KidDailyStreaks from "./KidDailyStreaks"
// import { useSession } from "next-auth/react"
// import { useKid } from "@/contexts/KidContext"
import { memo } from "react"

import KidChore from "./KidChore"

// interface KidDashboardOverviewProps {
//     kidId?: string;
// }

const KidDashboardOverview = memo(() => {
    // const { data: session } = useSession();
    // const { currentKid, isKidSession } = useKid();

    // For kid sessions, use childId; for parent sessions viewing a kid, use the session user ID
    // const sessionKidId = session?.user?.isChild ? session.user.childId : session?.user?.id;

    // Priority: prop kidId, then session kid ID, then fallback
    // const kidId = propKidId || sessionKidId || "kid-001";

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Overview</h2>
                {/* <Button className="bg-primary hover:bg-primary/90">Create kid&apos;s account</Button> */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards />
                </div>
                <div className="lg:col-span-2 ">
                    <KidBarChart />
                </div>
                <div className="lg:col-span-1 self-start">
                    <KidPieChart />
                </div>
                <div className="lg:col-span-2 min-h-[400px] rounded">
                    <KidChore />

                </div>
                <div className="lg:col-span-1 min-h-[400px] self-start">
                    <KidDailyStreaks />
                </div>
            </div>
        </main>
    )
});

KidDashboardOverview.displayName = 'KidDashboardOverview';

export default KidDashboardOverview