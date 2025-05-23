'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import mockChores from "@/mockdata/mockChores.json";

import { usePathname } from 'next/navigation';
import { Users, PlusCircle } from 'lucide-react';

interface Kid {
    id: string;
    name: string;
    avatar?: string | null;
    level: number;
    balance: number;
}

interface AppKidsManagementProps {
    kids: Kid[];
}

const AppKidsManagement = ({ kids }: AppKidsManagementProps) => {
    const pathname = usePathname();
    const isTaskMasterPage = pathname === '/dashboard/parents/taskmaster';

    // Calculate chore counts for each kid
    const kidsWithChoreData = kids.map(kid => {
        const completedChoreCount = mockChores.filter(chore => chore.assignedTo === kid.id && chore.status === 'completed').length;
        const pendingChoreCount = mockChores.filter(chore => chore.assignedTo === kid.id && chore.status === 'pending').length;
        const totalAssignedChores = completedChoreCount + pendingChoreCount;




        const progress = totalAssignedChores > 0 ? (completedChoreCount / totalAssignedChores) * 100 : 0;
        return {
            ...kid,
            completedChoreCount,
            pendingChoreCount,
            progress
        };
    });

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track your kids progress</p>
            </CardHeader>
            <CardContent className="space-y-6">
                {kidsWithChoreData.length === 0 ? (
                    <div className="text-center text-muted-foreground">No kids found.</div>
                ) : (
                    kidsWithChoreData.map(kid => (
                        <div key={kid.id} className="border rounded-md p-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                                    <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="font-medium leading-none">{kid.name}</h3>
                                    <p className="text-sm text-muted-foreground">Level {kid.level}</p>


                                    {/* Progress bar */}
                                    <Progress value={kid.progress} className="w-full mt-2" />
                                </div>
                            </div>





                            {/* Stats below avatar and progress */}
                            <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">

                                {[
                                    {
                                        label: 'NGN',
                                        value: kid.balance.toLocaleString(),
                                        description: 'Balance',
                                    },
                                    {
                                        label: 'Completed Chore',
                                        value: kid.completedChoreCount,
                                    },
                                    {
                                        label: 'Pending Chore',
                                        value: kid.pendingChoreCount,
                                    },
                                ].map((stat, index) => (
                                    <div key={index} className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
                                        <span className="font-semibold">{stat.value}</span>
                                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action buttons - visible only on TaskMaster page */}
                            {isTaskMasterPage && (
                                <div className="flex gap-4 mt-4">
                                    <Button variant="outline" className="flex-1"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                    <Button className="flex-1"><PlusCircle className="mr-2 h-4 w-4" /> Assign Chore</Button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export default AppKidsManagement;