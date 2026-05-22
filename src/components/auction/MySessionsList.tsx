import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { AuctionSessionResponse } from "@/types/auction";
import type { InvoiceResponse } from "@/types/invoice";
import { bidService } from "@/services/bidService";
import { MySessionMobileCard } from "@/components/auction/MySessionMobileCard";
import { MySessionsTable } from "@/components/auction/MySessionsTable";

interface MySessionsListProps {
    sessions: AuctionSessionResponse[];
    listingFeeInvoicesBySessionId?: Record<number, InvoiceResponse>;
    isLoadingListingFeeInvoices?: boolean;
    onToggleStatus?: (session: AuctionSessionResponse) => Promise<void> | void;
    onSessionUpdated?: () => Promise<void> | void;
}

export default function MySessionsList({
    sessions,
    listingFeeInvoicesBySessionId = {},
    isLoadingListingFeeInvoices = false,
    onToggleStatus,
    onSessionUpdated,
}: MySessionsListProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [bidCounts, setBidCounts] = useState<Record<number, number>>({});
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (sessions.length === 0) {
            setBidCounts({});
            return;
        }

        let isMounted = true;

        const fetchBidCounts = async () => {
            const uniqueProductIds = Array.from(new Set(sessions.map((session) => session.product.id)));
            const results = await Promise.allSettled(
                uniqueProductIds.map(async (productId) => ({
                    productId,
                    count: await bidService.getBidCount(productId),
                })),
            );

            if (!isMounted) return;

            setBidCounts((prev) => {
                const next = { ...prev };
                for (const result of results) {
                    if (result.status === "fulfilled") {
                        next[result.value.productId] = result.value.count;
                    }
                }
                return next;
            });
        };

        fetchBidCounts();

        return () => {
            isMounted = false;
        };
    }, [sessions]);

    const handleViewSession = (session: AuctionSessionResponse) => {
        navigate(`/auction/${session.id}`);
    };

    const handleOpenListingFeeInvoice = (invoice: InvoiceResponse) => {
        navigate(`/my-invoices/${invoice.id}`, {
            state: { invoice },
        });
    };

    const handleToggleStatus = async (session: AuctionSessionResponse) => {
        if (!onToggleStatus) return;
        setTogglingId(session.id);
        try {
            await onToggleStatus(session);
        } finally {
            setTogglingId(null);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground shadow-sm dark:bg-gray-900">
                {t("auction.sessions.empty")}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-3 lg:hidden">
                {sessions.map((session) => (
                    <MySessionMobileCard
                        key={session.id}
                        session={session}
                        bidCount={bidCounts[session.product.id] ?? 0}
                        togglingId={togglingId}
                        listingFeeInvoice={listingFeeInvoicesBySessionId[session.id]}
                        isLoadingListingFeeInvoices={isLoadingListingFeeInvoices}
                        onView={handleViewSession}
                        onOpenListingFeeInvoice={handleOpenListingFeeInvoice}
                        onToggleStatus={handleToggleStatus}
                        onSessionUpdated={onSessionUpdated}
                    />
                ))}
            </div>

            <MySessionsTable
                sessions={sessions}
                bidCounts={bidCounts}
                togglingId={togglingId}
                listingFeeInvoicesBySessionId={listingFeeInvoicesBySessionId}
                isLoadingListingFeeInvoices={isLoadingListingFeeInvoices}
                onView={handleViewSession}
                onOpenListingFeeInvoice={handleOpenListingFeeInvoice}
                onToggleStatus={handleToggleStatus}
                onSessionUpdated={onSessionUpdated}
            />
        </div>
    );
}
