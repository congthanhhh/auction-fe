import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { PaymentResponse } from "@/types/payment";

function unwrapApiResponse<T>(response: any): T {
	return response as T;
}

export const paymentService = {
	createVnPayPayment: async (invoiceId: number, addressId: number): Promise<string> => {
		const response = await api.get(API_ENDPOINTS.PAYMENT.VN_PAY, {
			params: { invoiceId, addressId },
		});
		return unwrapApiResponse<string>(response);
	},

	handleVnPayCallback: async (params: Record<string, string>): Promise<PaymentResponse> => {
		const response = await api.get(API_ENDPOINTS.PAYMENT.VN_PAY_CALLBACK, {
			params,
		});
		return unwrapApiResponse<PaymentResponse>(response);
	},
};

