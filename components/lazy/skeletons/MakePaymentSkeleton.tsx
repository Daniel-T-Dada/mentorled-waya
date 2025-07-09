import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MakePaymentSkeletonProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MakePaymentSkeleton({ isOpen, onClose }: MakePaymentSkeletonProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">
                        <Skeleton className="h-6 w-32 mx-auto" />
                    </DialogTitle>
                    <div className="text-center">
                        <Skeleton className="h-4 w-48 mx-auto" />
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Kid's Name Select */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Chore/Activity Select */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* PIN Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
