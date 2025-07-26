import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AlertTriangle } from "lucide-react";

export default function StatCardError({ message }: { message?: string }) {
    return (
        <Card className="min-h-[120px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground leading-tight flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={16} />
                    Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-red-600">{message || 'Failed to load'}</div>
            </CardContent>
        </Card>
    );
}