import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type {
    AuthenticationRequest,
    AuthenticationResponse,
    GoogleAuthRequest,
} from '@/types/auth';

interface AuthUser {
    id: string;
    username: string;
    email: string;
    role?: string;
}

interface AuthStore {
    // State
    isAuthenticated: boolean;
    accessToken: string | null;
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: AuthenticationRequest) => Promise<void>;
    redirectToGoogleLogin: () => void;
    loginWithGoogleCode: (payload: GoogleAuthRequest) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    setError: (error: string | null) => void;
    clearError: () => void;
    initializeAuth: () => void;
    scheduleTokenRefresh: (token: string) => void;
}

// Global ref to store timeout ID (outside Zustand to avoid persistence issues)
let refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Zustand Auth Store
 * Quản lý authentication state globally
 */
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial State
            isAuthenticated: false,
            accessToken: null,
            user: null,
            isLoading: false,
            error: null,

            // Login Action
            login: async (credentials: AuthenticationRequest) => {
                set({ isLoading: true, error: null });

                try {
                    const response: AuthenticationResponse = await authService.login(credentials);

                    // Lưu accessToken vào localStorage
                    authService.setAccessToken(response.accessToken);

                    // Decode token để lấy user info
                    const payload = authService.decodeToken(response.accessToken);

                    const user: AuthUser = {
                        id: payload.sub || payload.userId || '',
                        username: payload.username || payload.sub || '',
                        email: payload.email || '',
                        role: payload.role || payload.authorities?.[0] || 'USER',
                    };

                    set({
                        isAuthenticated: response.authenticated,
                        accessToken: response.accessToken,
                        user,
                        isLoading: false,
                        error: null,
                    });

                    // Schedule automatic token refresh
                    get().scheduleTokenRefresh(response.accessToken);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
                    set({
                        isAuthenticated: false,
                        accessToken: null,
                        user: null,
                        isLoading: false,
                        error: errorMessage,
                    });
                    throw error;
                }
            },

            redirectToGoogleLogin: () => {
                authService.redirectToGoogleLogin();
            },

            loginWithGoogleCode: async (payload: GoogleAuthRequest) => {
                set({ isLoading: true, error: null });

                try {
                    const response: AuthenticationResponse = await authService.loginWithGoogle(payload);

                    authService.setAccessToken(response.accessToken);

                    const tokenPayload = authService.decodeToken(response.accessToken);

                    const user: AuthUser = {
                        id: tokenPayload.sub || tokenPayload.userId || '',
                        username: tokenPayload.username || tokenPayload.sub || '',
                        email: tokenPayload.email || '',
                        role: tokenPayload.role || tokenPayload.authorities?.[0] || 'USER',
                    };

                    set({
                        isAuthenticated: response.authenticated,
                        accessToken: response.accessToken,
                        user,
                        isLoading: false,
                        error: null,
                    });

                    get().scheduleTokenRefresh(response.accessToken);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Đăng nhập Google thất bại';
                    set({
                        isAuthenticated: false,
                        accessToken: null,
                        user: null,
                        isLoading: false,
                        error: errorMessage,
                    });
                    throw error;
                }
            },

            // Logout Action
            logout: () => {
                authService.logout();

                // Clear scheduled refresh
                if (refreshTimeoutId) {
                    clearTimeout(refreshTimeoutId);
                    refreshTimeoutId = null;
                }

                set({
                    isAuthenticated: false,
                    accessToken: null,
                    user: null,
                    error: null,
                });
            },

            // Refresh Token Action
            refreshToken: async () => {
                try {
                    const response: AuthenticationResponse = await authService.refreshToken();

                    // Lưu accessToken mới
                    authService.setAccessToken(response.accessToken);

                    // Decode token để update user info
                    const payload = authService.decodeToken(response.accessToken);

                    const user: AuthUser = {
                        id: payload.sub || payload.userId || '',
                        username: payload.username || payload.sub || '',
                        email: payload.email || '',
                        role: payload.role || payload.authorities?.[0] || 'USER',
                    };

                    set({
                        isAuthenticated: response.authenticated,
                        accessToken: response.accessToken,
                        user,
                        error: null,
                    });

                    // Schedule next refresh
                    get().scheduleTokenRefresh(response.accessToken);
                } catch (error) {
                    // Nếu refresh thất bại, logout user
                    get().logout();
                    throw error;
                }
            },

            // Set Error
            setError: (error: string | null) => {
                set({ error });
            },

            // Clear Error
            clearError: () => {
                set({ error: null });
            },

            // Initialize Auth - Khôi phục session từ localStorage
            initializeAuth: () => {
                const token = authService.getAccessToken();

                if (token && authService.isAuthenticated()) {
                    try {
                        const payload = authService.decodeToken(token);

                        const user: AuthUser = {
                            id: payload.sub || payload.userId || '',
                            username: payload.username || payload.sub || '',
                            email: payload.email || '',
                            role: payload.role || payload.authorities?.[0] || 'USER',
                        };

                        set({
                            isAuthenticated: true,
                            accessToken: token,
                            user,
                        });

                        // Schedule automatic token refresh for existing session
                        get().scheduleTokenRefresh(token);
                    } catch {
                        // Token invalid, clear it
                        authService.logout();
                    }
                }
            },

            // Schedule Token Refresh - Tự động refresh trước khi token hết hạn
            scheduleTokenRefresh: (token: string) => {
                // Clear existing timeout
                if (refreshTimeoutId) {
                    clearTimeout(refreshTimeoutId);
                    refreshTimeoutId = null;
                }

                try {
                    const expiration = authService.getTokenExpiration(token);
                    if (!expiration) {
                        return;
                    }

                    const now = Date.now();
                    const timeUntilExpiration = expiration - now;

                    // Refresh 5 minutes before expiration (or immediately if already expired)
                    const bufferTime = 5 * 60 * 1000; // 5 minutes
                    const refreshTime = Math.max(0, timeUntilExpiration - bufferTime);

                    refreshTimeoutId = setTimeout(async () => {
                        try {
                            await get().refreshToken();
                        } catch (error) {
                            // Token refresh failed, will logout in refreshToken method
                        }
                    }, refreshTime);
                } catch (error) {
                    // Failed to schedule token refresh
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // Chỉ persist user info, không persist token
                user: state.user,
            }),
        }
    )
);
