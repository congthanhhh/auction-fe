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

interface OTPDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function OTPDialog({ open, onOpenChange }: OTPDialogProps) {
    const [otp, setOtp] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Handle OTP verification logic here
        console.log("Verify OTP:", otp)
        // Close dialog after submission
        onOpenChange(false)
    }

    const handleResendOTP = () => {
        // TODO: Handle resend OTP logic here
        console.log("Resend OTP")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-brand2">Xác thực OTP</DialogTitle>
                    <DialogDescription>
                        Nhập mã OTP đã được gửi đến email của bạn
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
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-brand hover:bg-brand-hover">
                            Xác nhận
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
