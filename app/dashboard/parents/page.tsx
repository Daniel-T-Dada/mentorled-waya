'use client'

import { CreateKidAccountLazy } from '@/components/lazy/modals/CreateKidAccountLazy';
import { ParentDashboardLazy } from '@/components/lazy/pages/ParentDashboardLazy';
import { useState } from "react";

const ParentsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className=" ">
            <ParentDashboardLazy onCreateKidClick={() => setIsCreateModalOpen(true)} />
            {/* Create Kid Account Modal */}
            <CreateKidAccountLazy
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

export default ParentsPage;