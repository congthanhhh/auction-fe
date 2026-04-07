import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_ENDPOINTS, GOOGLE_OAUTH_CONFIG } from '@/constants/api';
import type {
    AuthenticationRequest,
    AuthenticationResponse,
    ApiErrorResponse,
    GoogleAuthRequest,
    UserCreationRequest,
    OtpVerificationRequest,
} from '@/types/auth';
import type { MessageResponse } from '@/types/user';

class AuthService {

    getGoogleAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
            redirect_uri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
            response_type: GOOGLE_OAUTH_CONFIG.RESPONSE_TYPE,
            scope: GOOGLE_OAUTH_CONFIG.SCOPE,
        });

        return `${GOOGLE_OAUTH_CONFIG.AUTH_URL}?${params.toString()}`;
    }

    redirectToGoogleLogin(): void {
        window.location.href = this.getGoogleAuthUrl();
    }

    async createUserOtp(payload: UserCreationRequest): Promise<MessageResponse> {
        try {
            const response = await axios.post<MessageResponse>(
                `${API_BASE_URL}${API_ENDPOINTS.USER.CREATE_OTP}`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Đăng ký tài khoản thất bại');
            }
            throw new Error('Không thể kết nối đến server');
        }
    }

    async login(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
        try {
            const response = await axios.post<AuthenticationResponse>(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
                credentials,
                {
                    withCredentials: true, // Important: để gửi và nhận cookies
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Đăng nhập thất bại');
            }
            throw new Error('Không thể kết nối đến server');
        }
    }

    async verifyOtp(payload: OtpVerificationRequest): Promise<MessageResponse> {
        try {
            const response = await axios.post<MessageResponse>(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_OTP}`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Xác thực OTP thất bại');
            }
            throw new Error('Không thể kết nối đến server');
        }
    }

    async loginWithGoogle(payload: GoogleAuthRequest): Promise<AuthenticationResponse> {
        try {
            const response = await axios.post<AuthenticationResponse>(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}?code=${encodeURIComponent(payload.code)}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Đăng nhập Google thất bại');
            }
            throw new Error('Không thể kết nối đến server');
        }
    }

    /**
     * Refresh access token using httpOnly cookie
     * Cookie sẽ tự động được gửi kèm request
     */
    async refreshToken(): Promise<AuthenticationResponse> {
        try {
            const response = await axios.post<AuthenticationResponse>(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                {}, // Body rỗng, refresh token ở cookie
                {
                    withCredentials: true, // Important: để gửi cookie
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const apiError = error.response.data as ApiErrorResponse;
                throw new Error(apiError.message || 'Làm mới token thất bại');
            }
            throw new Error('Không thể làm mới token');
        }
    }

    /**
     * Logout user
     * Clear local storage and optionally call backend logout endpoint
     */
    logout(): void {
        localStorage.removeItem('accessToken');
        // Có thể gọi API logout nếu backend có endpoint
        // await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {}, { withCredentials: true });
    }

    /**
     * Get access token from localStorage
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Save access token to localStorage
     */
    setAccessToken(token: string): void {
        localStorage.setItem('accessToken', token);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        // Có thể thêm logic check token expiration ở đây
        try {
            const payload = this.decodeToken(token);
            const currentTime = Date.now() / 1000; // Convert to seconds
            return payload.exp > currentTime;
        } catch {
            return false;
        }
    }

    /**
     * Decode JWT token to get payload
     * Uses jwt-decode library for reliable and secure decoding
     */
    decodeToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (error) {
            throw new Error('Invalid token format');
        }
    }

    /**
     * Get token expiration time in milliseconds
     */
    getTokenExpiration(token: string): number | null {
        try {
            const payload = this.decodeToken(token);
            if (!payload.exp) {
                return null;
            }
            return payload.exp * 1000;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if token will expire soon (within 5 minutes)
     * For proactive token refresh
     */
    shouldRefreshToken(token: string, bufferTimeInMs: number = 5 * 60 * 1000): boolean {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) {
            return false;
        }

        const now = Date.now();
        const timeUntilExpiration = expiration - now;
        return timeUntilExpiration < bufferTimeInMs;
    }
}

export const authService = new AuthService();

