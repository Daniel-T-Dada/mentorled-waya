'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockDataService, type Kid } from '@/lib/services/mockDataService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Wallet, ClipboardList, TrendingUp } from "lucide-react";
import AppStatCard from "@/components/dashboard/AppStatCard";
import AppChoreManagement from "@/components/dashboard/AppChoreManagement";
import AppKidsActivities from "@/components/dashboard/AppKidsActivities";
import Link from "next/link";

const IndividualKidDashboard = () => {
    const params = useParams();
    const router = useRouter();
    const kidId = params.kidId as string;
    
    const [kid, setKid] = useState<Kid | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKidData = () => {
            const kidData = mockDataService.getKidById(kidId);
            if (!kidData) {
                router.push('/dashboard/parents/kids');
                return;
            }
            setKid(kidData);
            setLoading(false);
        };

        loadKidData();
    }, [kidId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!kid) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Kid not found</h2>
                    <p className="text-muted-foreground mb-4">The kid you're looking for doesn't exist.</p>
                    <Button onClick={() => router.push('/dashboard/parents/kids')}>
                        Back to Kids List
                    </Button>
                </div>
            </div>
        );
    }

    const completedChores = mockDataService.getChoresByKidAndStatus(kidId, "completed").length;
    const pendingChores = mockDataService.getChoresByKidAndStatus(kidId, "pending").length;
    const progress = mockDataService.getKidProgress(kidId);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/dashboard/parents/kids')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={kid.avatar ?? undefined} alt={kid.name} />
                            <AvatarFallback>{kid.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{kid.name}'s Dashboard</h1>
                            <p className="text-muted-foreground">Level {kid.level} • NGN {kid.balance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Link href={`/dashboard/parents/kids/${kidId}/profile`}>
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Progress Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{completedChores}</div>
                                <div className="text-sm text-muted-foreground">Completed Tasks</div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{pendingChores}</div>
                                <div className="text-sm text-muted-foreground">Pending Tasks</div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">NGN {kid.balance.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Current Balance</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href={`/dashboard/parents/kids/${kidId}/tasks`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6">
                            <ClipboardList className="h-8 w-8 text-primary mr-3" />
                            <div>
                                <h3 className="font-semibold">Tasks</h3>
                                <p className="text-sm text-muted-foreground">Manage chores</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/parents/kids/${kidId}/wallet`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6">
                            <Wallet className="h-8 w-8 text-primary mr-3" />
                            <div>
                                <h3 className="font-semibold">Wallet</h3>
                                <p className="text-sm text-muted-foreground">View allowance</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/parents/kids/${kidId}/progress`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6">
                            <TrendingUp className="h-8 w-8 text-primary mr-3" />
                            <div>
                                <h3 className="font-semibold">Analytics</h3>
                                <p className="text-sm text-muted-foreground">View progress</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/dashboard/parents/kids/${kidId}/profile`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6">
                            <Settings className="h-8 w-8 text-primary mr-3" />
                            <div>
                                <h3 className="font-semibold">Settings</h3>
                                <p className="text-sm text-muted-foreground">Edit profile</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Stats Overview - Kid-specific */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <AppStatCard kidId={kidId} />
                </div>
                <div className="lg:col-span-2">
                    <AppKidsActivities kidId={kidId} />
                </div>
            </div>

            {/* Chore Management - Kid-specific */}
            <div className="grid grid-cols-1 gap-6">
                <AppChoreManagement kidId={kidId} />
            </div>
        </div>
    );
};

export default IndividualKidDashboard;
