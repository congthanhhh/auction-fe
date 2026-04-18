import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notificationStore';
import { notificationService } from '@/services/notificationService';
import type { NotificationResponse } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';

export function NotificationBell() {
    const { unreadCount, fetchUnreadCount, decrementUnreadCount } = useNotificationStore();
    const { isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Chỉ fetch unread count khi user đã đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        }
    }, [isAuthenticated, fetchUnreadCount]);

    // Khi mở popover thì fetch danh sách notifications
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            const fetchNotifications = async () => {
                try {
                    setIsLoading(true);
                    const response = await notificationService.getNotifications(1, 10);
                    // Dữ liệu trả về có thể được bọc trong một đối tượng PageResponse,
                    // axios interceptor đã trả về phần thân JSON. Cấu trúc PageResponse có "data"
                    // là mảng kết quả.
                    setNotifications(response.data || []);
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchNotifications();
        }
    }, [isOpen, isAuthenticated]);

    const handleMarkAsRead = async (notification: NotificationResponse) => {
        if (notification.isRead) return;

        try {
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
            decrementUnreadCount();

            // Call API
            await notificationService.markAsRead(notification.id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert on error (optional)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: false } : n)
            );
        }
    };

    if (!isAuthenticated) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-brand/10">
                    <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <ScrollArea className="h-80">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin text-brand" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification)}
                                    className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${!notification.isRead ? 'bg-brand/5 dark:bg-brand/10' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex h-2 w-2 rounded-full bg-brand mt-1.5" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
