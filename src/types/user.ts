// User & profile related types

export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    country?: string;
    // Aggregated stats
    totalFeedback?: number;
    itemsWon?: number;
    itemsSold?: number;
    totalSpent?: number;
}

// Address DTOs (align with backend contracts)
export interface AddressRequest {
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface AddressResponse {
    id: number;
    recipientName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
    fullAddress: string;
}

export interface MessageResponse {
    message: string;
}
