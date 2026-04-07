import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { AddressRequest, AddressResponse, MessageResponse } from "@/types/user";

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

export const addressService = {
    getMyAddresses: async (): Promise<AddressResponse[]> => {
        const response = await api.get(API_ENDPOINTS.ADDRESS.ROOT);
        return unwrapApiResponse<AddressResponse[]>(response);
    },

    createAddress: async (payload: AddressRequest): Promise<AddressResponse> => {
        const response = await api.post(API_ENDPOINTS.ADDRESS.ROOT, payload);
        return unwrapApiResponse<AddressResponse>(response);
    },

    updateAddress: async (
        id: number,
        payload: AddressRequest,
    ): Promise<AddressResponse> => {
        const response = await api.put(API_ENDPOINTS.ADDRESS.BY_ID(id), payload);
        return unwrapApiResponse<AddressResponse>(response);
    },

    setDefaultAddress: async (id: number): Promise<MessageResponse> => {
        const response = await api.patch(API_ENDPOINTS.ADDRESS.SET_DEFAULT(id));
        return unwrapApiResponse<MessageResponse>(response);
    },

    deleteAddress: async (id: number): Promise<void> => {
        await api.delete(API_ENDPOINTS.ADDRESS.BY_ID(id));
    },
};
