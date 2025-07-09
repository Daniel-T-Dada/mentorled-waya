"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface AddAllowanceSkeletonProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddAllowanceSkeleton({ isOpen, onClose }: AddAllowanceSkeletonProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">
                        <Skeleton className="h-7 w-40 mx-auto" />
                    </DialogTitle>
                    <div className="text-center">
                        <Skeleton className="h-4 w-56 mx-auto" />
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Child Selection */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <div className="relative">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Frequency Selection */}
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-32" />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
