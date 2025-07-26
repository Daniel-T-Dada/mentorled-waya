import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
    showPageNumbers?: boolean // optional: show 1 2 3 ... links
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    totalPages,
    onPageChange,
    className = "",
    showPageNumbers = true,
}) => {
    // Helper: generate page numbers to display (with ellipsis for large sets)
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (page <= 3) {
                pages.push(1, 2, 3, "ellipsis", totalPages)
            } else if (page >= totalPages - 2) {
                pages.push(1, "ellipsis")
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages)
            }
        }
        return pages
    }

    return (
        <nav
            className={`flex items-center justify-center gap-2 mt-4 select-none ${className}`}
            aria-label="Pagination"
        >
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>
            {showPageNumbers &&
                getPageNumbers().map((p, i) =>
                    p === "ellipsis" ? (
                        <span key={i} className="px-2 text-muted-foreground">&hellip;</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "ghost"}
                            size="icon"
                            className={`w-8 h-8 p-0 ${p === page ? "font-bold" : ""}`}
                            onClick={() => onPageChange(Number(p))}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </Button>
                    )
                )}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </nav>
    )
}

export default Pagination