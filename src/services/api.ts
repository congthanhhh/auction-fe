import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { authService } from './authService';

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add subscriber to queue for token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers with new token
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Tạo axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important: để gửi/nhận cookies (refresh_token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Proactive Token Refresh
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth cho các endpoint không cần authentication
    const publicEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      API_ENDPOINTS.AUTH.REGISTER,
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return config;
    }

    // Lấy token hiện tại
    const token = authService.getAccessToken();

    if (token) {
      // PROACTIVE REFRESH: Check nếu token sắp hết hạn (trong 5 phút)
      const shouldRefresh = authService.shouldRefreshToken(token, 5 * 60 * 1000);

      if (shouldRefresh && !isRefreshing) {
        isRefreshing = true;

        try {
          const response = await authService.refreshToken();
          const newToken = response.accessToken;

          authService.setAccessToken(newToken);
          isRefreshing = false;

          // Notify all waiting requests
          onTokenRefreshed(newToken);

          // Sử dụng token mới cho request hiện tại
          if (config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          isRefreshing = false;

          // Nếu refresh thất bại, vẫn thử dùng token cũ
          // Response interceptor sẽ xử lý nếu token thực sự hết hạn (401)
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } else if (isRefreshing) {
        // Nếu đang refresh, đợi token mới
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(config);
          });
        });
      } else {
        // Token còn hạn, dùng bình thường
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Reactive Refresh (fallback nếu proactive fail)
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Xử lý lỗi 401 - Unauthorized (Token hết hạn)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh, đợi token mới
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await authService.refreshToken();
        const newToken = response.accessToken;

        authService.setAccessToken(newToken);
        isRefreshing = false;

        // Notify all waiting requests
        onTokenRefreshed(newToken);

        // Retry request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // Refresh token thất bại, logout user
        authService.logout();

        // Redirect đến trang login
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }

        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    const errorMessage = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject({
      message: errorMessage,
      code: error.response?.data?.code,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
