import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KidStatCardsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
                <Card className="border-2" key={idx}>
                    <CardHeader className="pb-3">
                        <CardTitle>
                            <Skeleton className="h-4 w-24 mb-2 animate-pulse" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-36 mb-4 animate-pulse" />
                        <Skeleton className="h-4 w-20 animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default KidStatCardsSkeleton;
