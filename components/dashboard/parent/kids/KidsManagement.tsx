'use client'

import { useKid } from '@/contexts/KidContext';
import { KidsPageHeader } from './KidsPageHeader';
import { KidsGrid } from './KidsGrid';
import { KidCard } from './KidCard';
import { KidsLoadingSkeleton } from './KidsLoadingSkeleton';
import { KidsEmptyState } from './KidsEmptyState';
import type { KidsManagementProps } from './types';

export const KidsManagement = ({ onAddKid }: KidsManagementProps) => {
    const { kids, isLoadingKids } = useKid();

    const handleAddKid = () => {
        if (onAddKid) {
            onAddKid();
        } else {
            // Default behavior - you can implement a modal or navigation
            console.log('Add kid functionality not implemented');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <KidsPageHeader onAddKid={handleAddKid} />

            {/* Kids Grid */}
            <KidsGrid>
                {isLoadingKids ? (
                    <KidsLoadingSkeleton />
                ) : kids.length === 0 ? (
                    <KidsEmptyState onAddKid={handleAddKid} />
                ) : (
                    kids.map((kid: any) => (
                        <KidCard
                            key={kid.id}
                            kid={kid}
                            completedChores={0} // Placeholder for now
                            pendingChores={0}   // Placeholder for now  
                            progress={0}        // Placeholder for now
                        />
                    ))
                )}
            </KidsGrid>
        </div>
    );
};
