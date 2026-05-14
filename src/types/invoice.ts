import type { Image, SimpleUserResponse, PageResponse } from "@/types/auction";

export const InvoiceStatus = {
    PENDING: "PENDING",
    PAID: "PAID",
    SHIPPING: "SHIPPING",
    COMPLETED: "COMPLETED",
    DISPUTE: "DISPUTE",
    CANCELLED_NON_PAYMENT: "CANCELLED_NON_PAYMENT",
    CANCELLED_BY_SELLER: "CANCELLED_BY_SELLER",
    REFUNDED: "REFUNDED",
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const InvoiceType = {
    AUCTION_SALE: "AUCTION_SALE",
    LISTING_FEE: "LISTING_FEE",
} as const;

export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];

export const DisputeDecision = {
    PENDING: "PENDING",
    REFUND_TO_BUYER: "REFUND_TO_BUYER",
    RELEASE_TO_SELLER: "RELEASE_TO_SELLER",
} as const;

export type DisputeDecision = (typeof DisputeDecision)[keyof typeof DisputeDecision];

export interface SimpleProductResponse {
    id: number;
    name: string;
    seller: SimpleUserResponse;
    startPrice: number;
    images: Image[];
}

export interface InvoiceResponse {
    id: number;
    user: SimpleUserResponse;
    product: SimpleProductResponse;
    auctionSessionId: number;
    finalPrice: number;
    status: InvoiceStatus;
    createdAt: string; // ISO string from LocalDateTime
    dueDate: string; // ISO string from LocalDateTime
    type: InvoiceType;
    shippingAddress: string;
    recipientName: string;
    recipientEmail?: string | null;
    recipientPhone: string;
    trackingCode: string | null;
    carrier: string | null;
    shippedAt: string | null;
    paymentTime: string | null;
    hasFeedback: boolean;
}

export type InvoicePageResponse = PageResponse<InvoiceResponse>;

export interface ShipInvoiceRequest {
    trackingCode: string;
    carrier?: string;
}

export interface DisputeRequest {
    reason: string;
}

export interface DisputeResponse {
    id: number;
    invoiceId: number;
    reason: string;
    decision: DisputeDecision;
    adminNote?: string | null;
    createdAt: string;
    resolvedAt?: string | null;
}
