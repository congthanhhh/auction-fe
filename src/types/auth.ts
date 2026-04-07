// Authentication Request & Response Types

export interface AuthenticationRequest {
    username?: string;
    email?: string;
    password: string;
}

export interface GoogleAuthRequest {
    code: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    authenticated: boolean;
    // Có thể bổ sung thêm user info nếu backend trả về
    // userId?: string;
    // username?: string;
    // email?: string;
    // role?: string;
}

export interface ApiErrorResponse {
    code: string;
    message: string;
    status: number;
}

// Sign up & OTP verification
export interface UserCreationRequest {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    phoneNumber: string;
    // Backend has defaults for these; frontend usually does not need to send
    isActive?: boolean;
    createdAt?: string;
}

export interface OtpVerificationRequest {
    email: string;
    otp: string;
}

// JWT Payload interface (nếu cần decode token)
export interface JWTPayload {
    sub: string; // subject (thường là userId hoặc username)
    exp: number; // expiration time (Unix timestamp in seconds)
    iat: number; // issued at
    // Có thể có thêm các field khác
    email?: string;
    role?: string;
}

// Auth Store State
export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;
}

// User info (extract từ token hoặc API)
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role?: string;
}
