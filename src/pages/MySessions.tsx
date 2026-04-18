import { useEffect, useState } from "react";
import MySessionsList from "@/components/auction/MySessionsList";
import { CreateProductDialog } from "@/components/auction/CreateProductDialog";
import { CreateSessionDialog } from "@/components/auction/CreateSessionDialog";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimplePagination } from "@/components/common/SimplePagination";

const statusFilterOptions: { value: "ALL" | AuctionStatus; label: string }[] = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "SCHEDULED", label: "Chưa bắt đầu" },
    { value: "ACTIVE", label: "Đang diễn ra" },
    { value: "WAITING_PAYMENT", label: "Chờ thanh toán" },
    { value: "ENDED", label: "Đã kết thúc" },
    { value: "FAILED", label: "Không thành công" },
    { value: "CANCELLED", label: "Đã hủy" },
];

export default function MySessions() {
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

        const fetchMySessions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await auctionService.getMySessions(
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
                        : "Không thể tải danh sách phiên của bạn";
                setError(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMySessions();

        return () => {
            isMounted = false;
        };
    }, [page, size, statusFilter]);

    const totalPages = pageData?.totalPages ?? 1;

    const handleToggleStatus = async (session: AuctionSessionResponse) => {
        try {
            setError(null);

            let updatedSession: AuctionSessionResponse | null = null;

            if (session.status === "ACTIVE" || session.status === "SCHEDULED") {
                updatedSession = await auctionService.cancelSession(session.id);
            } else if (session.status === "CANCELLED") {
                updatedSession = await auctionService.reactivateSession(session.id);
            }

            if (!updatedSession) return;

            setPageData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    data: prev.data.map((s) => (s.id === updatedSession!.id ? updatedSession! : s)),
                };
            });
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as any).message)
                    : "Không thể cập nhật trạng thái phiên";
            setError(message);
        }
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Phiên đấu giá của tôi
                    </h1>
                    <div className="flex flex-wrap gap-3 text-sm items-center">
                        <div className="flex flex-col gap-1">
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
                        <CreateProductDialog />
                        <CreateSessionDialog />
                    </div>
                </div>

                {isLoading && (
                    <p className="text-sm text-muted-foreground">Đang tải danh sách phiên của bạn...</p>
                )}
                {error && !isLoading && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {!isLoading && !error && (
                    <MySessionsList
                        sessions={pageData?.data ?? []}
                        onToggleStatus={handleToggleStatus}
                    />
                )}

                {!isLoading && !error && totalPages > 1 && (
                    <div className="mt-4">
                        <SimplePagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
