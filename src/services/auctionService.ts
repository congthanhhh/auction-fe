import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type { AuctionSessionResponse, AuctionStatus, PageResponse } from '@/types/auction';

/**
 * Helper để unwrap response từ api instance
 * API interceptor tự động return response.data, nhưng TypeScript không biết điều này
 * Hàm này giúp cast type một cách rõ ràng và dễ hiểu
 */
function unwrapApiResponse<T>(response: any): T {
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
        id: string | number
    ): Promise<AuctionSessionResponse> => {
        const response = await api.get(
            API_ENDPOINTS.AUCTION.DETAIL(String(id))
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
};
