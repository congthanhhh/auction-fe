import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { paymentService } from "@/services/paymentService";
import type { PaymentResponse } from "@/types/payment";

export const VnPayCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const entries = Array.from(searchParams.entries());

            if (entries.length === 0) {
                setError("Thiếu tham số thanh toán từ VNPay.");
                setIsLoading(false);
                return;
            }

            const params: Record<string, string> = Object.fromEntries(entries);

            try {
                setIsLoading(true);
                setError(null);
                const result = await paymentService.handleVnPayCallback(params);
                setPaymentResult(result);
            } catch (err: any) {
                // eslint-disable-next-line no-console
                console.error("Failed to handle VNPay callback:", err);
                setError(err?.message || "Không xử lý được kết quả thanh toán VNPay.");
            } finally {
                setIsLoading(false);
            }
        };

        handleCallback();
    }, [searchParams]);

    const handleViewInvoice = () => {
        if (paymentResult?.invoiceId) {
            navigate(`/my-invoices/${paymentResult.invoiceId}`);
        } else {
            navigate("/my-invoices");
        }
    };

    const handleBackToInvoices = () => {
        navigate("/my-invoices");
    };

    const isSuccess = paymentResult?.code === "00";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md rounded-lg border bg-white dark:bg-gray-900 p-6 text-center shadow-sm space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-brand2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">Đang xử lý thanh toán VNPay...</span>
                    </div>
                ) : error ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                            <XCircle className="h-6 w-6" />
                            <span className="text-sm font-semibold">Thanh toán thất bại</span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={handleBackToInvoices}
                            className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                ) : paymentResult ? (
                    <div className="space-y-3">
                        <div className={`flex items-center justify-center gap-2 ${isSuccess ? "text-emerald-600" : "text-red-600"}`}>
                            {isSuccess ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <XCircle className="h-6 w-6" />
                            )}
                            <span className="text-sm font-semibold">
                                {isSuccess ? "Thanh toán thành công" : "Thanh toán không thành công"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {paymentResult.message}
                        </p>
                        <div className="mt-2 space-y-1 text-left text-xs text-gray-600 dark:text-gray-300">
                            <p><span className="font-semibold">Mã giao dịch:</span> {paymentResult.transactionId}</p>
                            <p><span className="font-semibold">Mã hoá đơn:</span> {paymentResult.invoiceId}</p>
                            {paymentResult.paymentTime && (
                                <p><span className="font-semibold">Thời gian thanh toán:</span> {paymentResult.paymentTime}</p>
                            )}
                            <p><span className="font-semibold">Mã kết quả:</span> {paymentResult.code}</p>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleViewInvoice}
                                className="inline-flex h-9 items-center justify-center rounded-md bg-brand text-white px-4 text-xs font-medium shadow-xs transition-colors hover:bg-brand/90"
                            >
                                Xem hoá đơn
                            </button>
                            <button
                                type="button"
                                onClick={handleBackToInvoices}
                                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                Về danh sách đơn hàng
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
