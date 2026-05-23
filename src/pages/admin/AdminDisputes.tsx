import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Gavel, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import type { ResolveDisputeRequest } from "@/types/admin";
import { DisputeDecision, type DisputeDecision as DisputeDecisionType, type DisputeResponse } from "@/types/invoice";
import { formatAdminDate } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const DECISION_OPTIONS = Object.values(DisputeDecision);

interface ResolveFormState {
    decision: DisputeDecisionType;
    adminNote: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminDisputes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);
    const [resolvingDispute, setResolvingDispute] = useState<DisputeResponse | null>(null);
    const [pendingResolve, setPendingResolve] = useState<ResolveDisputeRequest | null>(null);
    const [resolveForm, setResolveForm] = useState<ResolveFormState>({
        decision: DisputeDecision.REFUND_TO_BUYER,
        adminNote: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [decision, setDecision] = useState<DisputeDecisionType | "ALL">((searchParams.get("decision") as DisputeDecisionType | null) ?? "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1") || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (page > 1) next.set("page", String(page));
        if (decision !== "ALL") next.set("decision", decision);
        setSearchParams(next, { replace: true });
    }, [decision, page, setSearchParams]);

    const loadDisputes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.searchDisputes({
                page,
                size: PAGE_SIZE,
                decision: decision === "ALL" ? undefined : decision,
            });
            setDisputes(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Dispute admin endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [decision, page]);

    useEffect(() => {
        void loadDisputes();
    }, [loadDisputes]);

    const openResolveDialog = (dispute: DisputeResponse) => {
        setResolvingDispute(dispute);
        setResolveForm({
            decision: dispute.decision === DisputeDecision.PENDING ? DisputeDecision.REFUND_TO_BUYER : dispute.decision,
            adminNote: dispute.adminNote ?? "",
        });
    };

    const performResolve = async (payload: ResolveDisputeRequest) => {
        if (!resolvingDispute) return;

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            await adminService.resolveDispute(resolvingDispute.id, payload);
            setSuccess(`Dispute #${resolvingDispute.id} was resolved as ${payload.decision}.`);
            setResolvingDispute(null);
            setPendingResolve(null);
            await loadDisputes();
        } catch (err) {
            setError(getErrorMessage(err, "Could not resolve dispute."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitResolveForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPendingResolve({
            decision: resolveForm.decision,
            adminNote: resolveForm.adminNote.trim() || undefined,
        });
    };

    return (
        <div>
            <AdminPageHeader
                title="Disputes"
                description="Review dispute queue and resolution outcomes."
                actions={
                    <Button variant="outline" onClick={() => void loadDisputes()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            <div className="mb-4 flex rounded-md border bg-background p-4">
                <Select
                    value={decision}
                    onValueChange={(value) => {
                        setDecision(value as DisputeDecisionType | "ALL");
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Decision" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All decisions</SelectItem>
                        {DECISION_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <AdminLoadingState title="Loading disputes..." />
            ) : error && disputes.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadDisputes} />
            ) : disputes.length === 0 ? (
                <AdminEmptyState title="No disputes found" />
            ) : (
                <>
                <AdminNotice tone="success" message={success} />
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dispute</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Decision</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Resolved</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {disputes.map((dispute) => (
                                <TableRow key={dispute.id}>
                                    <TableCell>
                                        <p className="font-medium">#{dispute.id}</p>
                                        <p className="max-w-md truncate text-xs text-muted-foreground">{dispute.reason}</p>
                                    </TableCell>
                                    <TableCell>#{dispute.invoiceId}</TableCell>
                                    <TableCell>
                                        <AdminStatusBadge value={dispute.decision} />
                                    </TableCell>
                                    <TableCell>{formatAdminDate(dispute.createdAt)}</TableCell>
                                    <TableCell>{formatAdminDate(dispute.resolvedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedDispute(dispute)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openResolveDialog(dispute)}>
                                                <Gavel className="size-4" />
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

            <Sheet open={Boolean(selectedDispute)} onOpenChange={(open) => !open && setSelectedDispute(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Dispute #{selectedDispute?.id}</SheetTitle>
                        <SheetDescription>Dispute details and resolution note.</SheetDescription>
                    </SheetHeader>
                    {selectedDispute && (
                        <div className="px-4 pb-6">
                            <AdminDetailRow label="Invoice">#{selectedDispute.invoiceId}</AdminDetailRow>
                            <AdminDetailRow label="Decision">
                                <AdminStatusBadge value={selectedDispute.decision} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Reason">
                                <p className="whitespace-pre-wrap">{selectedDispute.reason}</p>
                            </AdminDetailRow>
                            <AdminDetailRow label="Admin note">
                                <p className="whitespace-pre-wrap">{selectedDispute.adminNote ?? "N/A"}</p>
                            </AdminDetailRow>
                            <AdminDetailRow label="Created">{formatAdminDate(selectedDispute.createdAt)}</AdminDetailRow>
                            <AdminDetailRow label="Resolved">{formatAdminDate(selectedDispute.resolvedAt)}</AdminDetailRow>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={Boolean(resolvingDispute)} onOpenChange={(open) => !open && setResolvingDispute(null)}>
                <DialogContent>
                    <form onSubmit={(event) => void submitResolveForm(event)} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>Resolve dispute #{resolvingDispute?.id}</DialogTitle>
                            <DialogDescription>
                                Submit a documented dispute decision and optional admin note.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Decision</Label>
                                <Select
                                    value={resolveForm.decision}
                                    onValueChange={(value) => setResolveForm((current) => ({ ...current, decision: value as DisputeDecisionType }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Decision" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DECISION_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-dispute-note">Admin note</Label>
                                <textarea
                                    id="admin-dispute-note"
                                    value={resolveForm.adminNote}
                                    onChange={(event) => setResolveForm((current) => ({ ...current, adminNote: event.target.value }))}
                                    className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setResolvingDispute(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Resolving..." : "Resolve"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AdminConfirmDialog
                open={Boolean(pendingResolve)}
                title="Confirm dispute resolution"
                description="Resolving a dispute can affect invoice settlement. The backend will enforce the final outcome rules."
                confirmLabel="Resolve dispute"
                destructive={pendingResolve?.decision === DisputeDecision.REFUND_TO_BUYER}
                isSubmitting={isSubmitting}
                onOpenChange={(open) => !open && setPendingResolve(null)}
                onConfirm={() => pendingResolve && void performResolve(pendingResolve)}
            />
        </div>
    );
}
