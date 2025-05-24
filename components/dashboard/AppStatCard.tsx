'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { mockDataService } from "@/lib/services/mockDataService";
import { Skeleton } from "../ui/skeleton";

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            // Get all chores from the mock data service
            const allChores = mockDataService.getAllChores();
            setChores(allChores);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
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
            {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-1/4" />
                        </CardContent>
                    </Card>
                ))
            ) : (
                stats.map((stat, index) => (
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
                ))
            )}
        </>
    )
}
export default AppStatCard