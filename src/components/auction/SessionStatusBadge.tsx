import { useTranslation } from "react-i18next";
import type { AuctionSessionResponse } from "@/types/auction";
import type { InvoiceResponse } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";
import { auctionStatusLabelKeys, auctionStatusVariants } from "@/types/auction-labels";
import { CreditCard, Loader2 } from "lucide-react";

interface SessionStatusBadgeProps {
    session: AuctionSessionResponse;
    listingFeeInvoice?: InvoiceResponse;
    isLoadingListingFeeInvoices?: boolean;
    onOpenListingFeeInvoice?: (invoice: InvoiceResponse) => void;
}

export function SessionStatusBadge({
    session,
    listingFeeInvoice,
    isLoadingListingFeeInvoices,
    onOpenListingFeeInvoice,
}: SessionStatusBadgeProps) {
    const { t } = useTranslation();

    if (session.status === "WAITING_PAYMENT" && listingFeeInvoice && onOpenListingFeeInvoice) {
        return (
            <Badge asChild variant="outline" className={`border text-xs font-medium hover:shadow-sm ${auctionStatusVariants[session.status]}`}>
                <button
                    type="button"
                    onClick={() => onOpenListingFeeInvoice(listingFeeInvoice)}
                    title="Open listing fee invoice"
                >
                    <CreditCard className="size-3" />
                    {t(auctionStatusLabelKeys[session.status])}
                </button>
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}>
            {session.status === "WAITING_PAYMENT" && isLoadingListingFeeInvoices && <Loader2 className="size-3 animate-spin" />}
            {t(auctionStatusLabelKeys[session.status])}
        </Badge>
    );
}
