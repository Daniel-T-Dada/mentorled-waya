'use client'

import { useParams } from "next/navigation";
import { IndividualKidDashboard } from "@/components/dashboard/parent/kids/individual";

const IndividualKidDashboardPage = () => {
    const params = useParams();
    const kidId = params.kidId as string;

    return <IndividualKidDashboard kidId={kidId} />;
};

export default IndividualKidDashboardPage;
