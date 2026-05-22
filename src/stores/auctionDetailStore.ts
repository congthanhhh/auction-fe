import { create } from 'zustand';
import { auctionService } from '@/services/auctionService';
import { bidService } from '@/services/bidService';
import { useAuthStore } from '@/stores/authStore';
import type {
    AuctionSessionResponse,
    AuctionApiError,
    BidRequest,
    BidResponse,
    PageResponse,
    PriceUpdateData,
} from '@/types/auction';

interface AuctionDetailState {
    auction: AuctionSessionResponse | null;
    bidHistory: PageResponse<BidResponse> | null;
    bidCount: number;
    isLoading: boolean;
    isPlacingBid: boolean;
    error: AuctionApiError | null;
    fetchAuctionDetail: (id: string, options?: { skipAuthRedirect?: boolean }) => Promise<void>;
    placeBid: (sessionId: number, amount: number) => Promise<void>;
    fetchBidHistory: (sessionId: number, page?: number, size?: number, options?: { skipAuthRedirect?: boolean }) => Promise<void>;
    fetchBidCount: (productId: number, options?: { skipAuthRedirect?: boolean }) => Promise<void>;
    handleNewBid: (newBid: BidResponse) => void;
    handlePriceUpdate: (priceUpdate: PriceUpdateData) => void;
}

const getAuctionError = (err: unknown): AuctionApiError => {
    if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as { response?: { data?: AuctionApiError } }).response;
        if (response?.data) {
            return response.data;
        }
    }

    if (typeof err === 'object' && err !== null && 'message' in err) {
        const message = (err as { message?: unknown }).message;
        if (typeof message === 'string' && message) {
            return { code: 'UNKNOWN_ERROR', message, status: 0 };
        }
    }

    return { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred', status: 0 };
};

export const useAuctionDetailStore = create<AuctionDetailState>((set, get) => ({
    auction: null,
    bidHistory: null,
    bidCount: 0,
    isLoading: false,
    isPlacingBid: false,
    error: null,
    fetchAuctionDetail: async (id: string, options) => {
        set({ isLoading: true, error: null });
        const skipAuthRedirect = options?.skipAuthRedirect ?? !useAuthStore.getState().isAuthenticated;
        try {
            const auctionData = await auctionService.getAuctionSessionDetail(id, { skipAuthRedirect });
            set({ auction: auctionData, isLoading: false });
            // After fetching auction, fetch bid count and history
            get().fetchBidCount(auctionData.product.id, { skipAuthRedirect });
            get().fetchBidHistory(auctionData.id, 1, 10, { skipAuthRedirect });
        } catch (err: unknown) {
            set({ error: getAuctionError(err), isLoading: false });
        }
    },
    placeBid: async (sessionId: number, amount: number) => {
        set({ isPlacingBid: true, error: null });
        try {
            const payload: BidRequest = { amount };
            await bidService.placeBid(sessionId, payload);
            // No need to refresh here, socket events will update the state
        } catch (err: unknown) {
            set({ error: getAuctionError(err) });
        } finally {
            set({ isPlacingBid: false });
        }
    },
    fetchBidHistory: async (sessionId: number, page: number = 1, size: number = 10, options) => {
        try {
            const historyData = await bidService.getBidHistory(sessionId, page, size, options);
            set({ bidHistory: historyData });
        } catch (err: unknown) {
            // Handle error silently for history or set a specific error state
            console.error("Failed to fetch bid history:", err);
        }
    },
    fetchBidCount: async (productId: number, options) => {
        try {
            const count = await bidService.getBidCount(productId, options);
            set({ bidCount: count });
        } catch (err: unknown) {
            console.error("Failed to fetch bid count:", err);
        }
    },
    handleNewBid: (newBid: BidResponse) => {
        set((state) => {
            if (state.bidHistory) {
                // Avoid adding duplicate bids
                if (state.bidHistory.data.some(b => b.id === newBid.id)) {
                    return {};
                }
                return {
                    bidHistory: {
                        ...state.bidHistory,
                        data: [newBid, ...state.bidHistory.data],
                        totalElements: state.bidHistory.totalElements + 1,
                    },
                };
            }
            return {};
        });
    },

    handlePriceUpdate: (priceUpdate: PriceUpdateData) => {
        set((state) => {
            if (state.auction) {
                return {
                    auction: {
                        ...state.auction,
                        currentPrice: priceUpdate.currentPrice,
                        highestBidder: priceUpdate.highestBidder,
                        reservePriceMet: priceUpdate.reservePriceMet,
                    },
                    // Also update bid count when price updates
                    bidCount: state.bidCount + 1,
                };
            }
            return {};
        });
    },
}));
