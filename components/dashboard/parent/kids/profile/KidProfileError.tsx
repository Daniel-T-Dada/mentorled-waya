import { Button } from "@/components/ui/button";

interface KidProfileErrorProps {
    onBack: () => void;
}

export const KidProfileError = ({ onBack }: KidProfileErrorProps) => {
    return (
        <div className="container mx-auto p-4">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kid Not Found</h2>
                <p className="text-gray-600 mb-4">The kid profile you&apos;re looking for doesn&apos;t exist.</p>
                <Button onClick={onBack}>
                    Back to Kids
                </Button>
            </div>
        </div>
    );
};
