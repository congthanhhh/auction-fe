import { useTranslation } from "react-i18next";
import type { AuctionSessionResponse } from "@/types/auction";
import type { InvoiceResponse } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock } from "lucide-react";
import { SessionActions } from "@/components/auction/SessionActions";
import { SessionImage } from "@/components/auction/SessionImage";
import { SessionStatusBadge } from "@/components/auction/SessionStatusBadge";
import { formatSessionDateTime } from "@/components/auction/session-list-utils";

interface MySessionMobileCardProps {
    session: AuctionSessionResponse;
    bidCount: number;
    togglingId: number | null;
    listingFeeInvoice?: InvoiceResponse;
    isLoadingListingFeeInvoices?: boolean;
    onView: (session: AuctionSessionResponse) => void;
    onOpenListingFeeInvoice: (invoice: InvoiceResponse) => void;
    onToggleStatus?: (session: AuctionSessionResponse) => Promise<void> | void;
    onSessionUpdated?: () => Promise<void> | void;
}

export function MySessionMobileCard({
    session,
    bidCount,
    togglingId,
    listingFeeInvoice,
    isLoadingListingFeeInvoices,
    onView,
    onOpenListingFeeInvoice,
    onToggleStatus,
    onSessionUpdated,
}: MySessionMobileCardProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
            <div className="flex gap-3">
                <SessionImage session={session} />
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{session.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {t("auction.sessions.bidCount", { count: bidCount })}
                            </p>
                        </div>
                    </div>
                    <SessionStatusBadge
                        session={session}
                        listingFeeInvoice={listingFeeInvoice}
                        isLoadingListingFeeInvoices={isLoadingListingFeeInvoices}
                        onOpenListingFeeInvoice={onOpenListingFeeInvoice}
                    />
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">{t("auction.sessions.startPrice")}</p>
                    <p className="font-medium">{formatCurrency(session.startPrice)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{t("auction.sessions.currentPrice")}</p>
                    <p className="font-semibold">{formatCurrency(session.currentPrice)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{t("auction.sessions.buyNowPrice")}</p>
                    <p className="font-medium">{session.buyNowPrice != null ? formatCurrency(session.buyNowPrice) : "--"}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{t("auction.sessions.winner")}</p>
                    <p className="truncate font-medium">{session.highestBidder?.username ?? "--"}</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-4" />
                    <span>{formatSessionDateTime(session.startTime)} - {formatSessionDateTime(session.endTime)}</span>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <SessionActions
                    session={session}
                    bidCount={bidCount}
                    togglingId={togglingId}
                    onView={onView}
                    onToggleStatus={onToggleStatus}
                    onSessionUpdated={onSessionUpdated}
                />
            </div>
        </div>
    );
}
