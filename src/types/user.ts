// User & profile related types

export interface PermissionResponse {
    name: string;
    description: string;
}

export interface RoleResponse {
    name: string;
    description: string;
    permissions?: PermissionResponse[];
}

export interface UserProfileResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    noPassword: boolean;
    isActive?: boolean | null;
    strikeCount?: number | null;
    reputationScore?: number | null;
    createdAt: string;
    roles: RoleResponse[];
}

export interface PublicUserProfileResponse {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    reputationScore: number;
    createdAt: string;
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
