import { useEffect, useState } from "react";
import InvoiceList from "@/components/invoice/InvoiceList";
import { invoiceService } from "@/services/invoiceService";
import type { InvoicePageResponse, InvoiceStatus, InvoiceType } from "@/types/invoice";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SimplePagination } from "@/components/common/SimplePagination";

const statusFilterOptions: { value: "ALL" | InvoiceStatus; label: string }[] = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ thanh toán" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "DISPUTE", label: "Khiếu nại" },
    { value: "CANCELLED_NON_PAYMENT", label: "Hủy (bùng hàng)" },
    { value: "CANCELLED_BY_SELLER", label: "Hủy bởi người bán" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const typeFilterOptions: { value: "ALL" | InvoiceType; label: string }[] = [
    { value: "ALL", label: "Tất cả loại" },
    { value: "AUCTION_SALE", label: "Hóa đơn bán hàng" },
    { value: "LISTING_FEE", label: "Phí giá sàn" },
];

export default function MySales() {
    const requireAuth = useRequireAuth();

    const [pageData, setPageData] = useState<InvoicePageResponse | null>(null);
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
                const response = await invoiceService.getMySales({
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
                const message =
                    err && typeof err === "object" && "message" in err
                        ? String((err as any).message)
                        : "Không thể tải danh sách hóa đơn bán";
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
    }, [page, size, statusFilter, typeFilter]);

    const totalPages = pageData?.totalPages ?? 1;

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Đơn bán của tôi
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
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Loại hóa đơn</Label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value as any);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger size="sm" className="min-w-40">
                                    <SelectValue placeholder="Lọc theo loại" />
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
                    <p className="text-sm text-muted-foreground">Đang tải danh sách đơn bán...</p>
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
