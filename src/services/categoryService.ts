import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { CategoryRequest, CategoryResponse, PageResponse } from "@/types/auction";

function unwrapApiResponse<T>(response: any): T {
	return response as T;
}

export const categoryService = {
	getCategories: async (
		page: number = 1,
		size: number = 20,
	): Promise<PageResponse<CategoryResponse>> => {
		const response = await api.get(API_ENDPOINTS.CATEGORY.ROOT, {
			params: { page, size },
		});
		return unwrapApiResponse<PageResponse<CategoryResponse>>(response);
	},

	getCategoryById: async (id: number): Promise<CategoryResponse> => {
		const response = await api.get(API_ENDPOINTS.CATEGORY.BY_ID(id));
		return unwrapApiResponse<CategoryResponse>(response);
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
};

