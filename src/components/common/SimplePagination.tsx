import type React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface SimplePaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function SimplePagination({ page, totalPages, onPageChange }: SimplePaginationProps) {
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    const handlePrev = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!canGoPrev) return;
        onPageChange(page - 1);
    };

    const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!canGoNext) return;
        onPageChange(page + 1);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={handlePrev}
                        className={!canGoPrev ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
                <PaginationItem>
                    <span className="px-3 text-xs text-muted-foreground">
                        Trang {page} / {totalPages}
                    </span>
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={handleNext}
                        className={!canGoNext ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
