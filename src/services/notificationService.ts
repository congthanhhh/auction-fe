import { api } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type { NotificationResponse } from '@/types/notification';
import type { PageResponse } from '@/types/auction';

export const notificationService = {
    getNotifications: async (page: number = 1, size: number = 10): Promise<PageResponse<NotificationResponse>> => {
        const response = await api.get(API_ENDPOINTS.NOTIFICATION.ROOT, {
            params: { page, size }
        });
        return response as unknown as PageResponse<NotificationResponse>;
    },

    markAsRead: async (id: number): Promise<NotificationResponse> => {
        const response = await api.patch(API_ENDPOINTS.NOTIFICATION.READ(id));
        return response as unknown as NotificationResponse;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await api.get(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
        return response as unknown as { count: number };
    }
};
