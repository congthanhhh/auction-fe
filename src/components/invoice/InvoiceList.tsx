import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { InvoiceResponse } from "@/types/invoice";
import { InvoiceMobileCard } from "@/components/invoice/InvoiceMobileCard";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";

interface InvoiceListProps {
    invoices: InvoiceResponse[];
    isSeller?: boolean;
}

export default function InvoiceList({ invoices, isSeller }: InvoiceListProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const openInvoice = (invoice: InvoiceResponse) => {
        navigate(`/my-invoices/${invoice.id}`, {
            state: { invoice, isSeller },
        });
    };

    if (invoices.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground shadow-sm dark:bg-gray-900">
                {isSeller ? t("invoice.list.emptySeller") : t("invoice.list.emptyBuyer")}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-3 md:hidden">
                {invoices.map((invoice) => (
                    <InvoiceMobileCard
                        key={invoice.id}
                        invoice={invoice}
                        isSeller={isSeller}
                        onOpen={openInvoice}
                    />
                ))}
            </div>

            <InvoiceTable invoices={invoices} isSeller={isSeller} onOpen={openInvoice} />
        </div>
    );
}
