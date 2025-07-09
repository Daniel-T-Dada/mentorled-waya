'use client'

import { useParams } from "next/navigation";
import { IndividualKidDashboardLazy } from '@/components/lazy/pages/IndividualKidDashboardLazy';

const IndividualKidDashboardPage = () => {
    const params = useParams();
    const kidId = params.kidId as string;

    return <IndividualKidDashboardLazy kidId={kidId} />;
};

export default IndividualKidDashboardPage;
