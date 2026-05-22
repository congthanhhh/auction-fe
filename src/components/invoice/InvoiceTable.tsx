import { useTranslation } from "react-i18next";
import type { InvoiceResponse } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { InvoiceImage } from "@/components/invoice/InvoiceImage";
import { InvoiceStatusBadge, InvoiceTypeBadge } from "@/components/invoice/InvoiceBadges";
import { formatInvoiceDateTime } from "@/components/invoice/invoice-list-utils";

interface InvoiceTableProps {
    invoices: InvoiceResponse[];
    isSeller?: boolean;
    onOpen: (invoice: InvoiceResponse) => void;
}

export function InvoiceTable({ invoices, isSeller, onOpen }: InvoiceTableProps) {
    const { t } = useTranslation();

    return (
        <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-gray-900 md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("invoice.list.code")}</TableHead>
                        <TableHead>{t("invoice.list.product")}</TableHead>
                        <TableHead>{t("invoice.list.amount")}</TableHead>
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
                                <InvoiceStatusBadge invoice={invoice} />
                            </TableCell>
                            <TableCell>
                                <InvoiceTypeBadge invoice={invoice} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatInvoiceDateTime(invoice.createdAt)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatInvoiceDateTime(invoice.dueDate)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {invoice.trackingCode ?? "--"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => onOpen(invoice)}>
                                    {t("common.view")}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
