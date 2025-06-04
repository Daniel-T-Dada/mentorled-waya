import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KidsLoadingSkeleton = () => {
    return (
        <>
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <Skeleton className="h-6 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                        </div>
                        <div className="text-center">
                            <Skeleton className="h-6 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                        </div>
                        <div className="text-center">
                            <Skeleton className="h-6 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-12 mx-auto" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                </Card>
            ))}
        </>
    );
};
