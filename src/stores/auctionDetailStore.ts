import { create } from 'zustand';
import { auctionService } from '@/services/auctionService';
import { bidService } from '@/services/bidService';
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
    fetchAuctionDetail: (id: string) => Promise<void>;
    placeBid: (sessionId: number, amount: number) => Promise<void>;
    fetchBidHistory: (sessionId: number, page?: number, size?: number) => Promise<void>;
    fetchBidCount: (productId: number) => Promise<void>;
    handleNewBid: (newBid: BidResponse) => void;
    handlePriceUpdate: (priceUpdate: PriceUpdateData) => void;
}

export const useAuctionDetailStore = create<AuctionDetailState>((set, get) => ({
    auction: null,
    bidHistory: null,
    bidCount: 0,
    isLoading: false,
    isPlacingBid: false,
    error: null,
    fetchAuctionDetail: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const auctionData = await auctionService.getAuctionSessionDetail(id);
            set({ auction: auctionData, isLoading: false });
            // After fetching auction, fetch bid count and history
            get().fetchBidCount(auctionData.product.id);
            get().fetchBidHistory(auctionData.id);
        } catch (err: any) {
            set({ error: err.response?.data || { message: 'An unknown error occurred' }, isLoading: false });
        }
    },
    placeBid: async (sessionId: number, amount: number) => {
        set({ isPlacingBid: true, error: null });
        try {
            const payload: BidRequest = { amount };
            await bidService.placeBid(sessionId, payload);
            // No need to refresh here, socket events will update the state
        } catch (err: any) {
            set({ error: err.response?.data || { message: 'An unknown error occurred' } });
        } finally {
            set({ isPlacingBid: false });
        }
    },
    fetchBidHistory: async (sessionId: number, page: number = 1, size: number = 10) => {
        try {
            const historyData = await bidService.getBidHistory(sessionId, page, size);
            set({ bidHistory: historyData });
        } catch (err: any) {
            // Handle error silently for history or set a specific error state
            console.error("Failed to fetch bid history:", err);
        }
    },
    fetchBidCount: async (productId: number) => {
        try {
            const count = await bidService.getBidCount(productId);
            set({ bidCount: count });
        } catch (err: any) {
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
