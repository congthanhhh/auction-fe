import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';

interface NotificationState {
    unreadCount: number;
    fetchUnreadCount: () => Promise<void>;
    decrementUnreadCount: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    fetchUnreadCount: async () => {
        try {
            const data = await notificationService.getUnreadCount();
            // Server trả về { count: number } hoặc Map<String, Long> -> tuỳ theo api response. 
            // Theo ENDPOINT.md: Map<String, Long> e.g. { "count": 5 }
            set({ unreadCount: data.count || 0 });
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },
    decrementUnreadCount: () =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
    setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
