import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { ProductRequest, ProductResponse, PageResponse } from "@/types/auction";

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

export const productService = {
    createProduct: async (payload: ProductRequest): Promise<ProductResponse> => {
        const response = await api.post(API_ENDPOINTS.PRODUCT.ROOT, payload);
        return unwrapApiResponse<ProductResponse>(response);
    },

    getProducts: async (
        page: number = 1,
        size: number = 10,
    ): Promise<PageResponse<ProductResponse>> => {
        const response = await api.get(API_ENDPOINTS.PRODUCT.ROOT, {
            params: { page, size },
        });
        return unwrapApiResponse<PageResponse<ProductResponse>>(response);
    },

    getMyProducts: async (): Promise<ProductResponse[]> => {
        const response = await api.get(API_ENDPOINTS.PRODUCT.MY_PRODUCTS);
        return unwrapApiResponse<ProductResponse[]>(response);
    },
};
