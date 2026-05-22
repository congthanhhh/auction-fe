import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
    currentPage: number;
    totalPages: number;
    totalElements?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
}

export function AdminPagination({
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
}: AdminPaginationProps) {
    const safeCurrentPage = Math.max(currentPage, 1);
    const safeTotalPages = Math.max(totalPages, 1);

    return (
        <div className="flex flex-col gap-3 border-t bg-background px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
                Page {safeCurrentPage} of {safeTotalPages}
                {typeof totalElements === "number" && `, ${totalElements} records`}
                {typeof pageSize === "number" && `, ${pageSize} per page`}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => onPageChange(safeCurrentPage - 1)}
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={safeCurrentPage >= safeTotalPages}
                    onClick={() => onPageChange(safeCurrentPage + 1)}
                >
                    Next
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
