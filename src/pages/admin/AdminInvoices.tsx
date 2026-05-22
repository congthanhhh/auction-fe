import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import { InvoiceStatus, InvoiceType, type InvoiceResponse, type InvoiceStatus as InvoiceStatusType, type InvoiceType as InvoiceTypeValue } from "@/types/invoice";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const INVOICE_STATUS_OPTIONS = Object.values(InvoiceStatus);
const INVOICE_TYPE_OPTIONS = Object.values(InvoiceType);

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<InvoiceStatusType | "ALL">("ALL");
    const [type, setType] = useState<InvoiceTypeValue | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadInvoices = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.searchInvoices({
                page,
                size: PAGE_SIZE,
                keyword: keyword.trim() || undefined,
                status: status === "ALL" ? undefined : status,
                type: type === "ALL" ? undefined : type,
            });
            setInvoices(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Invoice admin endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [keyword, page, status, type]);

    useEffect(() => {
        void loadInvoices();
    }, [loadInvoices]);

    return (
        <div>
            <AdminPageHeader
                title="Invoices"
                description="Search invoices and inspect payment, shipping, and recipient state."
                actions={
                    <Button variant="outline" onClick={() => void loadInvoices()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            <div className="mb-4 grid gap-3 rounded-md border bg-background p-4 lg:grid-cols-[1fr_220px_220px]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={keyword}
                        onChange={(event) => {
                            setKeyword(event.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                        placeholder="Search invoice, user, or product"
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value as InvoiceStatusType | "ALL");
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {INVOICE_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={type}
                    onValueChange={(value) => {
                        setType(value as InvoiceTypeValue | "ALL");
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All types</SelectItem>
                        {INVOICE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <AdminLoadingState title="Loading invoices..." />
            ) : error && invoices.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadInvoices} />
            ) : invoices.length === 0 ? (
                <AdminEmptyState title="No invoices found" />
            ) : (
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Buyer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">#{invoice.id}</p>
                                            <p className="text-xs text-muted-foreground">{invoice.type}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{invoice.user?.username ?? "N/A"}</TableCell>
                                    <TableCell>{invoice.product?.name ?? "N/A"}</TableCell>
                                    <TableCell>{formatAdminMoney(invoice.finalPrice)}</TableCell>
                                    <TableCell>
                                        <AdminStatusBadge value={invoice.status} />
                                    </TableCell>
                                    <TableCell>{formatAdminDate(invoice.dueDate)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedInvoice(invoice)}>
                                            <Eye className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <AdminPagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </div>
            )}

            <Sheet open={Boolean(selectedInvoice)} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Invoice #{selectedInvoice?.id}</SheetTitle>
                        <SheetDescription>Invoice payment and fulfillment details.</SheetDescription>
                    </SheetHeader>
                    {selectedInvoice && (
                        <div className="px-4 pb-6">
                            <AdminDetailRow label="Status">
                                <AdminStatusBadge value={selectedInvoice.status} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Type">{selectedInvoice.type}</AdminDetailRow>
                            <AdminDetailRow label="Buyer">{selectedInvoice.user?.username ?? "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Product">{selectedInvoice.product?.name ?? "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Final price">
                                {formatAdminMoney(selectedInvoice.finalPrice)}
                            </AdminDetailRow>
                            <AdminDetailRow label="Recipient">{selectedInvoice.recipientName}</AdminDetailRow>
                            <AdminDetailRow label="Phone">{selectedInvoice.recipientPhone}</AdminDetailRow>
                            <AdminDetailRow label="Shipping address">
                                {selectedInvoice.shippingAddress || "N/A"}
                            </AdminDetailRow>
                            <AdminDetailRow label="Tracking">
                                {selectedInvoice.trackingCode ?? "N/A"} {selectedInvoice.carrier ? `(${selectedInvoice.carrier})` : ""}
                            </AdminDetailRow>
                            <AdminDetailRow label="Created">{formatAdminDate(selectedInvoice.createdAt)}</AdminDetailRow>
                            <AdminDetailRow label="Due date">{formatAdminDate(selectedInvoice.dueDate)}</AdminDetailRow>
                            <AdminDetailRow label="Payment time">
                                {formatAdminDate(selectedInvoice.paymentTime)}
                            </AdminDetailRow>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
