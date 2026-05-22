import { useCallback, useEffect, useState } from "react";
import { Activity, Boxes, CircleDollarSign, Clock, Gavel, Receipt, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { AdminLogResponse, StatisticResponse } from "@/types/admin";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const metricIcons = {
    totalUsers: Users,
    activeAuctions: Gavel,
    pendingProducts: Boxes,
    totalRevenue: CircleDollarSign,
    totalGMV: Receipt,
    totalListingFee: Receipt,
    commissionRevenue: CircleDollarSign,
};

const metricLabels: Record<keyof StatisticResponse, string> = {
    totalUsers: "Total users",
    activeAuctions: "Active auctions",
    pendingProducts: "Pending products",
    totalRevenue: "Total revenue",
    totalGMV: "Total GMV",
    totalListingFee: "Listing fee",
    commissionRevenue: "Commission revenue",
};

const moneyMetrics = new Set<keyof StatisticResponse>([
    "totalRevenue",
    "totalGMV",
    "totalListingFee",
    "commissionRevenue",
]);

export default function AdminDashboard() {
    const [statistics, setStatistics] = useState<StatisticResponse | null>(null);
    const [logs, setLogs] = useState<AdminLogResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [statisticsResponse, logsResponse] = await Promise.all([
                adminService.getStatistics(),
                adminService.getLogs({ page: 1, size: 6 }),
            ]);
            setStatistics(statisticsResponse);
            setLogs(logsResponse.data ?? []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Admin overview is unavailable.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    if (isLoading) {
        return <AdminLoadingState title="Loading admin overview..." />;
    }

    if (error) {
        return <AdminErrorState description={error} onRetry={loadDashboard} />;
    }

    return (
        <div>
            <AdminPageHeader
                title="Overview"
                description="A compact operational snapshot of users, products, auctions, invoices, and revenue."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statistics &&
                    (Object.keys(metricLabels) as Array<keyof StatisticResponse>).map((key) => {
                        const Icon = metricIcons[key] ?? Activity;
                        const value = statistics[key];

                        return (
                            <Card key={key}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{metricLabels[key]}</CardTitle>
                                    <Icon className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">
                                        {moneyMetrics.has(key) ? formatAdminMoney(value) : value.toLocaleString("vi-VN")}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-4" />
                        Recent logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No recent logs.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, index) => (
                                    <TableRow key={String(log.id ?? index)}>
                                        <TableCell>{formatAdminDate(log.timestamp ?? log.createdAt)}</TableCell>
                                        <TableCell>{log.actor ?? "System"}</TableCell>
                                        <TableCell>{log.action ?? "N/A"}</TableCell>
                                        <TableCell>{log.target ?? "N/A"}</TableCell>
                                        <TableCell className="max-w-md truncate">{log.message ?? "N/A"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
