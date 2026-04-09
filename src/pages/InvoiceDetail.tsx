import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InvoiceDetail from "@/components/invoice/Detail";
import type { InvoiceResponse } from "@/types/invoice";
import { addressService } from "@/services/addressService";
import type { AddressResponse } from "@/types/user";
import { paymentService } from "@/services/paymentService";

interface LocationState {
    invoice?: InvoiceResponse;
}

export default function InvoiceDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | null;
    const invoice = state?.invoice;

    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isPaying, setIsPaying] = useState<boolean>(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const addressList = await addressService.getMyAddresses();
                setAddresses(addressList);

                const foundDefault = addressList.find(addr => addr.isDefault) || addressList[0];
                if (foundDefault) {
                    setSelectedAddressId(foundDefault.id);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error("Failed to load addresses for invoice detail:", error);
            }
        };

        fetchAddresses();
    }, []);

    const selectedAddress: AddressResponse | null =
        selectedAddressId != null ? addresses.find(addr => addr.id === selectedAddressId) || null : null;

    const handlePay = async (method: "VNPAY") => {
        // Hiện tại chỉ hỗ trợ VNPay, nhưng vẫn sử dụng tham số để tránh cảnh báo unused
        if (method !== "VNPAY") return;
        if (!invoice) return;

        if (!selectedAddress) {
            alert("Vui lòng chọn địa chỉ nhận hàng trước khi thanh toán.");
            return;
        }

        try {
            setIsPaying(true);
            // Tạo URL thanh toán VNPay và redirect người dùng
            const paymentUrl = await paymentService.createVnPayPayment(invoice.id, selectedAddress.id);
            if (typeof window !== "undefined") {
                window.location.href = paymentUrl;
            }
        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error("Failed to create VNPay payment:", error);
            alert(error?.message || "Không tạo được liên kết thanh toán VNPay. Vui lòng thử lại.");
        } finally {
            setIsPaying(false);
        }
    };

    const handleViewAuction = (auctionSessionId: number) => {
        navigate(`/auction/${auctionSessionId}`);
    };

    const handleChangeAddress = (addressId: number) => {
        setSelectedAddressId(addressId);
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
                    isPaying={isPaying}
                    onViewAuction={handleViewAuction}
                    selectedAddress={selectedAddress ?? undefined}
                    addresses={addresses}
                    onChangeAddress={handleChangeAddress}
                />
            </div>
        </div>
    );
}
