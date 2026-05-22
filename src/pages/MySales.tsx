import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceList from "@/components/invoice/InvoiceList";
import { invoiceService } from "@/services/invoiceService";
import type { InvoicePageResponse, InvoiceStatus, InvoiceType, SellerRevenueResponse } from "@/types/invoice";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimplePagination } from "@/components/common/SimplePagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Store, Wallet } from "lucide-react";
import { invoiceStatusLabelKeys, invoiceTypeLabelKeys } from "@/types/invoice-labels";

export default function MySales() {
    const { t } = useTranslation();
    const requireAuth = useRequireAuth();

    const [pageData, setPageData] = useState<InvoicePageResponse | null>(null);
    const [sellerStats, setSellerStats] = useState<SellerRevenueResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(10);
    const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceStatus>("ALL");
    const [typeFilter, setTypeFilter] = useState<"ALL" | InvoiceType>("ALL");

    useEffect(() => {
        const allowed = requireAuth();
        if (!allowed) return;
    }, [requireAuth]);

    useEffect(() => {
        let isMounted = true;

        const fetchSales = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = {
                    page,
                    size,
                    status: statusFilter === "ALL" ? undefined : statusFilter,
                };

                const salesRequest =
                    typeFilter === "LISTING_FEE"
                        ? invoiceService.getMyListingFees(params)
                        : typeFilter === "AUCTION_SALE"
                            ? invoiceService.getMySales(params)
                            : invoiceService.getSoldInvoices(params);

                const [response, stats] = await Promise.all([
                    salesRequest,
                    invoiceService.getSellerStats(),
                ]);

                if (isMounted) {
                    setPageData(response);
                    setSellerStats(stats);
                }
            } catch (err) {
                if (!isMounted) return;
                const message =
                    err && typeof err === "object" && "message" in err
                        ? String((err as Error).message)
                        : t("invoice.list.loadSalesError");
                setError(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchSales();

        return () => {
            isMounted = false;
        };
    }, [page, size, statusFilter, typeFilter, t]);

    const statusFilterOptions: { value: "ALL" | InvoiceStatus; label: string }[] = [
        { value: "ALL", label: t("invoice.list.all") },
        { value: "PENDING", label: t(invoiceStatusLabelKeys.PENDING) },
        { value: "PAID", label: t(invoiceStatusLabelKeys.PAID) },
        { value: "SHIPPING", label: t(invoiceStatusLabelKeys.SHIPPING) },
        { value: "COMPLETED", label: t(invoiceStatusLabelKeys.COMPLETED) },
        { value: "DISPUTE", label: t(invoiceStatusLabelKeys.DISPUTE) },
        { value: "CANCELLED_NON_PAYMENT", label: t(invoiceStatusLabelKeys.CANCELLED_NON_PAYMENT) },
        { value: "CANCELLED_BY_SELLER", label: t(invoiceStatusLabelKeys.CANCELLED_BY_SELLER) },
        { value: "REFUNDED", label: t(invoiceStatusLabelKeys.REFUNDED) },
    ];

    const typeFilterOptions: { value: "ALL" | InvoiceType; label: string }[] = [
        { value: "ALL", label: t("invoice.list.allTypes") },
        { value: "AUCTION_SALE", label: t(invoiceTypeLabelKeys.AUCTION_SALE) },
        { value: "LISTING_FEE", label: t(invoiceTypeLabelKeys.LISTING_FEE) },
    ];

    const totalPages = pageData?.totalPages ?? 1;
    const totalElements = pageData?.totalElements ?? 0;

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950">
            <div className="container mx-auto space-y-6 px-4">
                <div className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                                <Store className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                                    {t("invoice.list.mySales")}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {t("invoice.list.salesDescription")}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="grid gap-2 sm:grid-cols-3">
                                <div className="flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm dark:bg-gray-950">
                                    <Receipt className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t("invoice.list.filteredOrders")}</p>
                                        <p className="font-semibold text-foreground">{totalElements}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm dark:bg-gray-950">
                                    <Store className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t("invoice.list.totalAuctionSessions")}</p>
                                        <p className="font-semibold text-foreground">{sellerStats?.totalAuctionSessions ?? "--"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm dark:bg-gray-950">
                                    <Wallet className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t("invoice.list.totalRevenue")}</p>
                                        <p className="font-semibold text-foreground">
                                            {sellerStats ? formatCurrency(sellerStats.totalRevenue) : "--"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value as "ALL" | InvoiceType);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger size="sm" className="w-full min-w-44 sm:w-auto">
                                    <SelectValue placeholder={t("invoice.list.filterType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeFilterOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Tabs
                    value={statusFilter}
                    onValueChange={(value) => {
                        setStatusFilter(value as "ALL" | InvoiceStatus);
                        setPage(1);
                    }}
                    className="w-full"
                >
                    <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border bg-white p-1 dark:bg-gray-900">
                        {statusFilterOptions.map((opt) => (
                            <TabsTrigger
                                key={opt.value}
                                value={opt.value}
                                className="min-h-9 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-950/40 dark:data-[state=active]:text-sky-200"
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {isLoading && (
                    <p className="rounded-lg border bg-white p-4 text-sm text-muted-foreground dark:bg-gray-900">
                        {t("invoice.list.loadingSales")}
                    </p>
                )}
                {error && !isLoading && (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                        {error}
                    </p>
                )}

                {!isLoading && !error && (
                    <InvoiceList invoices={pageData?.data ?? []} isSeller />
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
