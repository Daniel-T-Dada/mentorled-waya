'use client'

import { KidDashboardLazy } from "@/components/lazy/pages/KidDashboardLazy";
import { useState } from "react"

const KidsPage = () => {
    const [refreshTrigger] = useState(0);

    return (
        <div className="">
            <KidDashboardLazy refreshTrigger={refreshTrigger} />
        </div>
    )
}

export default KidsPage