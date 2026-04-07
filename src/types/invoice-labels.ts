import type { InvoiceStatus, InvoiceType } from "@/types/invoice";

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    SHIPPING: "Đang giao hàng",
    COMPLETED: "Hoàn thành",
    DISPUTE: "Khiếu nại",
    CANCELLED_NON_PAYMENT: "Hủy (bùng hàng)",
    CANCELLED_BY_SELLER: "Hủy bởi người bán",
    REFUNDED: "Đã hoàn tiền",
};

export const invoiceStatusVariants: Record<InvoiceStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    PAID: "bg-emerald-100 text-emerald-800 border-emerald-200",
    SHIPPING: "bg-sky-100 text-sky-800 border-sky-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    DISPUTE: "bg-orange-100 text-orange-800 border-orange-200",
    CANCELLED_NON_PAYMENT: "bg-red-100 text-red-800 border-red-200",
    CANCELLED_BY_SELLER: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-purple-100 text-purple-800 border-purple-200",
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
    AUCTION_SALE: "Hóa đơn mua hàng",
    LISTING_FEE: "Phí giá sàn",
};
