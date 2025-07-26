import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface KidsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    goToPrevious?: () => void;
    goToNext?: () => void;
    tablet?: boolean;
}

const KidsPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    goToPrevious,
    goToNext,
    tablet,
}: KidsPaginationProps) => {
    if (totalPages <= 1) return null;

    const btnSize = tablet ? "lg" : "sm";
    const iconSize = tablet ? 20 : 16;
    const dotSize = tablet ? "w-3 h-3" : "w-2 h-2";

    // Always guard page bounds
    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className={`flex items-center justify-between ${tablet ? "py-4" : "py-2"} border-t`}>
            <Button
                variant="ghost"
                size={btnSize as any}
                onClick={goToPrevious ? goToPrevious : handlePrev}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
            >
                <ChevronLeft className={`h-${iconSize} w-${iconSize}`} />
                Previous
            </Button>

            <div className="flex items-center gap-2">
                <span className={`text-xs ${tablet ? "md:text-sm" : ""} text-muted-foreground`}>
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => onPageChange(index + 1)}
                            className={`
                                ${dotSize} rounded-full transition-colors
                                ${index + 1 === currentPage
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}
                            `}
                            aria-label={`Go to page ${index + 1}`}
                            aria-current={index + 1 === currentPage ? "page" : undefined}
                            title={`Page ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <Button
                variant="ghost"
                size={btnSize as any}
                onClick={goToNext ? goToNext : handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
            >
                Next
                <ChevronRight className={`h-${iconSize} w-${iconSize}`} />
            </Button>
        </div>
    );
};

export default KidsPagination;