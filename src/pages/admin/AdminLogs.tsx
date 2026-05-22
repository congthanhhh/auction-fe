import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { AdminLogResponse } from "@/types/admin";
import { formatAdminDate } from "@/utils/admin-format";

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminLogs() {
    const [logs, setLogs] = useState<AdminLogResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.getLogs({ page, size: PAGE_SIZE });
            setLogs(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Admin logs endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    return (
        <div>
            <AdminPageHeader
                title="Logs"
                description="Read-only audit activity from the admin logs endpoint."
                actions={
                    <Button variant="outline" onClick={() => void loadLogs()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            {isLoading ? (
                <AdminLoadingState title="Loading logs..." />
            ) : error && logs.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadLogs} />
            ) : logs.length === 0 ? (
                <AdminEmptyState title="No logs found" />
            ) : (
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log, index) => (
                                <TableRow key={String(log.id ?? index)}>
                                    <TableCell>{formatAdminDate(log.timestamp ?? log.createdAt)}</TableCell>
                                    <TableCell>{log.actor ?? "System"}</TableCell>
                                    <TableCell>{log.action ?? "N/A"}</TableCell>
                                    <TableCell>{log.target ?? "N/A"}</TableCell>
                                    <TableCell>
                                        <AdminStatusBadge value={log.status ?? log.severity ?? "INFO"} />
                                    </TableCell>
                                    <TableCell className="max-w-xl truncate">{log.message ?? "N/A"}</TableCell>
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
        </div>
    );
}
