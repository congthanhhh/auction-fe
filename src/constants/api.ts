export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/authenticate',
    GOOGLE_LOGIN: '/auth/outbound/authenticate',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_OTP: '/auth/verify-otp',
  },
  // Auction
  AUCTION: {
    DETAIL: (id: string) => `/auction-sessions/${id}`,
    BIDS: (sessionId: number) => `/auction-sessions/${sessionId}/bids`,
    BID_COUNT: (productId: number) => `/auction-sessions/count/${productId}`,
    ACTIVE_DESC: '/auction-sessions/active-desc',
    MY_JOINED: '/auction-sessions/my-joined',
    MY_SESSIONS: '/auction-sessions/my-sessions',
    BUY_NOW: (id: number) => `/auction-sessions/${id}/buy-now`,
    CANCEL_SESSION: (id: number) => `/auction-sessions/${id}/cancel`,
    REACTIVATE_SESSION: (id: number) => `/auction-sessions/${id}/reactivate`,
    UPDATE_SESSION: (id: number) => `/auction-sessions/update/${id}`,
    CREATE_SESSION: '/auction-sessions',
  },
  // Category
  CATEGORY: {
    ROOT: '/categories',
    BY_ID: (id: number) => `/categories/${id}`,
  },
  // Product
  PRODUCT: {
    ROOT: '/products',
    BY_ID: (id: number) => `/products/${id}`,
    MY_PRODUCTS: '/products/my-products',
    SEARCH: '/products/search',
    ADMIN_PENDING: '/products/admin/pending',
    ADMIN_VERIFY: (id: number) => `/products/admin/${id}/verify`,
    ADMIN_SEARCH: '/products/admin/search',
    ADMIN_UPDATE: (id: number) => `/products/admin/update/${id}`,
  },
  // User
  USER: {
    ROOT: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/delete/${id}`,
    MY_PROFILE: '/users/my-profile',
    PUBLIC_PROFILE: (userId: string) => `/users/${userId}/public-profile`,
    UPDATE_MY_INFO: '/users/update-my-info',
    CHANGE_PASSWORD: '/users/change-password',
    CREATE_OTP: '/users/otp',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
    ADMIN_SEARCH: '/users/admin/search',
    ADMIN_ACTIVE_STATUS: (id: string) => `/users/admin/${id}/active-status`,
    ADMIN_CREATE: '/users/admin-create',
    ADMIN_UPDATE: (userId: string) => `/users/${userId}/admin-update`,
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
    MY_SALES: '/invoices/my-sales',
    MY_LISTING_FEES: '/invoices/my-listing-fees',
    SOLD_INVOICES: '/invoices/sold-invoices',
    SELLER_STATS: '/invoices/seller-stats',
    DETAIL: (id: number) => `/invoices/${id}`,
    DISPUTE_DETAIL: (invoiceId: number) => `/invoices/dispute/${invoiceId}`,
    SHIP: (id: number) => `/invoices/${id}/ship`,
    CONFIRM: (id: number) => `/invoices/${id}/confirm`,
    DISPUTE: (id: number) => `/invoices/${id}/dispute`,
    REPORT_NONPAYMENT: (id: number) => `/invoices/${id}/report-nonpayment`,
    ADMIN_DETAIL: (invoiceId: number) => `/invoices/admin/invoice/${invoiceId}`,
    ADMIN_RESOLVE_DISPUTE: (id: number) => `/invoices/admin/disputes/${id}/resolve`,
    ADMIN_DISPUTES: '/invoices/admin/disputes',
    ADMIN_UPDATE: (id: number) => `/invoices/admin/update/${id}`,
    ADMIN_SEARCH: '/invoices/admin/search',
  },
  // Image
  IMAGE: {
    UPLOAD: '/images/upload',
    DELETE: (id: number) => `/images/${id}`,
  },
  // Feedback
  FEEDBACK: {
    CREATE: (invoiceId: number) => `/feedback/invoice/${invoiceId}`,
    UPDATE: (id: number) => `/feedback/${id}`,
    MY_TOTAL: '/feedback/my-total-feedback',
    PUBLIC: (userId: string) => `/feedback/public/${userId}`,
  },
  // Payment
  PAYMENT: {
    VN_PAY: '/payments/vn-pay',
    VN_PAY_CALLBACK: '/payments/vn-pay-callback',
  },
  // Notification
  NOTIFICATION: {
    ROOT: '/notifications',
    READ: (id: number) => `/notifications/${id}/read`,
    UNREAD_COUNT: '/notifications/unread-count',
  },
  // Admin
  ADMIN: {
    AUCTION_SEARCH: '/auction-sessions/admin/search',
    AUCTION_UPDATE: (id: number) => `/auction-sessions/admin/${id}`,
    SETTINGS: '/admin/settings',
    SETTING_BY_KEY: (key: string) => `/admin/settings/${encodeURIComponent(key)}`,
    STATISTICS: '/admin/statistics',
    LOGS: '/admin/logs',
  },
  // Roles and permissions
  ROLE: {
    ROOT: '/roles',
    BY_ROLE: (role: string) => `/roles/${encodeURIComponent(role)}`,
    PERMISSIONS: '/roles/permissions',
    PERMISSION_BY_NAME: (permission: string) => `/roles/permissions/${encodeURIComponent(permission)}`,
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
