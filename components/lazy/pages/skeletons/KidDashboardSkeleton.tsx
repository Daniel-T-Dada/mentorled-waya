import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KidDashboardSkeleton = () => {
    return (
        <main>
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Stats Cards Skeleton */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="text-center p-4 bg-muted rounded-lg">
                                        <Skeleton className="h-8 w-16 mx-auto mb-2" />
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bar Chart Skeleton */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Pie Chart Skeleton */}
                <div className="lg:col-span-1 self-start">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px] w-full rounded-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Chore Management Skeleton */}
                <div className="lg:col-span-2 min-h-[400px] rounded">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Streaks Skeleton */}
                <div className="lg:col-span-1 min-h-[400px] self-start">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                                    <Skeleton className="h-4 w-24 mx-auto" />
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-8 rounded" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
};

KidDashboardSkeleton.displayName = 'KidDashboardSkeleton';

export default KidDashboardSkeleton;
