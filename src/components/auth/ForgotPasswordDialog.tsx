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
import { AlertCircle, Loader2 } from "lucide-react"
import { authService } from "@/services/authService"

interface ForgotPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onOtpSent?: (email: string) => void
}

export function ForgotPasswordDialog({ open, onOpenChange, onOtpSent }: ForgotPasswordDialogProps) {
    const { t } = useTranslation()
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [infoMessage, setInfoMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setInfoMessage(null)

        const trimmedEmail = email.trim()
        if (!trimmedEmail) {
            setError(t("auth.forgotPassword.emailRequired"))
            return
        }

        try {
            setIsSubmitting(true)
            const response = await authService.forgotPassword({ email: trimmedEmail })
            setInfoMessage(response.message || t("auth.forgotPassword.success"))
            setTimeout(() => {
                onOpenChange(false)
                onOtpSent?.(trimmedEmail)
                setInfoMessage(null)
            }, 400)
        } catch (err) {
            const message = err instanceof Error ? err.message : t("auth.forgotPassword.error")
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setError(null)
        setInfoMessage(null)
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
                    <DialogTitle className="text-brand2">{t("auth.forgotPassword.title")}</DialogTitle>
                    <DialogDescription>
                        {t("auth.forgotPassword.description")}
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
                            <Label htmlFor="email" className="text-brand2">
                                {t("auth.forgotPassword.email")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                {t("auth.forgotPassword.emailHint")}
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
                            {t("auth.forgotPassword.cancel")}
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
