import type { AuctionStatus, ProductStatus } from "@/types/auction";

export const auctionStatusLabelKeys: Record<AuctionStatus, string> = {
    SCHEDULED: "auction.status.SCHEDULED",
    ACTIVE: "auction.status.ACTIVE",
    ENDED: "auction.status.ENDED",
    CANCELLED: "auction.status.CANCELLED",
    FAILED: "auction.status.FAILED",
    WAITING_PAYMENT: "auction.status.WAITING_PAYMENT",
};

export const auctionStatusVariants: Record<AuctionStatus, string> = {
    SCHEDULED: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700",
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    ENDED: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-700",
    CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
    FAILED: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
    WAITING_PAYMENT: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
};

export const productStatusLabelKeys: Record<ProductStatus, string> = {
    WAITING_FOR_APPROVAL: "auction.productStatus.WAITING_FOR_APPROVAL",
    ACTIVE: "auction.productStatus.ACTIVE",
    REJECTED: "auction.productStatus.REJECTED",
    BANNED: "auction.productStatus.BANNED",
};
