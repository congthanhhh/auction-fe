import { useEffect, useState } from "react";
import MySessionsList from "@/components/auction/MySessionsList";
import { CreateProductDialog } from "@/components/auction/CreateProductDialog";
import { CreateSessionDialog } from "@/components/auction/CreateSessionDialog";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SimplePagination } from "@/components/common/SimplePagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel } from "lucide-react";

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
        <div className="bg-gray-50 dark:bg-gray-950 py-8 min-h-screen">
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand2/10 p-2 rounded-full">
                            <Gavel className="h-6 w-6 text-brand2" />
                        </div>
                        <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                            Quản lý Phiên Đấu Giá
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm items-center">
                        <CreateProductDialog />
                        <CreateSessionDialog />
                    </div>
                </div>

                <Tabs defaultValue="ALL" value={statusFilter} onValueChange={(value) => { setStatusFilter(value as any); setPage(1); }} className="w-full">
                    <TabsList className="w-full flex justify-start overflow-x-auto h-auto p-1 bg-white dark:bg-gray-900 border rounded-lg">
                        <TabsTrigger value="ALL" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Tất cả</TabsTrigger>
                        <TabsTrigger value="SCHEDULED" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Chưa bắt đầu</TabsTrigger>
                        <TabsTrigger value="ACTIVE" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Đang diễn ra</TabsTrigger>
                        <TabsTrigger value="WAITING_PAYMENT" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Chờ thanh toán</TabsTrigger>
                        <TabsTrigger value="ENDED" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Đã kết thúc</TabsTrigger>
                        <TabsTrigger value="CANCELLED" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Đã hủy</TabsTrigger>
                        <TabsTrigger value="FAILED" className="py-2.5 data-[state=active]:bg-brand2/10 data-[state=active]:text-brand2">Không thành công</TabsTrigger>
                    </TabsList>
                </Tabs>

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
