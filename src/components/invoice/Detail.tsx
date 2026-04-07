import type { InvoiceResponse } from "@/types/invoice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusLabels, invoiceStatusVariants, invoiceTypeLabels } from "@/types/invoice-labels";
import type { AddressResponse } from "@/types/user";

interface InvoiceDetailProps {
    invoice: InvoiceResponse;
    onPay?: (method: "COD" | "VNPAY") => void;
    isPaying?: boolean;
    onViewAuction?: (auctionSessionId: number) => void;
    defaultAddress?: AddressResponse;
}

export default function InvoiceDetail({ invoice, onPay, isPaying, onViewAuction, defaultAddress }: InvoiceDetailProps) {
    const firstImage = invoice.product.images[0]?.url;

    const canPay = invoice.status === "PENDING";

    const shippingRecipientName = defaultAddress?.recipientName || invoice.recipientName;
    const shippingPhone = defaultAddress?.phoneNumber || invoice.recipientPhone;
    const shippingAddress = defaultAddress
        ? defaultAddress.fullAddress ||
        [defaultAddress.street, defaultAddress.ward, defaultAddress.district, defaultAddress.city]
            .filter(Boolean)
            .join(", ")
        : invoice.shippingAddress;

    return (
        <div className="space-y-4">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-brand2 dark:text-white">
                            Chi tiết đơn hàng #{invoice.id}
                        </CardTitle>
                        <CardDescription>
                            {invoiceTypeLabels[invoice.type]} · Phiên đấu giá #{invoice.auctionSessionId}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
                            >
                                {invoiceStatusLabels[invoice.status]}
                            </Badge>
                            {onViewAuction && (
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => onViewAuction(invoice.auctionSessionId)}
                                >
                                    Xem phiên đấu giá
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tạo lúc {invoice.createdAt ? format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm") : "--"}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                        {/* Sản phẩm & giá */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {firstImage && (
                                    <img
                                        src={firstImage}
                                        alt={invoice.product.name}
                                        className="h-24 w-24 rounded-md object-cover border"
                                    />
                                )}
                                <div className="space-y-1">
                                    <p className="text-base font-semibold text-foreground">
                                        {invoice.product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Người bán: {invoice.product.seller.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Giá khởi điểm: {formatCurrency(invoice.product.startPrice)}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Giá thắng cuộc</span>
                                    <span className="text-lg font-semibold text-foreground">
                                        {formatCurrency(invoice.finalPrice)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Hạn thanh toán</span>
                                    <span>
                                        {invoice.dueDate
                                            ? format(new Date(invoice.dueDate), "dd/MM/yyyy HH:mm")
                                            : "--"}
                                    </span>
                                </div>
                                {invoice.paymentTime && (
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Thanh toán lúc</span>
                                        <span>{format(new Date(invoice.paymentTime), "dd/MM/yyyy HH:mm")}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông tin giao hàng & thanh toán */}
                        <div className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <h3 className="text-sm font-semibold text-foreground">Thông tin nhận hàng</h3>
                                <p className="text-sm font-medium">{shippingRecipientName}</p>
                                <p className="text-xs text-muted-foreground">SĐT: {shippingPhone}</p>
                                <p className="text-xs text-muted-foreground whitespace-pre-line">
                                    {shippingAddress}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">Vận chuyển</h3>
                                <p className="text-xs text-muted-foreground">
                                    Đơn vị vận chuyển: {invoice.carrier || "Chưa cập nhật"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Mã vận đơn: {invoice.trackingCode || "Chưa cập nhật"}
                                </p>
                                {invoice.shippedAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Đã gửi hàng lúc {format(new Date(invoice.shippedAt), "dd/MM/yyyy HH:mm")}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-foreground">Thanh toán</h3>
                                <p className="text-xs text-muted-foreground">
                                    Trạng thái: {invoiceStatusLabels[invoice.status]}
                                </p>
                                {canPay ? (
                                    <>
                                        <p className="text-xs text-muted-foreground">
                                            Vui lòng chọn phương thức thanh toán:
                                        </p>
                                        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                disabled={isPaying}
                                                onClick={() => onPay?.("COD")}
                                            >
                                                {isPaying ? "Đang xử lý..." : "Thanh toán khi nhận hàng"}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="flex-1 bg-brand text-white"
                                                disabled={isPaying}
                                                onClick={() => onPay?.("VNPAY")}
                                            >
                                                {isPaying ? "Đang xử lý..." : "VNPay"}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[11px] text-muted-foreground">
                                        Bạn chỉ có thể thanh toán khi đơn hàng ở trạng thái "Chờ thanh toán".
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

