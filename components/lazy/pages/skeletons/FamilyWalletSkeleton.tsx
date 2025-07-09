import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FamilyWalletSkeleton = () => {
    return (
        <main>
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Stats Card Skeleton */}
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

                {/* Bar Chart Skeleton */}
                <div className="md:col-span-2">
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

                {/* Table Skeleton */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-36" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Table Header */}
                                <div className="grid grid-cols-4 gap-4 border-b pb-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                {/* Table Rows */}
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-4 gap-4 py-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-12" />
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

FamilyWalletSkeleton.displayName = 'FamilyWalletSkeleton';

export default FamilyWalletSkeleton;
