'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { Users, PlusCircle } from 'lucide-react';
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { ScrollArea } from "../ui/scroll-area";

interface AppKidsManagementProps {
    kids: Kid[];
}

const AppKidsManagement = ({ kids }: AppKidsManagementProps) => {
    const pathname = usePathname();
    const isTaskMasterPage = pathname === '/dashboard/parents/taskmaster';

    // Calculate chore counts for each kid using mockDataService
    const kidsWithChoreData = kids.map(kid => {
        const completedChoreCount = mockDataService.getChoresByKidAndStatus(kid.id, "completed").length;
        const pendingChoreCount = mockDataService.getChoresByKidAndStatus(kid.id, "pending").length;


        const progress = mockDataService.getKidProgress(kid.id);

        return {
            ...kid,
            completedChoreCount,
            pendingChoreCount,
            progress
        };
    });

    return (
        <>
            <ScrollArea className="overflow-y-auto max-h-[680px]" type="scroll">

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Kids Management</CardTitle>
                        <p className="text-sm text-muted-foreground">Track your kids progress</p>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        {kidsWithChoreData.length === 0 ? (
                            <div className="text-center text-muted-foreground">No kids found.</div>
                        ) : (
                            kidsWithChoreData.map(kid => (
                                <div key={kid.id} className="border rounded-md p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                            <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                                            <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <div>
                                                    <h3 className="font-medium leading-none">{kid.name}</h3>
                                                    <p className="text-sm text-muted-foreground">Level {kid.level}</p>
                                                </div>
                                                <div className="text-sm text-muted-foreground sm:text-right">
                                                    NGN {kid.balance.toLocaleString()}
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <Progress value={kid.progress} className="w-full mt-2" />
                                        </div>
                                    </div>





                                    {/* Stats below avatar and progress */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4 text-center text-sm">
                                        {[
                                            {
                                                label: 'NGN',
                                                value: kid.balance.toLocaleString(),
                                                description: 'Balance',
                                            },
                                            {
                                                label: 'Completed ',
                                                value: kid.completedChoreCount,
                                            },
                                            {
                                                label: 'Pending',
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
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                                            <Button variant="outline" className="flex-1"><Users className="mr-2 h-4 w-4" /> View Profile</Button>
                                            <Button className="flex-1"><PlusCircle className="mr-2 h-4 w-4" /> Assign Chore</Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </ScrollArea>
        </>
    );
}

export default AppKidsManagement;