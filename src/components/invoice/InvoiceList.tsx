import type { InvoiceResponse } from "@/types/invoice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusLabelKeys, invoiceStatusVariants, invoiceTypeLabelKeys } from "@/types/invoice-labels";
import { ChevronRight, PackageSearch, Receipt, Truck } from "lucide-react";

interface InvoiceListProps {
    invoices: InvoiceResponse[];
    isSeller?: boolean;
}

function formatDateTime(value?: string | null) {
    return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "--";
}

function InvoiceImage({ invoice }: { invoice: InvoiceResponse }) {
    const firstImage = invoice.product.images[0]?.url;

    return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            {firstImage ? (
                <img
                    src={firstImage}
                    alt={invoice.product.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <PackageSearch className="m-auto mt-4 size-5 text-muted-foreground" />
            )}
        </div>
    );
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
                    <button
                        key={invoice.id}
                        type="button"
                        onClick={() => openInvoice(invoice)}
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
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
                                    >
                                        {t(invoiceStatusLabelKeys[invoice.status])}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {t(invoiceTypeLabelKeys[invoice.type])}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">{t("invoice.list.finalPrice")}</p>
                                <p className="font-semibold">{formatCurrency(invoice.finalPrice)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t("invoice.list.dueDate")}</p>
                                <p className="font-medium">{formatDateTime(invoice.dueDate)}</p>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                                {invoice.trackingCode ? <Truck className="size-4" /> : <Receipt className="size-4" />}
                                <span>
                                    {invoice.trackingCode
                                        ? `${invoice.carrier ?? t("invoice.list.carrier")}: ${invoice.trackingCode}`
                                        : t("invoice.list.createdAt", { date: formatDateTime(invoice.createdAt) })}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-gray-900 md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("invoice.list.code")}</TableHead>
                            <TableHead>{t("invoice.list.product")}</TableHead>
                            <TableHead>{t("invoice.list.finalPrice")}</TableHead>
                            <TableHead>{t("invoice.list.status")}</TableHead>
                            <TableHead>{t("invoice.list.type")}</TableHead>
                            <TableHead>{t("invoice.list.createdDate")}</TableHead>
                            <TableHead>{t("invoice.list.dueDate")}</TableHead>
                            <TableHead>{t("invoice.list.shipping")}</TableHead>
                            <TableHead className="text-right">{t("invoice.list.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id} className="align-middle hover:bg-muted/50">
                                <TableCell className="font-mono text-xs text-muted-foreground">#{invoice.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <InvoiceImage invoice={invoice} />
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="max-w-56 truncate text-sm font-medium text-foreground">
                                                {invoice.product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {isSeller
                                                    ? t("invoice.list.buyer", { name: invoice.user.username })
                                                    : t("invoice.list.seller", { name: invoice.product.seller.username })}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-semibold">{formatCurrency(invoice.finalPrice)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
                                    >
                                        {t(invoiceStatusLabelKeys[invoice.status])}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {t(invoiceTypeLabelKeys[invoice.type])}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatDateTime(invoice.createdAt)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatDateTime(invoice.dueDate)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {invoice.trackingCode ?? "--"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => openInvoice(invoice)}>
                                        {t("common.view")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
