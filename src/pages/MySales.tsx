import { useEffect, useState } from "react";
import InvoiceList from "@/components/invoice/InvoiceList";
import { invoiceService } from "@/services/invoiceService";
import type { InvoicePageResponse, InvoiceStatus, InvoiceType } from "@/types/invoice";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimplePagination } from "@/components/common/SimplePagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store } from "lucide-react";

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
        <div className="bg-gray-50 dark:bg-gray-950 py-8 min-h-screen">
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand/10 p-2 rounded-full">
                            <Store className="h-6 w-6 text-brand" />
                        </div>
                        <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                            Quản lý Đơn Bán
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm items-center">
                        <div className="flex flex-col gap-1">
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

                <Tabs defaultValue="ALL" value={statusFilter} onValueChange={(value) => { setStatusFilter(value as any); setPage(1); }} className="w-full">
                    <TabsList className="w-full flex justify-start overflow-x-auto h-auto p-1 bg-white dark:bg-gray-900 border rounded-lg">
                        <TabsTrigger value="ALL" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Tất cả</TabsTrigger>
                        <TabsTrigger value="PENDING" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Chờ thanh toán</TabsTrigger>
                        <TabsTrigger value="PAID" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Chờ giao hàng</TabsTrigger>
                        <TabsTrigger value="SHIPPING" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Đang giao</TabsTrigger>
                        <TabsTrigger value="COMPLETED" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Hoàn thành</TabsTrigger>
                        <TabsTrigger value="DISPUTE" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Khiếu nại</TabsTrigger>
                        <TabsTrigger value="CANCELLED_NON_PAYMENT" className="py-2.5 data-[state=active]:bg-brand/10 data-[state=active]:text-brand">Đã hủy</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoading && (
                    <p className="text-sm text-muted-foreground">Đang tải danh sách đơn bán...</p>
                )}
                {error && !isLoading && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {!isLoading && !error && (
                    <InvoiceList invoices={pageData?.data ?? []} isSeller={true} />
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
