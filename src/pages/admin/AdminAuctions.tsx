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
import { AuctionStatus, type AuctionStatus as AuctionStatusType } from "@/types/auction";
import type { AdminAuctionSessionResponse } from "@/types/admin";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const AUCTION_STATUS_OPTIONS = Object.values(AuctionStatus);

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminAuctions() {
    const [sessions, setSessions] = useState<AdminAuctionSessionResponse[]>([]);
    const [selectedSession, setSelectedSession] = useState<AdminAuctionSessionResponse | null>(null);
    const [productName, setProductName] = useState("");
    const [status, setStatus] = useState<AuctionStatusType | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedSession(session)}>
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
        </div>
    );
}
