import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KidBarChartSkeleton = () => {
    return (
        <Card className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] flex flex-col">
            <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
                <Skeleton className="h-6 w-40 mb-4 animate-pulse" />
                <Skeleton className="h-3 w-32 mb-3 animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center items-center">
                <Skeleton className="h-[150px] w-full rounded animate-pulse" />
            </CardContent>
        </Card>
    );
}

export default KidBarChartSkeleton;
