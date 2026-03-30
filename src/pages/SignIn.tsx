import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { ForgotPasswordDialog } from "@/components/auth"
import { useAuthStore } from "@/stores/authStore"
import type { AuthenticationRequest } from "@/types/auth"

export const SignIn = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, redirectToGoogleLogin, isLoading, error, clearError, isAuthenticated, setError } = useAuthStore()

    const [usernameOrEmail, setUsernameOrEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

    // Redirect nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    // Clear error khi component unmount
    useEffect(() => {
        return () => {
            clearError()
        }
    }, [clearError])

    useEffect(() => {
        const oauthError = (location.state as { oauthError?: string } | null)?.oauthError
        if (oauthError) {
            setError(oauthError)
            navigate(location.pathname, { replace: true, state: null })
        }
    }, [location.state, location.pathname, navigate, setError])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        // Validate input
        if (!usernameOrEmail.trim() || !password.trim()) {
            return
        }

        try {
            // Xác định input là email hay username
            const isEmail = usernameOrEmail.includes('@')

            const credentials: AuthenticationRequest = {
                password,
                ...(isEmail ? { email: usernameOrEmail } : { username: usernameOrEmail })
            }

            await login(credentials)

            // Đăng nhập thành công, redirect sẽ được xử lý bởi useEffect
            console.log('Đăng nhập thành công!')
        } catch (err) {
            // Error đã được xử lý trong store
            console.error('Login error:', err)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <div className="border-b-4 border-brand2 bg-white dark:bg-gray-900 shadow-sm">
                <div className="container mx-auto px-4 py-5">
                    <Link to="/" className="text-4xl font-bold text-brand2 dark:text-brand whitespace-nowrap hover:text-brand transition-colors">
                        Auction Shop Online
                    </Link>
                </div>
            </div>

            {/* Test account info */}
            <div className="mt-2 flex justify-center">
                <Card className="border p-2 border-dashed border-brand/40 bg-brand/5 dark:bg-brand/10">
                    <CardContent className="flex text-sm">
                        <div>
                            <p className="font-mono text-brand2">usera:</p>
                            <p className="font-mono text-brand2">userb:</p>
                        </div>
                        <div>
                            <p className="font-mono text-brand2 pl-1">123456</p>
                            <p className="font-mono text-brand2 pl-1">123456</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center text-brand2">Đăng nhập</CardTitle>
                        <CardDescription className="text-center text-brand">
                            Nhập username và mật khẩu để đăng nhập vào tài khoản
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <div className="text-sm text-red-800 dark:text-red-200">
                                        {error}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 text-brand2">
                                <Label htmlFor="usernameOrEmail">Username hoặc Email</Label>
                                <Input
                                    id="usernameOrEmail"
                                    type="text"
                                    placeholder="username hoặc email"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-brand2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <button
                                        type="button"
                                        onClick={() => setForgotPasswordOpen(true)}
                                        className="text-sm text-brand hover:text-brand-hover hover:underline"
                                        disabled={isLoading}
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer text-brand"
                                >
                                    Ghi nhớ đăng nhập
                                </Label>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-brand hover:bg-brand-hover"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang đăng nhập...
                                    </>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-950 px-2 text-xs text-gray-500">
                                HOẶC
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full text-brand2"
                                type="button"
                                onClick={redirectToGoogleLogin}
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Đăng nhập với Google
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Separator />
                        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/signup"
                                className="text-brand hover:text-brand-hover hover:underline font-medium"
                            >
                                Đăng ký ngay
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Footer */}
            <div className="border-t py-6 bg-gray-900 text-white mt-auto">
                <div className="container mx-auto px-4 text-center text-sm dark:text-gray-400">
                    © 2026 Auction Shop Online. All rights reserved.
                </div>

                {/* Forgot Password Dialog */}
                <ForgotPasswordDialog
                    open={forgotPasswordOpen}
                    onOpenChange={setForgotPasswordOpen}
                />
            </div>
        </div>
    )
}
