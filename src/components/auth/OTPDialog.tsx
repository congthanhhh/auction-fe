import { useState } from "react"
import { useTranslation } from "react-i18next"
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
    const { t } = useTranslation()
    const [otp, setOtp] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setInfoMessage(null)

        if (!otp.trim()) {
            setError(t("auth.otp.required"))
            return
        }

        try {
            setIsSubmitting(true)
            const response = await authService.verifyOtp({ email, otp })
            setInfoMessage(response.message || t("auth.otp.success"))
            setTimeout(() => {
                onOpenChange(false)
                onVerified()
                setOtp("")
                setInfoMessage(null)
            }, 400)
        } catch (err) {
            const message = err instanceof Error ? err.message : t("auth.otp.error")
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
            setInfoMessage(t("auth.otp.resendSuccess"))
        } catch (err) {
            const message = err instanceof Error ? err.message : t("auth.otp.resendError")
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-brand2">{t("auth.otp.title")}</DialogTitle>
                    <DialogDescription>
                        {t("auth.otp.description", { email })}
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
                                {t("auth.otp.code")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder={t("auth.otp.placeholder")}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                required
                                className="text-center text-2xl tracking-widest"
                            />
                            <div className="flex items-center justify-between text-xs">
                                <p className="text-gray-500">
                                    {t("auth.otp.noCode")}
                                </p>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-brand hover:text-brand-hover p-0 h-auto"
                                    onClick={handleResendOTP}
                                    disabled={isSubmitting || !onResendOtp}
                                >
                                    {t("auth.otp.resend")}
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
                            {t("auth.otp.cancel")}
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover" disabled={isSubmitting}>
                            {isSubmitting ? t("auth.otp.submitting") : t("auth.otp.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
