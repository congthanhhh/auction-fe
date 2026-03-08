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
import { Eye, EyeOff } from "lucide-react"

interface ResetPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ open, onOpenChange }: ResetPasswordDialogProps) {
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Handle reset password logic here
        console.log("Reset password with OTP:", otp, "New password:", newPassword)
        // Close dialog after submission
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-brand2">Đặt lại mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mã OTP và mật khẩu mới của bạn
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
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
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
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
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover">
                            Đặt lại mật khẩu
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
