import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type { BidRequest, BidResponse, PageResponse } from '@/types/auction';

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

export const bidService = {
    placeBid: async (
        sessionId: number,
        payload: BidRequest,
    ): Promise<BidResponse> => {
        const response = await api.post(
            API_ENDPOINTS.AUCTION.BIDS(sessionId),
            payload,
        );
        return unwrapApiResponse<BidResponse>(response);
    },

    getBidCount: async (productId: number): Promise<number> => {
        const response = await api.get(
            API_ENDPOINTS.AUCTION.BID_COUNT(productId),
        );
        return unwrapApiResponse<number>(response);
    },

    getBidHistory: async (
        sessionId: number,
        page: number = 1,
        size: number = 10,
    ): Promise<PageResponse<BidResponse>> => {
        const response = await api.get(
            API_ENDPOINTS.AUCTION.BIDS(sessionId),
            {
                params: { page, size },
            },
        );
        return unwrapApiResponse<PageResponse<BidResponse>>(response);
    },
};
