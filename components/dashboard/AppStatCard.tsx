'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import mockChores from "../../mockdata/mockChores.json";

interface Chore {
    id: string;
    title: string;
    description: string;
    reward: number;
    assignedTo: string;
    status: "completed" | "pending";
}

const StatCard = () => {
    const [chores] = useState<Chore[]>(mockChores as Chore[]);

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
export default StatCard