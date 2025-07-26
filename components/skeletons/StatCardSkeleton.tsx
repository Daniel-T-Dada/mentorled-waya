import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function StatCardSkeleton() {
    return (
        <Card className="min-h-[120px] animate-pulse">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-7 w-1/2 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-1/5 bg-gray-200 rounded" />
            </CardContent>
        </Card>
    );
}