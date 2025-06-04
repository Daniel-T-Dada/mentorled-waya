
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const WalletLoading = () => {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-6 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
