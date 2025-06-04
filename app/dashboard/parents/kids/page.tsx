'use client'

import { KidsManagement } from '@/components/dashboard/parent/kids';

const KidsManagementPage = () => {
    const handleAddKid = () => {
        // TODO: Implement add kid functionality
        // This could open a modal, navigate to a form, etc.
        console.log('Add kid functionality to be implemented');
    };

    return <KidsManagement onAddKid={handleAddKid} />;
};

export default KidsManagementPage;