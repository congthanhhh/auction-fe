import { useEffect, useState } from "react";
import MyJoinedList from "@/components/auction/MyJoinedList";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SimplePagination } from "@/components/common/SimplePagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeDollarSign } from "lucide-react";
import { auctionStatusLabels } from "@/types/auction-labels";

const statusFilterOptions: { value: "ALL" | AuctionStatus; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "ACTIVE", label: auctionStatusLabels.ACTIVE },
    { value: "WAITING_PAYMENT", label: auctionStatusLabels.WAITING_PAYMENT },
    { value: "SCHEDULED", label: auctionStatusLabels.SCHEDULED },
    { value: "ENDED", label: auctionStatusLabels.ENDED },
    { value: "FAILED", label: auctionStatusLabels.FAILED },
    { value: "CANCELLED", label: auctionStatusLabels.CANCELLED },
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
                        ? String((err as Error).message)
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
    const totalElements = pageData?.totalElements ?? 0;

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950">
            <div className="container mx-auto space-y-6 px-4">
                <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <BadgeDollarSign className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                                    Phiên đấu giá đã tham gia
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Theo dõi giá hiện tại, giá tối đa của bạn và phiên cần thanh toán.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-md border bg-slate-50 px-4 py-2 text-sm dark:bg-gray-950">
                            <span className="text-muted-foreground">Tổng phiên: </span>
                            <span className="font-semibold text-foreground">{totalElements}</span>
                        </div>
                    </div>
                </div>

                <Tabs
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value as "ALL" | AuctionStatus);
                        setPage(1);
                    }}
                    className="w-full"
                >
                    <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border bg-white p-1 dark:bg-gray-900">
                        {statusFilterOptions.map((opt) => (
                            <TabsTrigger
                                key={opt.value}
                                value={opt.value}
                                className="min-h-9 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-950/40 dark:data-[state=active]:text-emerald-200"
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {isLoading && (
                    <p className="rounded-lg border bg-white p-4 text-sm text-muted-foreground dark:bg-gray-900">
                        Đang tải danh sách phiên đã tham gia...
                    </p>
                )}
                {error && !isLoading && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                        {error}
                    </p>
                )}

                {!isLoading && !error && (
                    <MyJoinedList sessions={pageData?.data ?? []} />
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
