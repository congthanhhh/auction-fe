import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
    AuctionSessionRequest,
    AuctionSessionResponse,
    AuctionStatus,
    CreateAuctionSessionResponse,
    PageResponse,
    UpdateAuctionSessionRequest,
} from '@/types/auction';
import type { InvoiceResponse } from '@/types/invoice';

/**
 * Helper để unwrap response từ api instance
 * API interceptor tự động return response.data, nhưng TypeScript không biết điều này
 * Hàm này giúp cast type một cách rõ ràng và dễ hiểu
 */
function unwrapApiResponse<T>(response: unknown): T {
    return response as T;
}

export const auctionService = {
    getActiveAuctionSessionsDesc: async (
        page: number = 1,
        size: number = 10
    ): Promise<PageResponse<AuctionSessionResponse>> => {
        const response = await api.get(API_ENDPOINTS.AUCTION.ACTIVE_DESC, {
            params: { page, size }
        });
        return unwrapApiResponse<PageResponse<AuctionSessionResponse>>(response);
    },

    getAuctionSessionDetail: async (
        id: string | number,
        config?: AxiosRequestConfig,
    ): Promise<AuctionSessionResponse> => {
        const response = await api.get(
            API_ENDPOINTS.AUCTION.DETAIL(String(id)),
            config,
        );
        return unwrapApiResponse<AuctionSessionResponse>(response);
    },

    getMyJoinedSessions: async (
        page: number = 1,
        size: number = 10,
        status?: AuctionStatus
    ): Promise<PageResponse<AuctionSessionResponse>> => {
        const params: { page: number; size: number; status?: AuctionStatus } = { page, size };
        if (status) {
            params.status = status;
        }

        const response = await api.get(API_ENDPOINTS.AUCTION.MY_JOINED, { params });
        return unwrapApiResponse<PageResponse<AuctionSessionResponse>>(response);
    },

    getMySessions: async (
        page: number = 1,
        size: number = 10,
        status?: AuctionStatus
    ): Promise<PageResponse<AuctionSessionResponse>> => {
        const params: { page: number; size: number; status?: AuctionStatus } = { page, size };
        if (status) {
            params.status = status;
        }

        const response = await api.get(API_ENDPOINTS.AUCTION.MY_SESSIONS, { params });
        return unwrapApiResponse<PageResponse<AuctionSessionResponse>>(response);
    },

    buyNow: async (id: number | string): Promise<InvoiceResponse> => {
        const numericId = Number(id);
        const response = await api.post(API_ENDPOINTS.AUCTION.BUY_NOW(numericId));
        return unwrapApiResponse<InvoiceResponse>(response);
    },

    cancelSession: async (id: number | string): Promise<AuctionSessionResponse> => {
        const numericId = Number(id);
        const response = await api.put(API_ENDPOINTS.AUCTION.CANCEL_SESSION(numericId));
        return unwrapApiResponse<AuctionSessionResponse>(response);
    },

    reactivateSession: async (id: number | string): Promise<AuctionSessionResponse> => {
        const numericId = Number(id);
        const response = await api.put(API_ENDPOINTS.AUCTION.REACTIVATE_SESSION(numericId));
        return unwrapApiResponse<AuctionSessionResponse>(response);
    },

    updateSession: async (id: number | string, data: UpdateAuctionSessionRequest): Promise<void> => {
        const numericId = Number(id);
        await api.put(API_ENDPOINTS.AUCTION.UPDATE_SESSION(numericId), data);
    },

    createSession: async (data: AuctionSessionRequest): Promise<CreateAuctionSessionResponse> => {
        const response = await api.post(API_ENDPOINTS.AUCTION.CREATE_SESSION, data);
        return unwrapApiResponse<CreateAuctionSessionResponse>(response);
    },
};
