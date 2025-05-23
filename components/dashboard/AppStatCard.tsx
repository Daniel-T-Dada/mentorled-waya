'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { mockDataService } from "@/lib/services/mockDataService";

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    assignedTo: string;
    status: "completed" | "pending" | "cancelled";
}

const AppStatCard = () => {
    const [chores, setChores] = useState<Chore[]>([]);

    useEffect(() => {
        // Get all chores from the mock data service
        const allChores = mockDataService.getAllChores();
        setChores(allChores);
    }, []);

    const totalChores = chores.length;
    const completedChores = chores.filter(chore => chore.status === "completed").length;
    const pendingChores = chores.filter(chore => chore.status === "pending").length;

    const stats = [
        {
            title: 'Total Number of Chore Assigned',
            value: `${totalChores} Chores`,
        },
        {
            title: 'Total Number of Completed Chore',
            value: `${completedChores} Chores`,
        },
        {
            title: 'Total Number of Pending Chore',
            value: `${pendingChores} Chores`,
        },
    ]

    return (
        <>

            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stat.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
export default AppStatCard