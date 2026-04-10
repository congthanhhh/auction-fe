import { useEffect, useState } from "react";
import MyJoinedList from "@/components/auction/MyJoinedList";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const statusFilterOptions: { value: "ALL" | AuctionStatus; label: string }[] = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "SCHEDULED", label: "Chưa bắt đầu" },
    { value: "ACTIVE", label: "Đang diễn ra" },
    { value: "WAITING_PAYMENT", label: "Chờ thanh toán" },
    { value: "ENDED", label: "Đã kết thúc" },
    { value: "FAILED", label: "Không thành công" },
    { value: "CANCELLED", label: "Đã hủy" },
];

export default function MyJoinedAuctions() {
    const requireAuth = useRequireAuth();

    const [pageData, setPageData] = useState<PageResponse<AuctionSessionResponse> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(10);
    const [statusFilter, setStatusFilter] = useState<"ALL" | AuctionStatus>("ALL");

    useEffect(() => {
        const allowed = requireAuth();
        if (!allowed) return;
    }, [requireAuth]);

    useEffect(() => {
        let isMounted = true;

        const fetchMyJoined = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await auctionService.getMyJoinedSessions(
                    page,
                    size,
                    statusFilter === "ALL" ? undefined : statusFilter,
                );

                if (isMounted) {
                    setPageData(response);
                }
            } catch (err) {
                if (!isMounted) return;
                const message =
                    err && typeof err === "object" && "message" in err
                        ? String((err as any).message)
                        : "Không thể tải danh sách phiên đã tham gia";
                setError(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMyJoined();

        return () => {
            isMounted = false;
        };
    }, [page, size, statusFilter]);

    const totalPages = pageData?.totalPages ?? 1;
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    const handlePrev = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!canGoPrev) return;
        setPage((prev) => Math.max(1, prev - 1));
    };

    const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!canGoNext) return;
        setPage((prev) => prev + 1);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Phiên đấu giá đã tham gia
                    </h1>
                    <div className="flex flex-wrap gap-3 text-sm items-center">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as any);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger size="sm" className="min-w-40">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusFilterOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <p className="text-sm text-muted-foreground">Đang tải danh sách phiên đã tham gia...</p>
                )}
                {error && !isLoading && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {!isLoading && !error && (
                    <MyJoinedList sessions={pageData?.data ?? []} />
                )}

                {!isLoading && !error && totalPages > 1 && (
                    <div className="mt-4">
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
                    </div>
                )}
            </div>
        </div>
    );
}
