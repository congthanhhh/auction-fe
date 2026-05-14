import type { PageResponse } from "@/types/auction";

export const FeedbackRating = {
    POSITIVE: "POSITIVE",
    NEUTRAL: "NEUTRAL",
    NEGATIVE: "NEGATIVE",
} as const;

export type FeedbackRating = (typeof FeedbackRating)[keyof typeof FeedbackRating];

export interface FeedbackRequest {
    rating: FeedbackRating;
    comment?: string;
}

export interface FeedbackDto {
    id: number;
    invoiceId?: number;
    fromUsername: string;
    toUsername: string;
    rating: FeedbackRating;
    comment?: string | null;
    createdAt: string;
    reviewAs: "BUYER" | "SELLER" | string;
}

export type FeedbackPageResponse = PageResponse<FeedbackDto>;
