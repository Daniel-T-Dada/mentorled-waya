import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import type { ProgressErrorProps } from './types';

export const ProgressError = ({ onRetry }: ProgressErrorProps) => {
    const router = useRouter();

    return (
        <div className="container mx-auto p-4">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Kid Not Found</h2>
                <p className="text-gray-600 mb-4">The kid profile you&apos;re looking for doesn&apos;t exist.</p>
                <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={onRetry}>
                        Try Again
                    </Button>
                    <Button onClick={() => router.push('/dashboard/parents/kids')}>
                        Back to Kids
                    </Button>
                </div>
            </div>
        </div>
    );
};
