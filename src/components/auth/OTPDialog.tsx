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
import { AlertCircle } from "lucide-react"
import { authService } from "@/services/authService"

interface OTPDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    email: string
    onVerified: () => void
    onResendOtp?: () => Promise<void> | void
}
export function OTPDialog({ open, onOpenChange, email, onVerified, onResendOtp }: OTPDialogProps) {
    const [otp, setOtp] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setInfoMessage(null)

        if (!otp.trim()) {
            setError("Vui lòng nhập mã OTP")
            return
        }

        try {
            setIsSubmitting(true)
            const response = await authService.verifyOtp({ email, otp })
            setInfoMessage(response.message || "Xác thực thành công")
            setTimeout(() => {
                onOpenChange(false)
                onVerified()
                setOtp("")
                setInfoMessage(null)
            }, 400)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Xác thực OTP thất bại"
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResendOTP = async () => {
        if (!onResendOtp) return
        setError(null)
        setInfoMessage(null)
        try {
            setIsSubmitting(true)
            await onResendOtp()
            setInfoMessage("Đã gửi lại mã OTP, vui lòng kiểm tra email")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Gửi lại OTP thất bại"
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-brand2">Xác thực OTP</DialogTitle>
                    <DialogDescription>
                        Nhập mã OTP đã được gửi đến email <span className="font-medium">{email}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                                <AlertCircle className="h-4 w-4 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                        {infoMessage && !error && (
                            <p className="text-xs text-green-600">{infoMessage}</p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-brand2">
                                Mã OTP <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Nhập mã 6 số"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                className="text-center text-2xl tracking-widest"
                            />
                            <div className="flex items-center justify-between text-xs">
                                <p className="text-gray-500">
                                    Không nhận được mã?
                                </p>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-brand hover:text-brand-hover p-0 h-auto"
                                    onClick={handleResendOTP}
                                    disabled={isSubmitting || !onResendOtp}
                                >
                                    Gửi lại
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOtp("")
                                setError(null)
                                setInfoMessage(null)
                                onOpenChange(false)
                            }}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover" disabled={isSubmitting}>
                            {isSubmitting ? "Đang xác thực..." : "Xác nhận"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
