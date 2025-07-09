import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KidsManagementSkeleton = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Kids Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="relative">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Progress Bar Skeleton */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>

                            {/* Stats Grid Skeleton */}
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="p-2 bg-muted rounded">
                                    <Skeleton className="h-4 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Skeleton className="h-4 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Skeleton className="h-4 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                            </div>

                            {/* Action Button Skeleton */}
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

KidsManagementSkeleton.displayName = 'KidsManagementSkeleton';

export default KidsManagementSkeleton;
