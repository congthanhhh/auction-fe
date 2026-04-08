export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/authenticate',
    GOOGLE_LOGIN: '/auth/outbound/authenticate',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
  },
  // Auction
  AUCTION: {
    LIST: '/auctions',
    DETAIL: (id: string) => `/auction-sessions/${id}`,
    BIDS: (sessionId: number) => `/auction-sessions/${sessionId}/bids`,
    BID_COUNT: (productId: number) => `/auction-sessions/count/${productId}`,
    FEATURED: '/auctions/featured',
    RECOMMENDED: '/auctions/recommended',
    BID: (id: string) => `/auctions/${id}/bid`,
    ACTIVE_DESC: '/auction-sessions/active-desc',
  },
  // User
  USER: {
    MY_PROFILE: '/users/my-profile',
    UPDATE_MY_INFO: '/users/update-my-info',
    CHANGE_PASSWORD: '/users/change-password',
    CREATE_OTP: '/users/otp',
  },
  // Address
  ADDRESS: {
    ROOT: '/address',
    BY_ID: (id: number) => `/address/${id}`,
    SET_DEFAULT: (id: number) => `/address/${id}/default`,
  },
  // Invoice
  INVOICE: {
    MY_INVOICES: '/invoices/my-invoices',
  },
  // Payment
  PAYMENT: {
    VN_PAY: '/payments/vn-pay',
    VN_PAY_CALLBACK: '/payments/vn-pay-callback',
  },
} as const;

export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: '285017198166-v3bg04pi6vb53fve3homa4o6le3taskd.apps.googleusercontent.com',
  REDIRECT_URI:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/authenticate',
  AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  RESPONSE_TYPE: 'code',
  SCOPE: 'openid email profile',
} as const;
