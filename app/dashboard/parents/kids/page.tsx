'use client'

import { useState } from 'react';


import { toast } from 'sonner';
import { KidsManagement } from '@/components/dashboard/parent/kids';
import { CreateKidAccount } from '@/components/modals/CreateKidAccount';

const KidsManagementPage = () => {
    const [isCreateKidModalOpen, setIsCreateKidModalOpen] = useState(false);

    const handleAddKid = () => {
        setIsCreateKidModalOpen(true);
    };

    const handleCreateKidSuccess = () => {
        toast.success('Kid account created successfully!');
        // The modal will close itself and refresh the kids list
    };

    return (
        <>
            <KidsManagement onAddKid={handleAddKid} />

            {/* Create Kid Account Modal */}
            <CreateKidAccount
                isOpen={isCreateKidModalOpen}
                onClose={() => setIsCreateKidModalOpen(false)}
                onSuccess={handleCreateKidSuccess}
            />
        </>);
};

export default KidsManagementPage;