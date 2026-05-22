import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { InvoiceResponse } from "@/types/invoice";
import {
    invoiceStatusLabelKeys,
    invoiceStatusVariants,
    invoiceTypeLabelKeys,
    invoiceTypeVariants,
} from "@/types/invoice-labels";

interface InvoiceBadgesProps {
    invoice: InvoiceResponse;
}

export function InvoiceStatusBadge({ invoice }: InvoiceBadgesProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
        >
            {t(invoiceStatusLabelKeys[invoice.status])}
        </Badge>
    );
}

export function InvoiceTypeBadge({ invoice }: InvoiceBadgesProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={`border text-xs font-medium ${invoiceTypeVariants[invoice.type]}`}
        >
            {t(invoiceTypeLabelKeys[invoice.type])}
        </Badge>
    );
}

export function InvoiceBadges({ invoice }: InvoiceBadgesProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <InvoiceStatusBadge invoice={invoice} />
            <InvoiceTypeBadge invoice={invoice} />
        </div>
    );
}
