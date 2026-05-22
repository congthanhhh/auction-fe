import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { DisputeRequest, DisputeResponse, InvoicePageResponse, InvoiceResponse, InvoiceStatus, InvoiceType, SellerRevenueResponse, ShipInvoiceRequest } from "@/types/invoice";
import type { MessageResponse } from "@/types/user";

function unwrapApiResponse<T>(response: unknown): T {
    return response as T;
}

interface GetMyInvoicesParams {
    page?: number;
    size?: number;
    status?: InvoiceStatus;
    type?: InvoiceType;
}

interface GetSellerInvoicesParams {
    page?: number;
    size?: number;
    status?: InvoiceStatus;
}

export const invoiceService = {
    getMyInvoices: async (
        params: GetMyInvoicesParams = {}
    ): Promise<InvoicePageResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.MY_INVOICES, {
            params,
        });
        return unwrapApiResponse<InvoicePageResponse>(response);
    },

    getMySales: async (
        params: GetSellerInvoicesParams = {}
    ): Promise<InvoicePageResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.MY_SALES, {
            params,
        });
        return unwrapApiResponse<InvoicePageResponse>(response);
    },

    getMyListingFees: async (
        params: GetSellerInvoicesParams = {}
    ): Promise<InvoicePageResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.MY_LISTING_FEES, {
            params,
        });
        return unwrapApiResponse<InvoicePageResponse>(response);
    },

    getSoldInvoices: async (
        params: GetSellerInvoicesParams = {}
    ): Promise<InvoicePageResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.SOLD_INVOICES, {
            params,
        });
        return unwrapApiResponse<InvoicePageResponse>(response);
    },

    getSellerStats: async (): Promise<SellerRevenueResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.SELLER_STATS);
        return unwrapApiResponse<SellerRevenueResponse>(response);
    },

    getInvoiceById: async (id: number): Promise<InvoiceResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.DETAIL(id));
        return unwrapApiResponse<InvoiceResponse>(response);
    },

    shipInvoice: async (id: number, payload: ShipInvoiceRequest): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.SHIP(id), payload);
        return unwrapApiResponse<MessageResponse>(response);
    },

    confirmInvoice: async (id: number): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.CONFIRM(id));
        return unwrapApiResponse<MessageResponse>(response);
    },

    disputeInvoice: async (id: number, payload: DisputeRequest): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.DISPUTE(id), payload);
        return unwrapApiResponse<MessageResponse>(response);
    },

    getDisputeByInvoice: async (invoiceId: number): Promise<DisputeResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.DISPUTE_DETAIL(invoiceId));
        return unwrapApiResponse<DisputeResponse>(response);
    },

    reportNonpayment: async (id: number): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.REPORT_NONPAYMENT(id));
        return unwrapApiResponse<MessageResponse>(response);
    },
};
