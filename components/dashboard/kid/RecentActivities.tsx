"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";


const statusColor: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    saved: "bg-green-50 text-green-700",
    spent: "bg-red-50 text-red-700",
    processing: "bg-gray-200 text-gray-700",
};

interface RecentActivitiesProps {
        name: string;
        activity: string;
        amount: string;
        status: string;
        date: string;
}

export default function RecentActivities({ activities = [] }: { activities?: RecentActivitiesProps[] }) {
    const [page, setPage] = useState(1);
    const pageSize = 3;
    const totalPages = Math.ceil(activities.length / pageSize);
    const paginated = activities.slice((page - 1) * pageSize, page * pageSize);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
                <Button variant="ghost" size="icon" aria-label="Refresh">
                    <RefreshCcw className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.map((activity, idx) => (
                            <TableRow key={idx}>                                <TableCell className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                    {/* <AvatarImage src={activity.avatar} alt={activity.name} /> */}
                                    <AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{activity.name}</span>
                            </TableCell>
                                <TableCell>{activity.activity}</TableCell>
                                <TableCell className="font-semibold">NGN {activity.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge className={`${statusColor[activity.status.toLowerCase()]} px-2 py-1 text-xs`}>{activity.status}</Badge>
                                </TableCell>
                                <TableCell>{activity.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Previous
                    </Button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <Button
                            key={idx}
                            variant={page === idx + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(idx + 1)}
                        >
                            {idx + 1}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 