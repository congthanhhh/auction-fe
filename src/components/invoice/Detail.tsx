import { useState } from "react";
import type { InvoiceResponse } from "@/types/invoice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusLabels, invoiceStatusVariants, invoiceTypeLabels } from "@/types/invoice-labels";
import type { AddressResponse } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface InvoiceDetailProps {
    invoice: InvoiceResponse;
    onPay?: () => void;
    isPaying?: boolean;
    onViewAuction?: (auctionSessionId: number) => void;
    selectedAddress?: AddressResponse;
    addresses?: AddressResponse[];
    onChangeAddress?: (addressId: number) => void;
    isSeller?: boolean;
    onShip?: (trackingCode: string, carrier: string) => Promise<void>;
    onConfirmReceive?: () => Promise<void>;
    onReportNonpayment?: () => Promise<void>;
    onDispute?: () => Promise<void>;
}

export default function InvoiceDetail({
    invoice,
    onPay,
    isPaying,
    onViewAuction,
    selectedAddress,
    addresses,
    onChangeAddress,
    isSeller,
    onShip,
    onConfirmReceive,
    onReportNonpayment,
    onDispute,
}: InvoiceDetailProps) {
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [trackingCode, setTrackingCode] = useState("");
    const [carrier, setCarrier] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleShipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingCode) return;
        try {
            setIsActionLoading(true);
            if (onShip) {
                await onShip(trackingCode, carrier);
                setIsShipDialogOpen(false);
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAction = async (actionFn?: () => Promise<void>) => {
        if (!actionFn) return;
        try {
            setIsActionLoading(true);
            await actionFn();
        } finally {
            setIsActionLoading(false);
        }
    };
    const firstImage = invoice.product.images[0]?.url;

    const canPay = invoice.status === "PENDING";

    const effectiveAddress = selectedAddress ?? null;

    const shippingRecipientName = effectiveAddress?.recipientName || invoice.recipientName;
    const shippingPhone = effectiveAddress?.phoneNumber || invoice.recipientPhone;
    const shippingAddress = effectiveAddress
        ? effectiveAddress.fullAddress ||
        [effectiveAddress.street, effectiveAddress.ward, effectiveAddress.district, effectiveAddress.city]
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
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-foreground">Thông tin nhận hàng</h3>
                                    {addresses && addresses.length > 0 && onChangeAddress && (
                                        <Select
                                            value={effectiveAddress ? String(effectiveAddress.id) : ""}
                                            onValueChange={(value) => onChangeAddress(Number(value))}
                                        >
                                            <SelectTrigger size="sm" className="min-w-[200px] text-xs">
                                                <SelectValue placeholder="Chọn địa chỉ nhận hàng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {addresses.map((addr) => (
                                                    <SelectItem key={addr.id} value={String(addr.id)}>
                                                        <span className="text-xs font-medium">
                                                            {addr.recipientName}
                                                            {addr.isDefault && " (Mặc định)"}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
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
                                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                    {isSeller ? (
                                        <>
                                            {invoice.status === "PAID" && (
                                                <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="flex-1 bg-brand text-white">Xác nhận gửi hàng</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Thông tin giao hàng</DialogTitle>
                                                            <DialogDescription>
                                                                Nhập mã vận đơn và tên đơn vị vận chuyển sau khi bạn đã gửi hàng cho bưu cục.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleShipSubmit} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Mã vận đơn (Tracking Code) *</Label>
                                                                <Input 
                                                                    required 
                                                                    placeholder="VD: VN123456" 
                                                                    value={trackingCode} 
                                                                    onChange={(e) => setTrackingCode(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Đơn vị vận chuyển</Label>
                                                                <Input 
                                                                    placeholder="VD: GHTK, Viettel Post..." 
                                                                    value={carrier} 
                                                                    onChange={(e) => setCarrier(e.target.value)}
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" type="button" onClick={() => setIsShipDialogOpen(false)}>Hủy</Button>
                                                                <Button type="submit" className="bg-brand" disabled={isActionLoading}>
                                                                    {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Xác nhận
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                            {invoice.status === "PENDING" && (
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive" 
                                                    className="flex-1"
                                                    onClick={() => handleAction(onReportNonpayment)}
                                                    disabled={isActionLoading}
                                                >
                                                    {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Báo cáo bùng kèo"}
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {canPay && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="flex-1 bg-brand text-white"
                                                    disabled={isPaying || isActionLoading}
                                                    onClick={onPay}
                                                >
                                                    {(isPaying || isActionLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Thanh toán qua VNPay"}
                                                </Button>
                                            )}
                                            {invoice.status === "SHIPPING" && (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleAction(onConfirmReceive)}
                                                        disabled={isActionLoading}
                                                    >
                                                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đã nhận được hàng"}
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleAction(onDispute)}
                                                        disabled={isActionLoading}
                                                    >
                                                        {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Khiếu nại / Báo mất"}
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

