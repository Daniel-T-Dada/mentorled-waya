import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ParentDashboardSkeleton = () => {
    return (
        <main className="">
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-48" />
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Stats Card Skeleton */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            ))}
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

                {/* Kids Management Skeleton */}
                <div className="lg:col-span-1 min-h-[400px] self-start">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                            <Skeleton className="h-3 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="border rounded-md p-4">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="w-12 h-12 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-2 w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
};

ParentDashboardSkeleton.displayName = 'ParentDashboardSkeleton';

export default ParentDashboardSkeleton;
