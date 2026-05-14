import type { InvoiceStatus, InvoiceType } from "@/types/invoice";

export const invoiceStatusLabelKeys: Record<InvoiceStatus, string> = {
    PENDING: "invoice.status.PENDING",
    PAID: "invoice.status.PAID",
    SHIPPING: "invoice.status.SHIPPING",
    COMPLETED: "invoice.status.COMPLETED",
    DISPUTE: "invoice.status.DISPUTE",
    CANCELLED_NON_PAYMENT: "invoice.status.CANCELLED_NON_PAYMENT",
    CANCELLED_BY_SELLER: "invoice.status.CANCELLED_BY_SELLER",
    REFUNDED: "invoice.status.REFUNDED",
};

export const invoiceStatusVariants: Record<InvoiceStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    SHIPPING: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800",
    COMPLETED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-800",
    DISPUTE: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
    CANCELLED_NON_PAYMENT: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
    CANCELLED_BY_SELLER: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
    REFUNDED: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800",
};

export const invoiceTypeLabelKeys: Record<InvoiceType, string> = {
    AUCTION_SALE: "invoice.type.AUCTION_SALE",
    LISTING_FEE: "invoice.type.LISTING_FEE",
};
