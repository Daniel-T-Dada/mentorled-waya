import AppStatCard from "@/components/dashboard/AppStatCard";
import AppKidsActivities from "@/components/dashboard/AppKidsActivities";
import AppChoreManagement from "@/components/dashboard/AppChoreManagement";
import type { KidDashboardMainProps } from './types';

export const KidDashboardMain = ({ kidId }: KidDashboardMainProps) => {
    return (
        <>
            {/* Stats Overview - Kid-specific */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AppStatCard kidId={kidId} />
                </div>
                <div className="lg:col-span-2">
                    <AppKidsActivities kidId={kidId} />
                </div>
            </div>

            {/* Chore Management - Kid-specific */}
            <div className="grid grid-cols-1 gap-6">
                <AppChoreManagement kidId={kidId} />
            </div>
        </>
    );
};
