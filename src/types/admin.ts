import type {
    AuctionStatus,
    CategoryRequest,
    CategoryResponse,
    Image,
    PageResponse,
    ProductResponse,
    ProductSearchRequest,
    SimpleUserResponse,
} from "@/types/auction";
import type {
    DisputeDecision,
    DisputeResponse,
    InvoiceResponse,
    InvoiceStatus,
    InvoiceType,
} from "@/types/invoice";
import type { PermissionResponse, RoleResponse } from "@/types/user";

export type AdminSettingValue = string | number | boolean | null | AdminSettingValue[] | {
    [key: string]: AdminSettingValue;
};

export interface AdminPageQuery {
    page?: number;
    size?: number;
}

export interface UserResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    noPassword: boolean;
    email: string;
    phoneNumber?: string | null;
    isActive?: boolean | null;
    createdAt: string;
    updatedAt?: string | null;
    roles: RoleResponse[];
}

export interface AdminCreationRequest {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    roles: string[];
    createdAt?: string;
}

export interface AdminUpdateRequest {
    password?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    isActive?: boolean;
    strikeCount?: number;
    reputationScore?: number;
    roles?: string[];
    updatedAt?: string;
}

export interface AdminActiveStatusRequest {
    isActive: boolean;
}

export interface ProductUpdateRequest {
    name?: string;
    description?: string;
    startPrice?: number;
    categoryId?: number;
    attributes?: string;
    imageIdsToAdd?: number[];
    imageIdsToRemove?: number[];
}

export interface SimpleAdminProductResponse {
    id: number;
    name: string;
    seller: SimpleUserResponse;
    startPrice: number;
    images: Image[];
}

export interface AdminAuctionSessionResponse {
    id: number;
    startTime: string;
    endTime: string;
    startPrice: number;
    currentPrice: number;
    reservePrice?: number | null;
    buyNowPrice?: number | null;
    highestMaxBid?: number | null;
    status: AuctionStatus;
    product: SimpleAdminProductResponse;
    highestBidder?: SimpleUserResponse | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface AdminUpdateSessionRequest {
    startTime?: string;
    endTime?: string;
    startPrice?: number;
    reservePrice?: number;
    buyNowPrice?: number;
    status?: AuctionStatus;
}

export interface AuctionSessionAdminSearchRequest {
    productName?: string;
    status?: AuctionStatus;
    sort?: string;
}

export interface InvoiceAdminSearchRequest {
    keyword?: string;
    status?: InvoiceStatus;
    type?: InvoiceType;
    sort?: string;
}

export interface AdminUpdateInvoiceRequest {
    status?: InvoiceStatus;
    trackingCode?: string;
    carrier?: string;
    recipientName?: string;
    recipientPhone?: string;
    shippingAddress?: string;
    note?: string;
}

export interface DisputeSearchRequest {
    decision?: DisputeDecision | string;
    sort?: string;
}

export interface ResolveDisputeRequest {
    decision: DisputeDecision;
    adminNote?: string;
}

export interface RoleRequest {
    name: string;
    description: string;
    permissions: string[];
}

export interface PermissionRequest {
    name: string;
    description: string;
}

export interface StatisticResponse {
    totalUsers: number;
    activeAuctions: number;
    pendingProducts: number;
    totalRevenue: number;
    totalGMV: number;
    totalListingFee: number;
    commissionRevenue: number;
}

export interface AdminSettingResponse {
    key: string;
    value: AdminSettingValue;
    description?: string;
    updatedAt?: string;
}

export interface AdminLogResponse {
    id?: number | string;
    timestamp?: string;
    createdAt?: string;
    actor?: string;
    action?: string;
    target?: string;
    severity?: string;
    status?: string;
    message?: string;
    [key: string]: unknown;
}

export type AdminUsersPage = PageResponse<UserResponse>;
export type AdminProductsPage = PageResponse<ProductResponse>;
export type AdminAuctionsPage = PageResponse<AdminAuctionSessionResponse>;
export type AdminInvoicesPage = PageResponse<InvoiceResponse>;
export type AdminDisputesPage = PageResponse<DisputeResponse>;
export type AdminLogsPage = PageResponse<AdminLogResponse>;

export type AdminProductSearchParams = ProductSearchRequest & AdminPageQuery;
export type AdminAuctionSearchParams = AuctionSessionAdminSearchRequest & AdminPageQuery;
export type AdminInvoiceSearchParams = InvoiceAdminSearchRequest & AdminPageQuery;
export type AdminDisputeSearchParams = DisputeSearchRequest & AdminPageQuery;
export type AdminUserSearchParams = AdminPageQuery;

export type { CategoryRequest, CategoryResponse, PermissionResponse, RoleResponse };
