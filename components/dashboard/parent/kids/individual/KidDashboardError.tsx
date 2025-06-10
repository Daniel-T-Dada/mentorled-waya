import { Button } from "@/components/ui/button";

interface KidDashboardErrorProps {
    message: string;
    onBack: () => void;
}

export const KidDashboardError = ({ message, onBack }: KidDashboardErrorProps) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Kid not found</h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <Button onClick={onBack}>
                    Back to Kids List
                </Button>
            </div>
        </div>
    );
};
