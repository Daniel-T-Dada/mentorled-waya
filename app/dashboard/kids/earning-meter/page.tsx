'use client'

import KidStatCards from '@/components/dashboard/kid/KidStatCards';
import KidBarChart from '@/components/dashboard/kid/KidBarChart';
import KidPieChart from '@/components/dashboard/kid/KidPieChart';
import RecentActivities from '@/components/dashboard/kid/RecentActivities';
import { useSession } from 'next-auth/react';

const EarningMeterPage = () => {
    const { data: session } = useSession();
    const sessionKidId = session?.user?.id;
    const validKidIds = ['kid-001', 'kid-002', 'kid-003', 'kid-004'];
    let kidId = 'kid-001';
    if (sessionKidId && validKidIds.includes(sessionKidId)) {
        kidId = sessionKidId;
    }

    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Earning Meter</h2>
                <p className="text-muted-foreground">Track your earnings and see your progress!</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-3">
                    <KidStatCards kidId={kidId} section="earning-meter" />
                </div>
                <div className="lg:col-span-2">
                    <KidBarChart kidId={kidId} />
                </div>                <div className="lg:col-span-1 self-start">
                    <KidPieChart kidId={kidId} />
                </div>
            </div>
            <div className="mt-8">
                <RecentActivities />
            </div>
        </main>
    );
};

export default EarningMeterPage; 