import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const googleAuthRequestMap = new Map<string, Promise<void>>();

export const GoogleAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { loginWithGoogleCode, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            navigate('/signin', {
                replace: true,
                state: { oauthError: 'Không nhận được mã xác thực từ Google' },
            });
            return;
        }

        const authenticateWithGoogle = async () => {
            clearError();
            try {
                const existingRequest = googleAuthRequestMap.get(code);

                if (existingRequest) {
                    await existingRequest;
                } else {
                    const request = loginWithGoogleCode({ code });
                    googleAuthRequestMap.set(code, request);

                    try {
                        await request;
                    } finally {
                        // Keep a short cooldown to avoid immediate duplicate re-submits.
                        setTimeout(() => {
                            googleAuthRequestMap.delete(code);
                        }, 10000);
                    }
                }

                navigate('/', { replace: true });
            } catch {
                navigate('/signin', {
                    replace: true,
                    state: { oauthError: 'Đăng nhập Google thất bại, vui lòng thử lại' },
                });
            }
        };

        authenticateWithGoogle();
    }, [searchParams, loginWithGoogleCode, navigate, clearError]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md rounded-lg border bg-white dark:bg-gray-900 p-6 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-brand2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Đang xác thực Google...</span>
                </div>
                {isLoading && (
                    <p className="mt-3 text-xs text-gray-500">Vui lòng chờ trong giây lát</p>
                )}
                {error && (
                    <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        </div>
    );
};
