'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AppPieChartSkeleton = () => {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-20" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="w-full md:w-auto">
                        <Skeleton className="h-10 w-full md:w-[180px] rounded-md" />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 pb-4">
                    {/* Chart skeleton */}
                    <div className="flex aspect-square max-h-[250px] items-center justify-center">
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>

                    {/* Legend skeleton */}
                    <div className="flex flex-col gap-2 w-full mt-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-3 h-3 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-3 h-3 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AppPieChartSkeleton;
