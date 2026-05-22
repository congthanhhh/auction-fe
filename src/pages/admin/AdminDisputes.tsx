import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import { DisputeDecision, type DisputeDecision as DisputeDecisionType, type DisputeResponse } from "@/types/invoice";
import { formatAdminDate } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const DECISION_OPTIONS = Object.values(DisputeDecision);

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminDisputes() {
    const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
    const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);
    const [decision, setDecision] = useState<DisputeDecisionType | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedDispute(dispute)}>
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
        </div>
    );
}
