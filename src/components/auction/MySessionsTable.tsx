import { useTranslation } from "react-i18next";
import type { AuctionSessionResponse } from "@/types/auction";
import type { InvoiceResponse } from "@/types/invoice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { SessionActions } from "@/components/auction/SessionActions";
import { SessionImage } from "@/components/auction/SessionImage";
import { SessionStatusBadge } from "@/components/auction/SessionStatusBadge";
import { formatSessionDateTime } from "@/components/auction/session-list-utils";

interface MySessionsTableProps {
    sessions: AuctionSessionResponse[];
    bidCounts: Record<number, number>;
    togglingId: number | null;
    listingFeeInvoicesBySessionId?: Record<number, InvoiceResponse>;
    isLoadingListingFeeInvoices?: boolean;
    onView: (session: AuctionSessionResponse) => void;
    onOpenListingFeeInvoice: (invoice: InvoiceResponse) => void;
    onToggleStatus?: (session: AuctionSessionResponse) => Promise<void> | void;
    onSessionUpdated?: () => Promise<void> | void;
}

export function MySessionsTable({
    sessions,
    bidCounts,
    togglingId,
    listingFeeInvoicesBySessionId = {},
    isLoadingListingFeeInvoices,
    onView,
    onOpenListingFeeInvoice,
    onToggleStatus,
    onSessionUpdated,
}: MySessionsTableProps) {
    const { t } = useTranslation();

    return (
        <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-gray-900 lg:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("auction.sessions.sessionCode")}</TableHead>
                        <TableHead>{t("auction.sessions.product")}</TableHead>
                        <TableHead>{t("auction.sessions.startPrice")}</TableHead>
                        <TableHead>{t("auction.sessions.currentPrice")}</TableHead>
                        <TableHead>{t("auction.sessions.buyNowPrice")}</TableHead>
                        <TableHead>{t("auction.sessions.winner")}</TableHead>
                        <TableHead>{t("auction.sessions.status")}</TableHead>
                        <TableHead>{t("auction.sessions.start")}</TableHead>
                        <TableHead>{t("auction.sessions.end")}</TableHead>
                        <TableHead className="text-right">{t("auction.sessions.actions")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => {
                        const bidCount = bidCounts[session.product.id] ?? 0;

                        return (
                            <TableRow key={session.id} className="align-middle hover:bg-muted/50">
                                <TableCell className="font-mono text-xs text-muted-foreground">#{session.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <SessionImage session={session} />
                                        <div className="min-w-0 space-y-0.5">
                                            <button
                                                type="button"
                                                onClick={() => onView(session)}
                                                className="block max-w-52 truncate text-left text-sm font-medium text-foreground hover:underline"
                                            >
                                                {session.product.name}
                                            </button>
                                            <p className="text-xs text-muted-foreground">
                                                {t("auction.sessions.bidCount", { count: bidCount })}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{formatCurrency(session.startPrice)}</TableCell>
                                <TableCell className="text-sm font-semibold">{formatCurrency(session.currentPrice)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {session.buyNowPrice != null ? formatCurrency(session.buyNowPrice) : "--"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{session.highestBidder?.username ?? "--"}</TableCell>
                                <TableCell>
                                    <SessionStatusBadge
                                        session={session}
                                        listingFeeInvoice={listingFeeInvoicesBySessionId[session.id]}
                                        isLoadingListingFeeInvoices={isLoadingListingFeeInvoices}
                                        onOpenListingFeeInvoice={onOpenListingFeeInvoice}
                                    />
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatSessionDateTime(session.startTime)}</TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatSessionDateTime(session.endTime)}</TableCell>
                                <TableCell className="text-right">
                                    <SessionActions
                                        session={session}
                                        bidCount={bidCount}
                                        togglingId={togglingId}
                                        compactLabels
                                        onView={onView}
                                        onToggleStatus={onToggleStatus}
                                        onSessionUpdated={onSessionUpdated}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
