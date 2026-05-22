import { format } from "date-fns";
import type { InvoiceResponse } from "@/types/invoice";

export function formatInvoiceDateTime(value?: string | null) {
    return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "--";
}

export function getInvoiceAmountLabelKey(invoice: InvoiceResponse) {
    return invoice.type === "LISTING_FEE"
        ? "invoice.list.listingFeeAmount"
        : "invoice.list.finalPrice";
}
