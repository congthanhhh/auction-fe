import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { InvoicePageResponse, InvoiceResponse, InvoiceStatus, InvoiceType, DisputeRequest } from "@/types/invoice";
import type { MessageResponse } from "@/types/user";

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

interface GetMyInvoicesParams {
    page?: number;
    size?: number;
    status?: InvoiceStatus;
    type?: InvoiceType;
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
        params: GetMyInvoicesParams = {}
    ): Promise<InvoicePageResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.MY_SALES, {
            params,
        });
        return unwrapApiResponse<InvoicePageResponse>(response);
    },

    getInvoiceById: async (id: number): Promise<InvoiceResponse> => {
        const response = await api.get(API_ENDPOINTS.INVOICE.DETAIL(id));
        return unwrapApiResponse<InvoiceResponse>(response);
    },

    shipInvoice: async (id: number, payload: import("@/types/invoice").ShipInvoiceRequest): Promise<MessageResponse> => {
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

    reportNonpayment: async (id: number): Promise<MessageResponse> => {
        const response = await api.post(API_ENDPOINTS.INVOICE.REPORT_NONPAYMENT(id));
        return unwrapApiResponse<MessageResponse>(response);
    },
};
