import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type {
    AdminActiveStatusRequest,
    AdminAuctionSearchParams,
    AdminAuctionsPage,
    AdminCreationRequest,
    AdminDisputeSearchParams,
    AdminDisputesPage,
    AdminInvoiceSearchParams,
    AdminInvoicesPage,
    AdminLogsPage,
    AdminPageQuery,
    AdminProductSearchParams,
    AdminProductsPage,
    AdminSettingResponse,
    AdminSettingValue,
    AdminUpdateInvoiceRequest,
    AdminUpdateRequest,
    AdminUpdateSessionRequest,
    AdminUserSearchParams,
    AdminUsersPage,
    PermissionRequest,
    ProductUpdateRequest,
    ProductVerifyRequest,
    ResolveDisputeRequest,
    RoleRequest,
    StatisticResponse,
    UserResponse,
} from "@/types/admin";
import type { CategoryRequest, CategoryResponse, PageResponse, ProductResponse } from "@/types/auction";
import type { DisputeResponse, InvoiceResponse } from "@/types/invoice";
import type { MessageResponse, PermissionResponse, RoleResponse } from "@/types/user";

function unwrapApiResponse<T>(response: unknown): T {
    return response as T;
}

export const adminService = {
    getStatistics: async (): Promise<StatisticResponse> => {
        const response = await api.get(API_ENDPOINTS.ADMIN.STATISTICS);
        return unwrapApiResponse<StatisticResponse>(response);
    },

    getLogs: async (params: AdminPageQuery = {}): Promise<AdminLogsPage> => {
        const response = await api.get(API_ENDPOINTS.ADMIN.LOGS, { params });
        return unwrapApiResponse<AdminLogsPage>(response);
    },

    getSettings: async (): Promise<AdminSettingResponse[] | Record<string, AdminSettingValue>> => {
        const response = await api.get(API_ENDPOINTS.ADMIN.SETTINGS);
        return unwrapApiResponse<AdminSettingResponse[] | Record<string, AdminSettingValue>>(response);
    },

    updateSetting: async (key: string, value: AdminSettingValue): Promise<AdminSettingResponse> => {
        const response = await api.put(API_ENDPOINTS.ADMIN.SETTING_BY_KEY(key), { value });
        return unwrapApiResponse<AdminSettingResponse>(response);
    },

    searchUsers: async (params: AdminUserSearchParams = {}): Promise<AdminUsersPage> => {
        const response = await api.get(API_ENDPOINTS.USER.ADMIN_SEARCH, { params });
        return unwrapApiResponse<AdminUsersPage>(response);
    },

    getUserById: async (id: string): Promise<UserResponse> => {
        const response = await api.get(API_ENDPOINTS.USER.BY_ID(id));
        return unwrapApiResponse<UserResponse>(response);
    },

    createUser: async (payload: AdminCreationRequest): Promise<UserResponse> => {
        const response = await api.post(API_ENDPOINTS.USER.ADMIN_CREATE, payload);
        return unwrapApiResponse<UserResponse>(response);
    },

    updateUser: async (userId: string, payload: AdminUpdateRequest): Promise<UserResponse> => {
        const response = await api.put(API_ENDPOINTS.USER.ADMIN_UPDATE(userId), payload);
        return unwrapApiResponse<UserResponse>(response);
    },

    updateUserActiveStatus: async (
        id: string,
        payload: AdminActiveStatusRequest,
    ): Promise<UserResponse | MessageResponse> => {
        const response = await api.patch(API_ENDPOINTS.USER.ADMIN_ACTIVE_STATUS(id), payload);
        return unwrapApiResponse<UserResponse | MessageResponse>(response);
    },

    searchProducts: async (params: AdminProductSearchParams = {}): Promise<AdminProductsPage> => {
        const response = await api.get(API_ENDPOINTS.PRODUCT.ADMIN_SEARCH, { params });
        return unwrapApiResponse<AdminProductsPage>(response);
    },

    getPendingProducts: async (params: AdminPageQuery = {}): Promise<AdminProductsPage> => {
        const response = await api.get(API_ENDPOINTS.PRODUCT.ADMIN_PENDING, { params });
        return unwrapApiResponse<AdminProductsPage>(response);
    },

    verifyProduct: async (
        id: number,
        payload: ProductVerifyRequest,
    ): Promise<MessageResponse | ProductResponse> => {
        const response = await api.patch(API_ENDPOINTS.PRODUCT.ADMIN_VERIFY(id), payload);
        return unwrapApiResponse<MessageResponse | ProductResponse>(response);
    },

    updateProduct: async (id: number, payload: ProductUpdateRequest): Promise<ProductResponse> => {
        const response = await api.put(API_ENDPOINTS.PRODUCT.ADMIN_UPDATE(id), payload);
        return unwrapApiResponse<ProductResponse>(response);
    },

    searchAuctions: async (params: AdminAuctionSearchParams = {}): Promise<AdminAuctionsPage> => {
        const response = await api.get(API_ENDPOINTS.ADMIN.AUCTION_SEARCH, { params });
        return unwrapApiResponse<AdminAuctionsPage>(response);
    },

    updateAuction: async (
        id: number,
        payload: AdminUpdateSessionRequest,
    ): Promise<AdminUpdateSessionRequest> => {
        const response = await api.put(API_ENDPOINTS.ADMIN.AUCTION_UPDATE(id), payload);
        return unwrapApiResponse<AdminUpdateSessionRequest>(response);
    },

    searchInvoices: async (params: AdminInvoiceSearchParams = {}): Promise<AdminInvoicesPage> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.ADMIN_SEARCH, { params });
        return unwrapApiResponse<AdminInvoicesPage>(response);
    },

    getInvoiceById: async (invoiceId: number): Promise<InvoiceResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.ADMIN_DETAIL(invoiceId));
        return unwrapApiResponse<InvoiceResponse>(response);
    },

    updateInvoice: async (
        id: number,
        payload: AdminUpdateInvoiceRequest,
    ): Promise<InvoiceResponse | MessageResponse> => {
        const response = await api.put(API_ENDPOINTS.INVOICE.ADMIN_UPDATE(id), payload);
        return unwrapApiResponse<InvoiceResponse | MessageResponse>(response);
    },

    searchDisputes: async (params: AdminDisputeSearchParams = {}): Promise<AdminDisputesPage> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.ADMIN_DISPUTES, { params });
        return unwrapApiResponse<AdminDisputesPage>(response);
    },

    resolveDispute: async (
        id: number,
        payload: ResolveDisputeRequest,
    ): Promise<DisputeResponse | MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.ADMIN_RESOLVE_DISPUTE(id), payload);
        return unwrapApiResponse<DisputeResponse | MessageResponse>(response);
    },

    getCategories: async (params: AdminPageQuery = {}): Promise<PageResponse<CategoryResponse>> => {
        const response = await api.get(API_ENDPOINTS.CATEGORY.ROOT, { params });
        return unwrapApiResponse<PageResponse<CategoryResponse>>(response);
    },

    createCategory: async (payload: CategoryRequest): Promise<CategoryResponse> => {
        const response = await api.post(API_ENDPOINTS.CATEGORY.ROOT, payload);
        return unwrapApiResponse<CategoryResponse>(response);
    },

    updateCategory: async (id: number, payload: CategoryRequest): Promise<CategoryResponse> => {
        const response = await api.post(API_ENDPOINTS.CATEGORY.BY_ID(id), payload);
        return unwrapApiResponse<CategoryResponse>(response);
    },

    deleteCategory: async (id: number): Promise<void> => {
        await api.delete(API_ENDPOINTS.CATEGORY.BY_ID(id));
    },

    getRoles: async (): Promise<RoleResponse[]> => {
        const response = await api.get(API_ENDPOINTS.ROLE.ROOT);
        return unwrapApiResponse<RoleResponse[]>(response);
    },

    createRole: async (payload: RoleRequest): Promise<RoleResponse> => {
        const response = await api.post(API_ENDPOINTS.ROLE.ROOT, payload);
        return unwrapApiResponse<RoleResponse>(response);
    },

    deleteRole: async (role: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.ROLE.BY_ROLE(role));
    },

    getPermissions: async (): Promise<PermissionResponse[]> => {
        const response = await api.get(API_ENDPOINTS.ROLE.PERMISSIONS);
        return unwrapApiResponse<PermissionResponse[]>(response);
    },

    createPermission: async (payload: PermissionRequest): Promise<PermissionResponse> => {
        const response = await api.post(API_ENDPOINTS.ROLE.PERMISSIONS, payload);
        return unwrapApiResponse<PermissionResponse>(response);
    },

    deletePermission: async (permission: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.ROLE.PERMISSION_BY_NAME(permission));
    },
};
