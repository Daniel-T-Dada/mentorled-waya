import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KidPieChartSkeleton = () => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0 pb-4">
                <CardTitle>
                    <Skeleton className="h-5 w-32 animate-pulse" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex items-center justify-center mb-4">
                    <Skeleton className="w-[120px] h-[120px] rounded-full animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[...Array(2)].map((_, idx) => (
                        <div className="flex items-center justify-between" key={idx}>
                            <Skeleton className="h-4 w-24 animate-pulse" />
                            <Skeleton className="h-4 w-12 animate-pulse" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
export default KidPieChartSkeleton;