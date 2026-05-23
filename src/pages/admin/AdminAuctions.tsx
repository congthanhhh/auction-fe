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
import { AuctionStatus, type AuctionStatus as AuctionStatusType } from "@/types/auction";
import type { AdminAuctionSessionResponse, AdminUpdateSessionRequest } from "@/types/admin";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const AUCTION_STATUS_OPTIONS = Object.values(AuctionStatus);

interface AuctionFormState {
    startTime: string;
    endTime: string;
    startPrice: string;
    reservePrice: string;
    buyNowPrice: string;
    status: AuctionStatusType;
}

function toDateTimeInput(value?: string | null): string {
    return value ? value.slice(0, 16) : "";
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminAuctions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [sessions, setSessions] = useState<AdminAuctionSessionResponse[]>([]);
    const [selectedSession, setSelectedSession] = useState<AdminAuctionSessionResponse | null>(null);
    const [editingSession, setEditingSession] = useState<AdminAuctionSessionResponse | null>(null);
    const [pendingUpdate, setPendingUpdate] = useState<AdminUpdateSessionRequest | null>(null);
    const [auctionForm, setAuctionForm] = useState<AuctionFormState>({
        startTime: "",
        endTime: "",
        startPrice: "",
        reservePrice: "",
        buyNowPrice: "",
        status: AuctionStatus.SCHEDULED,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productName, setProductName] = useState(searchParams.get("productName") ?? "");
    const [status, setStatus] = useState<AuctionStatusType | "ALL">((searchParams.get("status") as AuctionStatusType | null) ?? "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1") || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (page > 1) next.set("page", String(page));
        if (productName.trim()) next.set("productName", productName.trim());
        if (status !== "ALL") next.set("status", status);
        setSearchParams(next, { replace: true });
    }, [page, productName, setSearchParams, status]);

    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.searchAuctions({
                page,
                size: PAGE_SIZE,
                productName: productName.trim() || undefined,
                status: status === "ALL" ? undefined : status,
            });
            setSessions(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Auction admin endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [page, productName, status]);

    useEffect(() => {
        void loadSessions();
    }, [loadSessions]);

    const openEditDialog = (session: AdminAuctionSessionResponse) => {
        setEditingSession(session);
        setAuctionForm({
            startTime: toDateTimeInput(session.startTime),
            endTime: toDateTimeInput(session.endTime),
            startPrice: String(session.startPrice ?? ""),
            reservePrice: session.reservePrice == null ? "" : String(session.reservePrice),
            buyNowPrice: session.buyNowPrice == null ? "" : String(session.buyNowPrice),
            status: session.status,
        });
    };

    const performAuctionUpdate = async (payload: AdminUpdateSessionRequest) => {
        if (!editingSession) return;

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            await adminService.updateAuction(editingSession.id, payload);
            setSuccess(`Auction session #${editingSession.id} was updated.`);
            setEditingSession(null);
            setPendingUpdate(null);
            await loadSessions();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update auction session."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitAuctionForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingSession) return;

        const payload: AdminUpdateSessionRequest = {
            startTime: auctionForm.startTime || undefined,
            endTime: auctionForm.endTime || undefined,
            startPrice: auctionForm.startPrice ? Number(auctionForm.startPrice) : undefined,
            reservePrice: auctionForm.reservePrice ? Number(auctionForm.reservePrice) : undefined,
            buyNowPrice: auctionForm.buyNowPrice ? Number(auctionForm.buyNowPrice) : undefined,
            status: auctionForm.status,
        };

        if (editingSession.status === AuctionStatus.ACTIVE || auctionForm.status === AuctionStatus.CANCELLED) {
            setPendingUpdate(payload);
            return;
        }

        await performAuctionUpdate(payload);
    };

    return (
        <div>
            <AdminPageHeader
                title="Auction Sessions"
                description="Monitor and inspect scheduled, active, ended, and cancelled sessions."
                actions={
                    <Button variant="outline" onClick={() => void loadSessions()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            <div className="mb-4 flex flex-col gap-3 rounded-md border bg-background p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={productName}
                        onChange={(event) => {
                            setProductName(event.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                        placeholder="Search by product name"
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(value) => {
                        setStatus(value as AuctionStatusType | "ALL");
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-56">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {AUCTION_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <AdminLoadingState title="Loading auction sessions..." />
            ) : error && sessions.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadSessions} />
            ) : sessions.length === 0 ? (
                <AdminEmptyState title="No auction sessions found" />
            ) : (
                <>
                <AdminNotice tone="success" message={success} />
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Current price</TableHead>
                                <TableHead>Start</TableHead>
                                <TableHead>End</TableHead>
                                <TableHead>Highest bidder</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{session.product?.name ?? "N/A"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Seller: {session.product?.seller?.username ?? "N/A"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <AdminStatusBadge value={session.status} />
                                    </TableCell>
                                    <TableCell>{formatAdminMoney(session.currentPrice)}</TableCell>
                                    <TableCell>{formatAdminDate(session.startTime)}</TableCell>
                                    <TableCell>{formatAdminDate(session.endTime)}</TableCell>
                                    <TableCell>{session.highestBidder?.username ?? "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedSession(session)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(session)}>
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

            <Sheet open={Boolean(selectedSession)} onOpenChange={(open) => !open && setSelectedSession(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{selectedSession?.product?.name ?? "Auction session"}</SheetTitle>
                        <SheetDescription>Session details returned by the admin search endpoint.</SheetDescription>
                    </SheetHeader>
                    {selectedSession && (
                        <div className="px-4 pb-6">
                            <AdminDetailRow label="Status">
                                <AdminStatusBadge value={selectedSession.status} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Start time">{formatAdminDate(selectedSession.startTime)}</AdminDetailRow>
                            <AdminDetailRow label="End time">{formatAdminDate(selectedSession.endTime)}</AdminDetailRow>
                            <AdminDetailRow label="Start price">{formatAdminMoney(selectedSession.startPrice)}</AdminDetailRow>
                            <AdminDetailRow label="Current price">{formatAdminMoney(selectedSession.currentPrice)}</AdminDetailRow>
                            <AdminDetailRow label="Reserve price">{formatAdminMoney(selectedSession.reservePrice)}</AdminDetailRow>
                            <AdminDetailRow label="Buy now price">{formatAdminMoney(selectedSession.buyNowPrice)}</AdminDetailRow>
                            <AdminDetailRow label="Highest max bid">{formatAdminMoney(selectedSession.highestMaxBid)}</AdminDetailRow>
                            <AdminDetailRow label="Highest bidder">
                                {selectedSession.highestBidder?.username ?? "N/A"}
                            </AdminDetailRow>
                            <AdminDetailRow label="Created">{formatAdminDate(selectedSession.createdAt)}</AdminDetailRow>
                            <AdminDetailRow label="Updated">{formatAdminDate(selectedSession.updatedAt)}</AdminDetailRow>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={Boolean(editingSession)} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <form onSubmit={(event) => void submitAuctionForm(event)} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>Edit auction session</DialogTitle>
                            <DialogDescription>
                                Update session timing, prices, and status using the documented admin session payload.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="admin-auction-start">Start time</Label>
                                <Input
                                    id="admin-auction-start"
                                    type="datetime-local"
                                    value={auctionForm.startTime}
                                    onChange={(event) => setAuctionForm((current) => ({ ...current, startTime: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-auction-end">End time</Label>
                                <Input
                                    id="admin-auction-end"
                                    type="datetime-local"
                                    value={auctionForm.endTime}
                                    onChange={(event) => setAuctionForm((current) => ({ ...current, endTime: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-auction-start-price">Start price</Label>
                                <Input
                                    id="admin-auction-start-price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={auctionForm.startPrice}
                                    onChange={(event) => setAuctionForm((current) => ({ ...current, startPrice: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-auction-reserve-price">Reserve price</Label>
                                <Input
                                    id="admin-auction-reserve-price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={auctionForm.reservePrice}
                                    onChange={(event) => setAuctionForm((current) => ({ ...current, reservePrice: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-auction-buy-now-price">Buy now price</Label>
                                <Input
                                    id="admin-auction-buy-now-price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={auctionForm.buyNowPrice}
                                    onChange={(event) => setAuctionForm((current) => ({ ...current, buyNowPrice: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={auctionForm.status}
                                    onValueChange={(value) => setAuctionForm((current) => ({ ...current, status: value as AuctionStatusType }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AUCTION_STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingSession(null)}>
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
                title="Confirm auction update"
                description="This update may affect an active or cancelled auction workflow. The backend will enforce the final transition rules."
                confirmLabel="Update session"
                destructive={pendingUpdate?.status === AuctionStatus.CANCELLED}
                isSubmitting={isSubmitting}
                onOpenChange={(open) => !open && setPendingUpdate(null)}
                onConfirm={() => pendingUpdate && void performAuctionUpdate(pendingUpdate)}
            />
        </div>
    );
}
