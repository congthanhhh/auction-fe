import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { UserProfileResponse } from "@/types/user";

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

export const userService = {
    getMyProfile: async (): Promise<UserProfileResponse> => {
        const response = await api.get(API_ENDPOINTS.USER.MY_PROFILE);
        return unwrapApiResponse<UserProfileResponse>(response);
    },
};
