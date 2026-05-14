import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { authService } from "@/services/authService"

interface ResetPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    email: string
    onResetSuccess?: () => void
}

export function ResetPasswordDialog({
    open,
    onOpenChange,
    email,
    onResetSuccess,
}: ResetPasswordDialogProps) {
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)

    const clearForm = () => {
        setOtp("")
        setNewPassword("")
        setShowPassword(false)
        setError(null)
        setInfoMessage(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setInfoMessage(null)

        const trimmedOtp = otp.trim()
        if (!email.trim()) {
            setError("Email đặt lại mật khẩu không hợp lệ")
            return
        }

        if (!trimmedOtp) {
            setError("Vui lòng nhập mã OTP")
            return
        }

        if (newPassword.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự")
            return
        }

        try {
            setIsSubmitting(true)
            const response = await authService.resetPassword({
                email: email.trim(),
                otp: trimmedOtp,
                newPassword,
            })
            setInfoMessage(response.message || "Đặt lại mật khẩu thành công")
            setTimeout(() => {
                clearForm()
                onOpenChange(false)
                onResetSuccess?.()
            }, 500)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại"
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        clearForm()
        onOpenChange(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    onOpenChange(true)
                    return
                }
                handleClose()
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-brand2">Đặt lại mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mã OTP đã gửi đến <span className="font-medium">{email}</span> và mật khẩu mới của bạn
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {infoMessage && !error && (
                            <p className="text-xs text-green-600">{infoMessage}</p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="reset-otp" className="text-brand2">
                                Mã OTP <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="reset-otp"
                                type="text"
                                inputMode="numeric"
                                placeholder="Nhập mã 6 số"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                maxLength={6}
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Nhập mã OTP đã được gửi đến email của bạn
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-brand2">
                                Mật khẩu mới <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Mật khẩu phải có ít nhất 8 ký tự
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
