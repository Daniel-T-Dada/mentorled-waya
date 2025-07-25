'use client'

import ParentDashboardOverview from '@/components/dashboard/parent/ParentDashboardOverview';

import { CreateKidAccount } from '@/components/modals/CreateKidAccount';

import { useState } from "react";

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

export default ParentsPage;