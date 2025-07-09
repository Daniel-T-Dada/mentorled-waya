import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateKidAccountSkeletonProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateKidAccountSkeleton({ isOpen, onClose }: CreateKidAccountSkeletonProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>
                        <Skeleton className="h-6 w-48" />
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Username field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* PIN field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Avatar upload */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                    </div>
                </div>

                <DialogFooter>
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
