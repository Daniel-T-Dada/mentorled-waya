'use client'

import { useState } from 'react';
import { KidsManagementLazy } from '@/components/lazy/pages/KidsManagementLazy';
import { CreateKidAccountLazy } from '@/components/lazy/modals/CreateKidAccountLazy';
import { toast } from 'sonner';

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
            <KidsManagementLazy onAddKid={handleAddKid} />

            {/* Create Kid Account Modal */}
            <CreateKidAccountLazy
                isOpen={isCreateKidModalOpen}
                onClose={() => setIsCreateKidModalOpen(false)}
                onSuccess={handleCreateKidSuccess}
            />
        </>);
};

export default KidsManagementPage;