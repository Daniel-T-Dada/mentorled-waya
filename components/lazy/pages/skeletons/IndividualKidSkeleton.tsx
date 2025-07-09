import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const IndividualKidSkeleton = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-20" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Progress Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
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

            {/* Quick Actions Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Dashboard Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Overview Skeleton */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Activities Skeleton */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-36" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
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
            </div>

            {/* Chore Management Skeleton */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
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
        </div>
    );
};

IndividualKidSkeleton.displayName = 'IndividualKidSkeleton';

export default IndividualKidSkeleton;
