import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateGoalSkeletonProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateGoalSkeleton({ isOpen, onClose }: CreateGoalSkeletonProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">
                        <Skeleton className="h-6 w-36 mx-auto" />
                    </DialogTitle>
                    <div className="text-center">
                        <Skeleton className="h-4 w-56 mx-auto" />
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-20 w-full" />
                    </div>

                    {/* Target Amount Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Deadline Picker */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Category Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex gap-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
