export interface NotificationResponse {
    id: number;
    message: string;
    isRead: boolean;
    link: string;
    createdAt: string; // ISO 8601 string mapping from LocalDateTime
}
