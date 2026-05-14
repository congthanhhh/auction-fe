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
    const { t } = useTranslation()
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
            setError(t("auth.resetPassword.invalidEmail"))
            return
        }

        if (!trimmedOtp) {
            setError(t("auth.resetPassword.otpRequired"))
            return
        }

        if (newPassword.length < 8) {
            setError(t("auth.resetPassword.minLength"))
            return
        }

        try {
            setIsSubmitting(true)
            const response = await authService.resetPassword({
                email: email.trim(),
                otp: trimmedOtp,
                newPassword,
            })
            setInfoMessage(response.message || t("auth.resetPassword.resetSuccess"))
            setTimeout(() => {
                clearForm()
                onOpenChange(false)
                onResetSuccess?.()
            }, 500)
        } catch (err) {
            const message = err instanceof Error ? err.message : t("auth.resetPassword.error")
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
                    <DialogTitle className="text-brand2">{t("auth.resetPassword.title")}</DialogTitle>
                    <DialogDescription>
                        {t("auth.resetPassword.descriptionWithEmail", { email })}
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
                                {t("auth.resetPassword.otp")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="reset-otp"
                                type="text"
                                inputMode="numeric"
                                placeholder={t("auth.otp.placeholder")}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                maxLength={6}
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {t("auth.resetPassword.otpHint")}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-brand2">
                                {t("auth.resetPassword.newPassword")} <span className="text-red-500">*</span>
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
                                {t("auth.resetPassword.minLength")}
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
                            {t("auth.resetPassword.cancel")}
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
