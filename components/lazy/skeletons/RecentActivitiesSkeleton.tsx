import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecentActivitiesSkeleton = () => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>
                    <Skeleton className="h-5 w-40 animate-pulse" />
                </CardTitle>
                <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(3)].map((_, idx) => (
                        <div className="flex items-center gap-4" key={idx}>
                            <Skeleton className="w-8 h-8 rounded-full animate-pulse" />
                            <Skeleton className="h-4 w-20 animate-pulse" />
                            <Skeleton className="h-4 w-20 animate-pulse" />
                            <Skeleton className="h-4 w-14 animate-pulse" />
                            <Skeleton className="h-4 w-16 animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end items-center gap-2 mt-4">
                    {[...Array(3)].map((_, idx) => (
                        <Skeleton className="h-6 w-8 rounded animate-pulse" key={idx} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default RecentActivitiesSkeleton;