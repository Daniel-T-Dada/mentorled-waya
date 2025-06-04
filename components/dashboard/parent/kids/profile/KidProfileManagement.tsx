'use client'

import { useRouter } from 'next/navigation';
import { useKidProfile } from './useKidProfile';
import { KidProfileHeader } from './KidProfileHeader';
import { KidProfileSidebar } from './KidProfileSidebar';
import { KidProfileForm } from './KidProfileForm';
import { KidProfileLoading } from './KidProfileLoading';
import { KidProfileError } from './KidProfileError';
import type { KidProfileManagementProps } from './types';

export const KidProfileManagement = ({ kidId }: KidProfileManagementProps) => {
    const router = useRouter();
    const {
        kid,
        isLoading,
        isEditing,
        editForm,
        setEditForm,
        handleSave,
        handleCancel,
        handleEdit
    } = useKidProfile(kidId);

    const handleBack = () => {
        router.back();
    };

    const handleBackToKids = () => {
        router.push('/dashboard/parents/kids');
    };

    if (isLoading) {
        return <KidProfileLoading />;
    }

    if (!kid) {
        return <KidProfileError onBack={handleBackToKids} />;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <KidProfileHeader
                kid={kid}
                isEditing={isEditing}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onBack={handleBack}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture & Quick Stats */}
                <KidProfileSidebar
                    kid={kid}
                    isEditing={isEditing}
                />

                {/* Profile Details */}
                <KidProfileForm
                    kid={kid}
                    isEditing={isEditing}
                    editForm={editForm}
                    onFormChange={setEditForm}
                />
            </div>
        </div>
    );
};
