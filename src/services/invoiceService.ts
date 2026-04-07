import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { InvoicePageResponse, InvoiceStatus, InvoiceType } from "@/types/invoice";

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
};
