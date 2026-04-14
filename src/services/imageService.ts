import { api } from "./api";
import { API_ENDPOINTS } from "@/constants/api";
import type { Image } from "@/types/auction";

function unwrapApiResponse<T>(response: any): T {
    return response as T;
}

export const imageService = {
    uploadImage: async (file: File): Promise<Image> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(API_ENDPOINTS.IMAGE.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return unwrapApiResponse<Image>(response);
    },

    deleteImage: async (id: number): Promise<void> => {
        await api.delete(API_ENDPOINTS.IMAGE.DELETE(id));
    },
};

