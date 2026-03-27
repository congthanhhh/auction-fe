// Auction Status Constants
export const AuctionStatus = {
    SCHEDULED: 'SCHEDULED',      // Phiên đã được tạo nhưng chưa tới giờ bắt đầu
    ACTIVE: 'ACTIVE',            // Phiên đang diễn ra, cho phép đặt giá
    ENDED: 'ENDED',              // Phiên đã kết thúc (hết giờ)
    CANCELLED: 'CANCELLED',      // Phiên bị hủy
    FAILED: 'FAILED',            // Đã kết thúc nhưng không có người thắng hợp lệ
    WAITING_PAYMENT: 'WAITING_PAYMENT'
} as const;

export type AuctionStatus = typeof AuctionStatus[keyof typeof AuctionStatus];

// Product Status Constants
export const ProductStatus = {
    WAITING_FOR_APPROVAL: 'WAITING_FOR_APPROVAL', // Chờ admin duyệt
    ACTIVE: 'ACTIVE',                              // Đã duyệt, được phép lên sàn
    REJECTED: 'REJECTED',                          // Bị từ chối
    BANNED: 'BANNED'                               // Bị khóa sau này
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

// Base types
export interface Image {
    id: number;
    publicId: string;
    url: string;
}

export interface SimpleUserResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface CategoryResponse {
    id: number;
    name: string;
    description: string;
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    startPrice: number;
    createdAt: string;
    category: CategoryResponse;
    seller: SimpleUserResponse;
    status: ProductStatus;
    attributes: string;
    isActive: boolean;
    images: Image[];
}

export interface AuctionSessionResponse {
    id: number;
    startTime: string;
    endTime: string;
    startPrice: number;
    currentPrice: number;
    buyNowPrice: number | null;
    status: AuctionStatus;
    product: ProductResponse;
    highestBidder: SimpleUserResponse | null;
    reservePriceMet: boolean;
    myMaxBid: number | null;
}

export interface PageResponse<T> {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    data: T[];
}

// API Error Response
export interface AuctionApiError {
    code: string;
    message: string;
    status: number;
}

export interface BidRequest {
    amount: number;
}

export interface BidResponse {
    id: number;
    displayedAmount: number;
    bidTime: string; // LocalDateTime
    user: SimpleUserResponse;
    auctionSessionId: number;
}

export interface PriceUpdateData {
    currentPrice: number;
    highestBidder: SimpleUserResponse;
    reservePriceMet: boolean;
}
