import { useTranslation } from "react-i18next";
import type { InvoiceResponse } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight, Receipt, Truck } from "lucide-react";
import { InvoiceBadges } from "@/components/invoice/InvoiceBadges";
import { InvoiceImage } from "@/components/invoice/InvoiceImage";
import { formatInvoiceDateTime, getInvoiceAmountLabelKey } from "@/components/invoice/invoice-list-utils";

interface InvoiceMobileCardProps {
    invoice: InvoiceResponse;
    isSeller?: boolean;
    onOpen: (invoice: InvoiceResponse) => void;
}

export function InvoiceMobileCard({ invoice, isSeller, onOpen }: InvoiceMobileCardProps) {
    const { t } = useTranslation();
    const amountLabel = t(getInvoiceAmountLabelKey(invoice));

    return (
        <button
            type="button"
            onClick={() => onOpen(invoice)}
            className="rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:bg-sky-50/40 dark:bg-gray-900 dark:hover:bg-sky-950/20"
        >
            <div className="flex gap-3">
                <InvoiceImage invoice={invoice} />
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{invoice.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {isSeller
                                    ? t("invoice.list.buyer", { name: invoice.user.username })
                                    : t("invoice.list.seller", { name: invoice.product.seller.username })}
                            </p>
                        </div>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    </div>
                    <InvoiceBadges invoice={invoice} />
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">{amountLabel}</p>
                    <p className="font-semibold">{formatCurrency(invoice.finalPrice)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{t("invoice.list.dueDate")}</p>
                    <p className="font-medium">{formatInvoiceDateTime(invoice.dueDate)}</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {invoice.trackingCode ? <Truck className="size-4" /> : <Receipt className="size-4" />}
                    <span>
                        {invoice.trackingCode
                            ? `${invoice.carrier ?? t("invoice.list.carrier")}: ${invoice.trackingCode}`
                            : t("invoice.list.createdAt", { date: formatInvoiceDateTime(invoice.createdAt) })}
                    </span>
                </div>
            </div>
        </button>
    );
}
