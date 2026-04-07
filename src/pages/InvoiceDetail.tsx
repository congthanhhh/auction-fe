import { useLocation, useNavigate } from "react-router-dom";
import InvoiceDetail from "@/components/invoice/Detail";
import type { InvoiceResponse } from "@/types/invoice";

interface LocationState {
    invoice?: InvoiceResponse;
}

export default function InvoiceDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const invoice = state?.invoice;

    const handlePay = (method: "COD" | "VNPAY") => {
        if (!invoice) return;
        // TODO: Tích hợp API thanh toán thực tế khi backend sẵn sàng
        // Hiện tại chỉ log đơn giản
        // eslint-disable-next-line no-console
        console.log("Thanh toán đơn hàng", invoice.id, "bằng", method);
        alert(
            method === "COD"
                ? "Chức năng thanh toán khi nhận hàng sẽ được tích hợp sau."
                : "Chức năng thanh toán qua VNPay sẽ được tích hợp sau."
        );
    };

    const handleViewAuction = (auctionSessionId: number) => {
        navigate(`/auction/${auctionSessionId}`);
    };

    if (!invoice) {
        return (
            <div className="bg-gray-50 dark:bg-gray-950 py-8">
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Chi tiết đơn hàng
                    </h1>
                    <p className="text-sm text-red-600">
                        Không tìm thấy thông tin hóa đơn. Vui lòng truy cập lại từ danh sách "Đơn hàng của tôi".
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/my-invoices")}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-4xl space-y-4">
                <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                    Chi tiết đơn hàng
                </h1>
                <InvoiceDetail
                    invoice={invoice}
                    onPay={handlePay}
                    isPaying={false}
                    onViewAuction={handleViewAuction}
                />
            </div>
        </div>
    );
}
