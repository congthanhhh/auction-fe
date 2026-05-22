import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { PublicUserProfileResponse, UserProfileResponse } from "@/types/user";
import type { AxiosRequestConfig } from "axios";

function unwrapApiResponse<T>(response: unknown): T {
    return response as T;
}

export const userService = {
    getMyProfile: async (): Promise<UserProfileResponse> => {
        const response = await api.get(API_ENDPOINTS.USER.MY_PROFILE);
        return unwrapApiResponse<UserProfileResponse>(response);
    },

    getPublicProfile: async (userId: string, config?: AxiosRequestConfig): Promise<PublicUserProfileResponse> => {
        const response = await api.get(API_ENDPOINTS.USER.PUBLIC_PROFILE(userId), config);
        return unwrapApiResponse<PublicUserProfileResponse>(response);
    },
};
