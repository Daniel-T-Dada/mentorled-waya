import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KidBarChartSkeleton = () => (
    <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
        <CardHeader className="flex-shrink-0">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default KidBarChartSkeleton;
