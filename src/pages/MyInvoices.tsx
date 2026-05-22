import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceList from "@/components/invoice/InvoiceList";
import { invoiceService } from "@/services/invoiceService";
import type { InvoicePageResponse, InvoiceStatus, InvoiceType } from "@/types/invoice";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SimplePagination } from "@/components/common/SimplePagination";
import { invoiceStatusLabelKeys, invoiceTypeLabelKeys } from "@/types/invoice-labels";

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) {
            return message;
        }
    }

    return fallback;
}

export default function MyInvoices() {
    const { t } = useTranslation();
    const requireAuth = useRequireAuth();

    const [pageData, setPageData] = useState<InvoicePageResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(10);
    const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceStatus>("ALL");
    const [typeFilter, setTypeFilter] = useState<"ALL" | InvoiceType>("ALL");

    useEffect(() => {
        // Ensure user is authenticated before loading invoices
        const allowed = requireAuth();
        if (!allowed) return;
    }, [requireAuth]);

    useEffect(() => {
        let isMounted = true;

        const fetchInvoices = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await invoiceService.getMyInvoices({
                    page,
                    size,
                    status: statusFilter === "ALL" ? undefined : statusFilter,
                    type: typeFilter === "ALL" ? undefined : typeFilter,
                });

                if (isMounted) {
                    setPageData(response);
                }
            } catch (err) {
                if (!isMounted) return;
                setError(getErrorMessage(err, t("invoice.list.loadOrdersError")));
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchInvoices();

        return () => {
            isMounted = false;
        };
    }, [page, size, statusFilter, typeFilter, t]);

    const statusFilterOptions: { value: "ALL" | InvoiceStatus; label: string }[] = [
        { value: "ALL", label: t("invoice.list.allStatuses") },
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

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        {t("invoice.list.myOrders")}
                    </h1>
                    <div className="flex flex-wrap gap-3 text-sm items-center">
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">{t("invoice.list.status")}</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as "ALL" | InvoiceStatus);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger size="sm" className="min-w-40">
                                    <SelectValue placeholder={t("invoice.list.filterStatus")} />
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
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">{t("invoice.list.type")}</Label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value as "ALL" | InvoiceType);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger size="sm" className="min-w-40">
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

                {isLoading && (
                    <p className="text-sm text-muted-foreground">{t("invoice.list.loadingOrders")}</p>
                )}
                {error && !isLoading && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {!isLoading && !error && (
                    <InvoiceList invoices={pageData?.data ?? []} />
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
