import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DisputeResponse, InvoiceResponse, ShipInvoiceRequest, DisputeRequest } from "@/types/invoice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { invoiceStatusLabelKeys, invoiceStatusVariants, invoiceTypeLabelKeys, invoiceTypeVariants } from "@/types/invoice-labels";
import type { AddressResponse } from "@/types/user";
import { FeedbackRating, type FeedbackRequest } from "@/types/feedback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Receipt, CreditCard, Truck, CheckCircle2, XCircle, AlertCircle, Mail, MapPin, Phone, UserRound, Star, Smile, Meh, Frown, Copy, ClipboardCheck, CalendarClock } from "lucide-react";

interface InvoiceDetailProps {
    invoice: InvoiceResponse;
    onPay?: () => void;
    isPaying?: boolean;
    onViewAuction?: (auctionSessionId: number) => void;
    selectedAddress?: AddressResponse;
    addresses?: AddressResponse[];
    onChangeAddress?: (addressId: number) => void;
    isSeller?: boolean;
    onShip?: (payload: ShipInvoiceRequest) => Promise<void>;
    onConfirmReceive?: () => Promise<void>;
    onReportNonpayment?: () => Promise<void>;
    onDispute?: (payload: DisputeRequest) => Promise<void>;
    onCreateFeedback?: (payload: FeedbackRequest) => Promise<void>;
    dispute?: DisputeResponse | null;
    isLoadingDispute?: boolean;
    disputeError?: string | null;
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
    onCreateFeedback,
    dispute,
    isLoadingDispute,
    disputeError,
}: InvoiceDetailProps) {
    const { t } = useTranslation();
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);
    const [trackingCode, setTrackingCode] = useState("");
    const [carrier, setCarrier] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Dispute state
    const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
    const [disputeReason, setDisputeReason] = useState("");
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState<FeedbackRating>(FeedbackRating.POSITIVE);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [hasCopiedTracking, setHasCopiedTracking] = useState(false);

    const handleShipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingCode) return;
        try {
            setIsActionLoading(true);
            if (onShip) {
                await onShip({ trackingCode, carrier: carrier || undefined });
                setIsShipDialogOpen(false);
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDisputeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disputeReason.trim()) return;
        try {
            setIsActionLoading(true);
            if (onDispute) {
                await onDispute({ reason: disputeReason });
                setIsDisputeDialogOpen(false);
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

    const handleCopyTrackingCode = async () => {
        if (!invoice.trackingCode) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(invoice.trackingCode);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = invoice.trackingCode;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            setHasCopiedTracking(true);
            window.setTimeout(() => setHasCopiedTracking(false), 2000);
        } catch {
            alert(t("invoice.detail.copyTrackingError"));
        }
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onCreateFeedback) return;

        try {
            setIsActionLoading(true);
            await onCreateFeedback({
                rating: feedbackRating,
                comment: feedbackComment.trim() || undefined,
            });
            setIsFeedbackDialogOpen(false);
            setFeedbackComment("");
        } finally {
            setIsActionLoading(false);
        }
    };
    const firstImage = invoice.product.images[0]?.url;

    const isListingFee = invoice.type === "LISTING_FEE";
    const isAuctionSale = invoice.type === "AUCTION_SALE";
    const isSellerAuctionFlow = Boolean(isSeller && isAuctionSale);
    const amountLabel = isListingFee ? t("invoice.list.listingFeeAmount") : t("invoice.list.finalPrice");
    const canPay = invoice.status === "PENDING";
    const isOverdue = invoice.dueDate ? new Date() > new Date(invoice.dueDate) : false;
    const canCreateFeedback =
        Boolean(onCreateFeedback) &&
        !invoice.hasFeedback &&
        invoice.type === "AUCTION_SALE" &&
        (invoice.status === "COMPLETED" || (isSeller && invoice.status === "CANCELLED_NON_PAYMENT"));
    const feedbackTargetLabel = isSeller ? t("invoice.list.buyer", { name: "" }).replace(": ", "") : t("invoice.list.seller", { name: "" }).replace(": ", "");
    const feedbackRatingOptions = [
        {
            value: FeedbackRating.POSITIVE,
            label: t("invoice.detail.feedbackPositive"),
            description: `Trải nghiệm tốt với ${feedbackTargetLabel}.`,
            icon: Smile,
            className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
        },
        {
            value: FeedbackRating.NEUTRAL,
            label: t("invoice.detail.feedbackNeutral"),
            description: "Giao dịch ổn nhưng vẫn có điểm cần cải thiện.",
            icon: Meh,
            className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
        },
        ...(!isSeller || invoice.status === "CANCELLED_NON_PAYMENT"
            ? [{
                value: FeedbackRating.NEGATIVE,
                label: t("invoice.detail.feedbackNegative"),
                description: "Trải nghiệm không tốt hoặc có vấn đề nghiêm trọng.",
                icon: Frown,
                className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
            }]
            : []),
    ];

    const effectiveAddress = selectedAddress ?? null;

    const shippingRecipientName = effectiveAddress?.recipientName || invoice.recipientName;
    const shippingEmail = invoice.recipientEmail || invoice.user.email;
    const shippingPhone = effectiveAddress?.phoneNumber || invoice.recipientPhone;
    const shippingAddress = effectiveAddress
        ? effectiveAddress.fullAddress ||
        [effectiveAddress.street, effectiveAddress.ward, effectiveAddress.district, effectiveAddress.city]
            .filter(Boolean)
            .join(", ")
        : invoice.shippingAddress;

    const getStepperStatus = () => {
        if (isListingFee) {
            if (invoice.status === "PENDING") return 0;
            if (invoice.status === "PAID" || invoice.status === "COMPLETED") return 2;
            return -1;
        }

        if (invoice.status === "PENDING") return 0;
        if (invoice.status === "PAID") return 1;
        if (invoice.status === "SHIPPING") return 2;
        if (invoice.status === "COMPLETED") return 3;
        return -1; // CANCELLED, REFUNDED, DISPUTE
    };

    const currentStep = getStepperStatus();
    const isErrorState = invoice.status === "DISPUTE" || invoice.status.startsWith("CANCELLED") || invoice.status === "REFUNDED";
    const autoCompleteDate =
        invoice.status === "SHIPPING" && invoice.shippedAt
            ? addDays(new Date(invoice.shippedAt), 15)
            : null;
    const disputeDecisionLabels: Record<NonNullable<DisputeResponse["decision"]>, string> = {
        PENDING: "Đang chờ xử lý",
        REFUND_TO_BUYER: "Hoàn tiền cho người mua",
        RELEASE_TO_SELLER: "Thanh toán cho người bán",
    };

    const steps = isListingFee
        ? [
            { id: 0, title: "Chờ thanh toán", icon: Receipt },
            { id: 1, title: "Đã thanh toán", icon: CreditCard },
            { id: 2, title: "Hoàn tất phí", icon: CheckCircle2 },
        ]
        : [
        { id: 0, title: "Chờ thanh toán", icon: Receipt },
        { id: 1, title: "Đã thanh toán", icon: CreditCard },
        { id: 2, title: "Đang giao", icon: Truck },
        { id: 3, title: "Hoàn thành", icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-brand2 dark:text-white">
                            {t("invoice.detail.title")} #{invoice.id}
                        </CardTitle>
                        <CardDescription>
                            {t(invoiceTypeLabelKeys[invoice.type])} · #{invoice.auctionSessionId}
                        </CardDescription>
                        <Badge
                            variant="outline"
                            className={`w-fit border text-xs font-medium ${invoiceTypeVariants[invoice.type]}`}
                        >
                            {t(invoiceTypeLabelKeys[invoice.type])}
                        </Badge>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`border text-xs font-medium ${invoiceStatusVariants[invoice.status]}`}
                            >
                                {t(invoiceStatusLabelKeys[invoice.status])}
                            </Badge>
                            {onViewAuction && (
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => onViewAuction(invoice.auctionSessionId)}
                                >
                                    {t("invoice.detail.viewAuction")}
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tạo lúc {invoice.createdAt ? format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm") : "--"}
                        </p>
                    </div>
                </CardHeader>

                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-y">
                    {isErrorState ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            {invoice.status === "DISPUTE" ? (
                                <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
                            ) : (
                                <XCircle className="h-12 w-12 text-red-500 mb-2" />
                            )}
                            <h3 className="text-lg font-semibold">{t(invoiceStatusLabelKeys[invoice.status])}</h3>
                            {invoice.status === "DISPUTE" && (
                                <div className="mt-4 w-full max-w-2xl rounded-lg border bg-white p-4 text-left shadow-sm dark:bg-gray-950">
                                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm font-semibold text-foreground">Lý do khiếu nại</p>
                                        {dispute?.decision && (
                                            <Badge variant="outline" className="w-fit border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                                {disputeDecisionLabels[dispute.decision]}
                                            </Badge>
                                        )}
                                    </div>
                                    {isLoadingDispute ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải lý do khiếu nại...
                                        </div>
                                    ) : disputeError ? (
                                        <p className="text-sm text-red-600">{disputeError}</p>
                                    ) : dispute ? (
                                        <div className="space-y-3">
                                            <p className="whitespace-pre-line wrap-break-word text-sm text-foreground">
                                                {dispute.reason}
                                            </p>
                                            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                                <span>
                                                    Gửi lúc: {dispute.createdAt ? format(new Date(dispute.createdAt), "dd/MM/yyyy HH:mm") : "--"}
                                                </span>
                                                <span>
                                                    Xử lý lúc: {dispute.resolvedAt ? format(new Date(dispute.resolvedAt), "dd/MM/yyyy HH:mm") : "--"}
                                                </span>
                                            </div>
                                            {dispute.adminNote && (
                                                <div className="rounded-md bg-muted/60 p-3 text-sm">
                                                    <p className="mb-1 font-medium text-foreground">Ghi chú admin</p>
                                                    <p className="whitespace-pre-line wrap-break-word text-muted-foreground">{dispute.adminNote}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Chưa có thông tin khiếu nại.</p>
                                    )}
                                </div>
                            )}
                            {invoice.status === "DISPUTE" ? (
                                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                                    {t("invoice.detail.disputeAutoCompleteStopped")}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground">Đơn hàng này không thể hoàn thành.</p>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded" />
                            <div className="absolute top-1/2 left-0 h-0.5 bg-brand -translate-y-1/2 rounded transition-all duration-500" style={{ width: `${currentStep >= 0 ? (currentStep / (steps.length - 1)) * 100 : 0}%` }} />

                            <div className="relative flex justify-between w-full">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep >= step.id;
                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-300 border-2 ${isActive
                                                ? "bg-brand text-white border-brand shadow-sm"
                                                : "bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
                                                }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-xs font-medium text-center max-w-20 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <CardContent className="pt-6">
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
                                    <span className="text-muted-foreground">{amountLabel}</span>
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
                            {isAuctionSale ? (
                                <>
                            <div className="rounded-lg border bg-muted/20 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-sm font-semibold text-foreground">Thông tin nhận hàng</h3>
                                    {addresses && addresses.length > 0 && onChangeAddress && (
                                        <Select
                                            value={effectiveAddress ? String(effectiveAddress.id) : ""}
                                            onValueChange={(value) => onChangeAddress(Number(value))}
                                        >
                                            <SelectTrigger size="sm" className="w-full text-xs sm:w-55">
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
                                <div className="mt-4 grid gap-3">
                                    <div className="flex gap-3">
                                        <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Người nhận</p>
                                            <p className="wrap-break-word text-sm font-medium">{shippingRecipientName || "--"}</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="flex gap-3">
                                            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">Số điện thoại</p>
                                                <p className="wrap-break-word text-sm font-medium">{shippingPhone || "--"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-muted-foreground">Email</p>
                                                <p className="wrap-break-word text-sm font-medium">{shippingEmail || "--"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">Địa chỉ nhận hàng</p>
                                            <p className="whitespace-pre-line wrap-break-word text-sm font-medium">
                                                {shippingAddress || "--"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Vận chuyển</h3>
                                {invoice.trackingCode ? (
                                    <div className="rounded-lg border bg-sky-50/70 p-3 text-sm dark:bg-sky-950/20">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Đơn vị vận chuyển</p>
                                                    <p className="font-medium text-foreground">{invoice.carrier || t("invoice.list.carrier")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Mã vận đơn</p>
                                                    <p className="font-mono text-base font-semibold text-foreground">{invoice.trackingCode}</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                                onClick={handleCopyTrackingCode}
                                            >
                                                {hasCopiedTracking ? (
                                                    <ClipboardCheck className="size-4" />
                                                ) : (
                                                    <Copy className="size-4" />
                                                )}
                                                {hasCopiedTracking ? t("invoice.detail.trackingCopied") : t("invoice.detail.copyTracking")}
                                            </Button>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                            {t("invoice.detail.trackingLookupHint")}
                                        </p>
                                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                                            {invoice.shippedAt && (
                                                <div className="flex items-center gap-2">
                                                    <Truck className="size-4" />
                                                    <span>
                                                        {t("invoice.detail.shippedAt", {
                                                            date: format(new Date(invoice.shippedAt), "dd/MM/yyyy HH:mm"),
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {autoCompleteDate && (
                                                <div className="flex items-center gap-2">
                                                    <CalendarClock className="size-4" />
                                                    <span>
                                                        {t("invoice.detail.autoCompleteDate", {
                                                            date: format(autoCompleteDate, "dd/MM/yyyy HH:mm"),
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                                        {t("invoice.detail.trackingPending")}
                                    </div>
                                )}
                            </div>

                            <Separator />
                                </>
                            ) : (
                                <div className="rounded-lg border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-900 dark:border-violet-900 dark:bg-violet-950/20 dark:text-violet-100">
                                    <div className="mb-2 flex items-center gap-2 font-semibold">
                                        <CreditCard className="size-4" />
                                        Phí giá sàn
                                    </div>
                                    <p className="text-xs leading-5 opacity-80">
                                        Đây là hóa đơn LISTING_FEE để thanh toán giá chấp nhận bán khi tạo phiên. Hóa đơn này không có thông tin giao hàng.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-brand/20">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-brand" /> Thao tác
                                </h3>
                                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                    {isSellerAuctionFlow ? (
                                        <>
                                            {invoice.status === "PAID" && (
                                                <Dialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" className="flex-1 bg-brand text-white shadow-sm hover:shadow">Xác nhận gửi hàng</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-106.25">
                                                        <DialogHeader className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2 mx-auto sm:mx-0">
                                                                <Truck className="w-6 h-6" />
                                                            </div>
                                                            <DialogTitle className="text-xl">Xác nhận giao hàng</DialogTitle>
                                                            <DialogDescription>
                                                                Vui lòng cung cấp mã vận đơn để người mua có thể theo dõi hành trình của đơn hàng.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleShipSubmit} className="space-y-6 pt-4">
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium">Mã vận đơn (Tracking Code) <span className="text-red-500">*</span></Label>
                                                                    <Input
                                                                        required
                                                                        placeholder="VD: VN123456789"
                                                                        value={trackingCode}
                                                                        onChange={(e) => setTrackingCode(e.target.value)}
                                                                        className="h-11 bg-gray-50 dark:bg-gray-900/50"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium">Đơn vị vận chuyển <span className="text-gray-400 font-normal">(Tùy chọn)</span></Label>
                                                                    <Input
                                                                        placeholder="VD: Giao Hàng Tiết Kiệm, Viettel Post..."
                                                                        value={carrier}
                                                                        onChange={(e) => setCarrier(e.target.value)}
                                                                        className="h-11 bg-gray-50 dark:bg-gray-900/50"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                <Button variant="ghost" type="button" onClick={() => setIsShipDialogOpen(false)}>Hủy bỏ</Button>
                                                                <Button type="submit" className="bg-brand text-white px-6" disabled={isActionLoading}>
                                                                    {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Cập nhật trạng thái
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
                                                    disabled={isActionLoading || !isOverdue}
                                                    title={!isOverdue ? "Chưa quá hạn thanh toán" : ""}
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
                                                    <Dialog open={isDisputeDialogOpen} onOpenChange={setIsDisputeDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                disabled={isActionLoading}
                                                            >
                                                                {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Khiếu nại / Báo mất"}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-106.25">
                                                            <DialogHeader className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                                                                    <AlertCircle className="w-6 h-6" />
                                                                </div>
                                                                <DialogTitle className="text-xl">Gửi yêu cầu khiếu nại</DialogTitle>
                                                                <DialogDescription>
                                                                    Vui lòng cung cấp chi tiết lý do bạn khiếu nại đơn hàng này (ví dụ: chưa nhận được hàng, hàng bị lỗi, v.v...).
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={handleDisputeSubmit} className="space-y-6 pt-4">
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium">Lý do khiếu nại <span className="text-red-500">*</span></Label>
                                                                        <Input
                                                                            required
                                                                            placeholder="Ví dụ: Đã quá hạn nhưng tôi chưa nhận được hàng..."
                                                                            value={disputeReason}
                                                                            onChange={(e) => setDisputeReason(e.target.value)}
                                                                            className="h-11 bg-gray-50 dark:bg-gray-900/50"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <DialogFooter className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                                                    <Button variant="ghost" type="button" onClick={() => setIsDisputeDialogOpen(false)}>Hủy bỏ</Button>
                                                                    <Button type="submit" variant="destructive" className="px-6" disabled={isActionLoading}>
                                                                        {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                        Gửi khiếu nại
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {(canCreateFeedback || invoice.hasFeedback) && (
                                    <div className="rounded-md border bg-background p-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                    <Star className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Đánh giá {feedbackTargetLabel}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {invoice.hasFeedback
                                                            ? "Bạn đã gửi đánh giá cho giao dịch này."
                                                            : "Chia sẻ trải nghiệm để cập nhật uy tín người dùng."}
                                                    </p>
                                                </div>
                                            </div>

                                            {canCreateFeedback && (
                                                <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="gap-2">
                                                            <Star className="h-4 w-4" />
                                                            Gửi đánh giá
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Đánh giá {feedbackTargetLabel}</DialogTitle>
                                                            <DialogDescription>
                                                                Đánh giá này sẽ ảnh hưởng trực tiếp đến điểm uy tín của {feedbackTargetLabel}.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                                                            <div className="grid gap-3">
                                                                {feedbackRatingOptions.map((option) => {
                                                                    const Icon = option.icon;
                                                                    const isSelected = feedbackRating === option.value;

                                                                    return (
                                                                        <button
                                                                            key={option.value}
                                                                            type="button"
                                                                            onClick={() => setFeedbackRating(option.value)}
                                                                            className={`rounded-md border p-3 text-left transition ${isSelected ? `${option.className} ring-2 ring-brand/30` : "bg-background hover:bg-muted/60"}`}
                                                                        >
                                                                            <div className="flex gap-3">
                                                                                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                                                                                <div>
                                                                                    <p className="text-sm font-semibold">{option.label}</p>
                                                                                    <p className="text-xs opacity-80">{option.description}</p>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="feedback-comment">Nhận xét</Label>
                                                                <textarea
                                                                    id="feedback-comment"
                                                                    value={feedbackComment}
                                                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                                                    rows={4}
                                                                    className="min-h-24 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                                    placeholder="Viết vài dòng về trải nghiệm giao dịch..."
                                                                />
                                                            </div>

                                                            <DialogFooter>
                                                                <Button type="button" variant="ghost" onClick={() => setIsFeedbackDialogOpen(false)}>
                                                                    Hủy
                                                                </Button>
                                                                <Button type="submit" className="bg-brand text-white" disabled={isActionLoading}>
                                                                    {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Gửi đánh giá
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

