'use client'

import KidDashboardOverview from "@/components/dashboard/kid/KidDashboardOverview"
import { useState } from "react"

const KidsPage = () => {
    const [refreshTrigger] = useState(0);

    return (
        <div className="">
            <KidDashboardOverview refreshTrigger={refreshTrigger} />
        </div>
    )
}

export default KidsPage