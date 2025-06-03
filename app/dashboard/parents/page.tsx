'use client'

import dynamic from "next/dynamic";
import ParentDashboardOverview from "@/components/dashboard/parent/ParentDashboardOverview"
import { useState } from "react";


    const CreateKidAccount = dynamic(() => import("@/components/modals/CreateKidAccount").then(mod => mod.CreateKidAccount), {
        loading: () => <div className="animate-pulse p-6 text-center">Loading modal...</div>,
        ssr: false,
    });

const ParentsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className=" ">
            <ParentDashboardOverview onCreateKidClick={() => setIsCreateModalOpen(true)} />
            {/* Create Kid Account Modal */}
            <CreateKidAccount
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    // Handle success, such as refreshing kids list
                    console.log("Kid account created successfully");
                }}
            />
        </div>
    )
}
export default ParentsPage