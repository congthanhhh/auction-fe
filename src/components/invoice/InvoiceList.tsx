import type { InvoiceResponse } from "@/types/invoice";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusLabels, invoiceStatusVariants, invoiceTypeLabels } from "@/types/invoice-labels";

interface InvoiceListProps {
    invoices: InvoiceResponse[];
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-brand2">Đơn hàng của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Hiện bạn chưa có hóa đơn nào. Khi thắng phiên đấu giá, hóa đơn sẽ xuất hiện tại đây.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã HĐ</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Giá cuối</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead>Hạn thanh toán</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => {
                                        const firstImage = invoice.product.images[0]?.url;

                                        return (
                                            <TableRow
                                                key={invoice.id}
                                                className="align-middle cursor-pointer hover:bg-muted/60"
                                                onClick={() =>
                                                    navigate(`/my-invoices/${invoice.id}`, {
                                                        state: { invoice },
                                                    })
                                                }
                                            >
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    #{invoice.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {firstImage && (
                                                            <img
                                                                src={firstImage}
                                                                alt={invoice.product.name}
                                                                className="h-12 w-12 rounded-md object-cover border"
                                                            />
                                                        )}
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-medium text-foreground line-clamp-1">
                                                                {invoice.product.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Người bán: {invoice.product.seller.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold">
                                                    {formatCurrency(invoice.finalPrice)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
                                                    >
                                                        {invoiceStatusLabels[invoice.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-muted-foreground">
                                                        {invoiceTypeLabels[invoice.type]}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {invoice.createdAt
                                                        ? format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm")
                                                        : "--"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {invoice.dueDate
                                                        ? format(new Date(invoice.dueDate), "dd/MM/yyyy HH:mm")
                                                        : "--"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

