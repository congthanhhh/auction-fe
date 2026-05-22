import { API_ENDPOINTS } from "@/constants/api";
import { api } from "@/services/api";
import type { FeedbackPageResponse, FeedbackRequest } from "@/types/feedback";
import type { MessageResponse } from "@/types/user";
import type { AxiosRequestConfig } from "axios";

function unwrapApiResponse<T>(response: unknown): T {
    return response as T;
}

export const feedbackService = {
    createFeedback: async (
        invoiceId: number,
        payload: FeedbackRequest,
    ): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.FEEDBACK.CREATE(invoiceId), payload);
        return unwrapApiResponse<MessageResponse>(response);
    },

    updateFeedback: async (
        id: number,
        payload: FeedbackRequest,
    ): Promise<string> => {
        const response = await api.put(API_ENDPOINTS.FEEDBACK.UPDATE(id), payload);
        return unwrapApiResponse<string>(response);
    },

    getMyTotalFeedback: async (): Promise<number> => {
        const response = await api.get(API_ENDPOINTS.FEEDBACK.MY_TOTAL);
        return unwrapApiResponse<number>(response);
    },

    getPublicFeedback: async (
        userId: string,
        page: number = 1,
        size: number = 10,
        config?: AxiosRequestConfig,
    ): Promise<FeedbackPageResponse> => {
        const response = await api.get(API_ENDPOINTS.FEEDBACK.PUBLIC(userId), {
            ...config,
            params: { page, size },
        });
        return unwrapApiResponse<FeedbackPageResponse>(response);
    },
};
