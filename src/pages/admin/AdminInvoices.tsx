import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Pencil, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminNotice } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { AdminUpdateInvoiceRequest } from "@/types/admin";
import { InvoiceStatus, InvoiceType, type InvoiceResponse, type InvoiceStatus as InvoiceStatusType, type InvoiceType as InvoiceTypeValue } from "@/types/invoice";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const INVOICE_STATUS_OPTIONS = Object.values(InvoiceStatus);
const INVOICE_TYPE_OPTIONS = Object.values(InvoiceType);

interface InvoiceFormState {
    status: InvoiceStatusType;
    trackingCode: string;
    carrier: string;
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    note: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminInvoices() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceResponse | null>(null);
    const [pendingUpdate, setPendingUpdate] = useState<AdminUpdateInvoiceRequest | null>(null);
    const [invoiceForm, setInvoiceForm] = useState<InvoiceFormState>({
        status: InvoiceStatus.PENDING,
        trackingCode: "",
        carrier: "",
        recipientName: "",
        recipientPhone: "",
        shippingAddress: "",
        note: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
    const [status, setStatus] = useState<InvoiceStatusType | "ALL">((searchParams.get("status") as InvoiceStatusType | null) ?? "ALL");
    const [type, setType] = useState<InvoiceTypeValue | "ALL">((searchParams.get("type") as InvoiceTypeValue | null) ?? "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1") || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (page > 1) next.set("page", String(page));
        if (keyword.trim()) next.set("keyword", keyword.trim());
        if (status !== "ALL") next.set("status", status);
        if (type !== "ALL") next.set("type", type);
        setSearchParams(next, { replace: true });
    }, [keyword, page, setSearchParams, status, type]);

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

    const openEditDialog = (invoice: InvoiceResponse) => {
        setEditingInvoice(invoice);
        setInvoiceForm({
            status: invoice.status,
            trackingCode: invoice.trackingCode ?? "",
            carrier: invoice.carrier ?? "",
            recipientName: invoice.recipientName ?? "",
            recipientPhone: invoice.recipientPhone ?? "",
            shippingAddress: invoice.shippingAddress ?? "",
            note: "",
        });
    };

    const performInvoiceUpdate = async (payload: AdminUpdateInvoiceRequest) => {
        if (!editingInvoice) return;

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            await adminService.updateInvoice(editingInvoice.id, payload);
            setSuccess(`Invoice #${editingInvoice.id} was updated.`);
            setEditingInvoice(null);
            setPendingUpdate(null);
            await loadInvoices();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update invoice."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitInvoiceForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingInvoice) return;

        const payload: AdminUpdateInvoiceRequest = {
            status: invoiceForm.status,
            trackingCode: invoiceForm.trackingCode.trim(),
            carrier: invoiceForm.carrier.trim(),
            recipientName: invoiceForm.recipientName.trim(),
            recipientPhone: invoiceForm.recipientPhone.trim(),
            shippingAddress: invoiceForm.shippingAddress.trim(),
            note: invoiceForm.note.trim() || undefined,
        };

        setPendingUpdate(payload);
    };

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
                <>
                <AdminNotice tone="success" message={success} />
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
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedInvoice(invoice)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(invoice)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                        </div>
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
                </>
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

            <Dialog open={Boolean(editingInvoice)} onOpenChange={(open) => !open && setEditingInvoice(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <form onSubmit={(event) => void submitInvoiceForm(event)} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>Edit invoice</DialogTitle>
                            <DialogDescription>
                                Update fulfillment and invoice state using the documented admin invoice payload.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={invoiceForm.status}
                                    onValueChange={(value) => setInvoiceForm((current) => ({ ...current, status: value as InvoiceStatusType }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INVOICE_STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-invoice-carrier">Carrier</Label>
                                <Input
                                    id="admin-invoice-carrier"
                                    value={invoiceForm.carrier}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, carrier: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-invoice-tracking">Tracking code</Label>
                                <Input
                                    id="admin-invoice-tracking"
                                    value={invoiceForm.trackingCode}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, trackingCode: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-invoice-recipient">Recipient</Label>
                                <Input
                                    id="admin-invoice-recipient"
                                    value={invoiceForm.recipientName}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, recipientName: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-invoice-phone">Phone</Label>
                                <Input
                                    id="admin-invoice-phone"
                                    value={invoiceForm.recipientPhone}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, recipientPhone: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="admin-invoice-address">Shipping address</Label>
                                <Input
                                    id="admin-invoice-address"
                                    value={invoiceForm.shippingAddress}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, shippingAddress: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="admin-invoice-note">Note</Label>
                                <textarea
                                    id="admin-invoice-note"
                                    value={invoiceForm.note}
                                    onChange={(event) => setInvoiceForm((current) => ({ ...current, note: event.target.value }))}
                                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingInvoice(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AdminConfirmDialog
                open={Boolean(pendingUpdate)}
                title="Confirm invoice update"
                description="Invoice status, shipping, and recipient changes can affect fulfillment and payment workflows."
                confirmLabel="Update invoice"
                destructive={pendingUpdate?.status === InvoiceStatus.REFUNDED || pendingUpdate?.status === InvoiceStatus.CANCELLED_BY_SELLER}
                isSubmitting={isSubmitting}
                onOpenChange={(open) => !open && setPendingUpdate(null)}
                onConfirm={() => pendingUpdate && void performInvoiceUpdate(pendingUpdate)}
            />
        </div>
    );
}
