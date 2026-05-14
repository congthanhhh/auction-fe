import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MySessionsList from "@/components/auction/MySessionsList";
import { CreateProductDialog } from "@/components/auction/CreateProductDialog";
import { CreateSessionDialog } from "@/components/auction/CreateSessionDialog";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from "@/types/auction";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SimplePagination } from "@/components/common/SimplePagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel } from "lucide-react";
import { auctionStatusLabelKeys } from "@/types/auction-labels";

export default function MySessions() {
    const { t } = useTranslation();
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

    const fetchMySessions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await auctionService.getMySessions(
                page,
                size,
                statusFilter === "ALL" ? undefined : statusFilter,
            );
            setPageData(response);
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as Error).message)
                    : t("auction.sessions.loadError");
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [page, size, statusFilter, t]);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            if (!isActive) return;
            await fetchMySessions();
        };

        load();

        return () => {
            isActive = false;
        };
    }, [fetchMySessions]);

    const totalPages = pageData?.totalPages ?? 1;
    const totalElements = pageData?.totalElements ?? 0;

    const statusFilterOptions: { value: "ALL" | AuctionStatus; label: string }[] = [
        { value: "ALL", label: t("auction.sessions.all") },
        { value: "SCHEDULED", label: t(auctionStatusLabelKeys.SCHEDULED) },
        { value: "ACTIVE", label: t(auctionStatusLabelKeys.ACTIVE) },
        { value: "WAITING_PAYMENT", label: t(auctionStatusLabelKeys.WAITING_PAYMENT) },
        { value: "ENDED", label: t(auctionStatusLabelKeys.ENDED) },
        { value: "CANCELLED", label: t(auctionStatusLabelKeys.CANCELLED) },
        { value: "FAILED", label: t(auctionStatusLabelKeys.FAILED) },
    ];

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
                    data: prev.data.map((item) => (item.id === updatedSession.id ? updatedSession : item)),
                };
            });
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as Error).message)
                    : t("auction.sessions.updateStatusError");
            setError(message);
        }
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950">
            <div className="container mx-auto space-y-6 px-4">
                <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                <Gavel className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                                    {t("auction.sessions.title")}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {t("auction.sessions.description")}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="rounded-md border bg-slate-50 px-4 py-2 text-sm dark:bg-gray-950">
                                <span className="text-muted-foreground">{t("auction.sessions.total")}</span>
                                <span className="font-semibold text-foreground">{totalElements}</span>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <CreateProductDialog />
                                <CreateSessionDialog onCreated={fetchMySessions} />
                            </div>
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
                                className="min-h-9 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-950/40 dark:data-[state=active]:text-indigo-200"
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {isLoading && (
                    <p className="rounded-lg border bg-white p-4 text-sm text-muted-foreground dark:bg-gray-900">
                        {t("auction.sessions.loading")}
                    </p>
                )}
                {error && !isLoading && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                        {error}
                    </p>
                )}

                {!isLoading && !error && (
                    <MySessionsList
                        sessions={pageData?.data ?? []}
                        onToggleStatus={handleToggleStatus}
                        onSessionUpdated={fetchMySessions}
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
