import type { AuctionStatus, ProductStatus } from "@/types/auction";

export const auctionStatusLabels: Record<AuctionStatus, string> = {
    SCHEDULED: "Chưa bắt đầu",
    ACTIVE: "Đang diễn ra",
    ENDED: "Đã kết thúc",
    CANCELLED: "Đã hủy",
    FAILED: "Không thành công",
    WAITING_PAYMENT: "Chờ thanh toán",
};

export const auctionStatusVariants: Record<AuctionStatus, string> = {
    SCHEDULED: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700",
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    ENDED: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-700",
    CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
    FAILED: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
    WAITING_PAYMENT: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
};

export const productStatusLabels: Record<ProductStatus, string> = {
    WAITING_FOR_APPROVAL: "Chờ duyệt",
    ACTIVE: "Đã duyệt",
    REJECTED: "Bị từ chối",
    BANNED: "Bị khóa",
};
