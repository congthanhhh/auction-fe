import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook dùng để bảo vệ các action cần đăng nhập.
 * - Nếu đã đăng nhập: thực thi callback (nếu có) và trả về true.
 * - Nếu chưa đăng nhập: redirect sang /signin?redirectTo=<currentPath> và trả về false.
 */
export function useRequireAuth() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();
    const navigate = useNavigate();

    const requireAuth = useCallback(
        (action?: () => void): boolean => {
            if (isAuthenticated) {
                if (action) {
                    action();
                }
                return true;
            }

            const currentPath = `${location.pathname}${location.search}${location.hash}`;
            const redirectUrl = `/signin?redirectTo=${encodeURIComponent(currentPath)}`;

            navigate(redirectUrl, { replace: true });
            return false;
        },
        [isAuthenticated, location.pathname, location.search, location.hash, navigate]
    );

    return requireAuth;
}
