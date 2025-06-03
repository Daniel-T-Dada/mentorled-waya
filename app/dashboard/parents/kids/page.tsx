'use client'

import { useState, useEffect } from "react";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const KidsManagementPage = () => {
    const [kids, setKids] = useState<Kid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKids = () => {
            const allKids = mockDataService.getAllKids();
            setKids(allKids);
            setLoading(false);
        };

        // Simulate loading delay
        const timer = setTimeout(loadKids, 500);
        return () => clearTimeout(timer);
    }, []);

    const getKidStats = (kidId: string) => {
        const completedChores = mockDataService.getChoresByKidAndStatus(kidId, "completed").length;
        const pendingChores = mockDataService.getChoresByKidAndStatus(kidId, "pending").length;
        const progress = mockDataService.getKidProgress(kidId);
        
        return { completedChores, pendingChores, progress };
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kids Management</h1>
                    <p className="text-muted-foreground">Monitor and manage each of your kids' progress</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Kid
                </Button>
            </div>

            {/* Kids Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-2 w-full mb-4" />
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                                <div className="text-center">
                                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                                <div className="text-center">
                                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                        </Card>
                    ))
                ) : kids.length === 0 ? (
                    // Empty State
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <Users className="h-24 w-24 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No kids added yet</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            Start by adding your first kid to begin tracking their chores and progress.
                        </p>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Kid
                        </Button>
                    </div>
                ) : (
                    // Kids Cards
                    kids.map((kid) => {
                        const stats = getKidStats(kid.id);
                        return (
                            <Card key={kid.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                                            <AvatarFallback className="text-lg">{kid.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{kid.name}</CardTitle>
                                            <p className="text-muted-foreground">Level {kid.level}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{Math.round(stats.progress)}%</span>
                                        </div>
                                        <Progress value={stats.progress} className="w-full" />
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{stats.completedChores}</div>
                                            <div className="text-xs text-muted-foreground">Completed</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingChores}</div>
                                            <div className="text-xs text-muted-foreground">Pending</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">NGN {kid.balance.toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">Balance</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link href={`/dashboard/parents/kids/${kid.id}`} className="block">
                                        <Button className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Dashboard
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default KidsManagementPage;