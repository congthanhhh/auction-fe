import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
    AuctionSessionResponse,
    PageResponse
} from '@/types/auction';

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

    // getActiveAuctionsDesc: async (page: number = 1, size: number = 10) => {
    //     return await api.get<PageResponse<AuctionSessionResponse>>(API_ENDPOINTS.AUCTION.ACTIVE_DESC, {
    //         params: { page, size }
    //     });
    // },

    getAuctionSessionDetail: async (
        id: string | number
    ): Promise<AuctionSessionResponse> => {
        const response = await api.get(
            API_ENDPOINTS.AUCTION.DETAIL(String(id))
        );
        return unwrapApiResponse<AuctionSessionResponse>(response);
    },
};
