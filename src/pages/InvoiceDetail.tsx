import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InvoiceDetail from "@/components/invoice/Detail";
import type { InvoiceResponse, ShipInvoiceRequest, DisputeRequest } from "@/types/invoice";
import { addressService } from "@/services/addressService";
import type { AddressResponse } from "@/types/user";
import { paymentService } from "@/services/paymentService";
import { invoiceService } from "@/services/invoiceService";
import { useAuthStore } from "@/stores/authStore";

interface LocationState {
    invoice?: InvoiceResponse;
    isSeller?: boolean;
}

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState | null;

    const [invoice, setInvoice] = useState<InvoiceResponse | null>(locationState?.invoice ?? null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState<boolean>(!locationState?.invoice);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);

    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isPaying, setIsPaying] = useState<boolean>(false);
    
    const user = useAuthStore((state) => state.user);
    // Ưu tiên dùng isSeller truyền từ route (trang MySales)
    const isSeller = locationState?.isSeller ?? (
        user?.username === invoice?.product.seller.username || 
        user?.email === invoice?.product.seller.email || 
        user?.id === invoice?.product.seller.id
    );

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id || locationState?.invoice) {
                return;
            }

            try {
                setIsLoadingInvoice(true);
                setInvoiceError(null);
                const fetched = await invoiceService.getInvoiceById(Number(id));
                setInvoice(fetched);
            } catch (error: any) {
                // eslint-disable-next-line no-console
                console.error("Failed to load invoice detail:", error);
                setInvoiceError(error?.message || "Không tải được chi tiết hoá đơn.");
            } finally {
                setIsLoadingInvoice(false);
            }
        };

        fetchInvoice();
    }, [id, locationState?.invoice]);

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

    const handlePay = async () => {
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

    const handleShip = async (payload: ShipInvoiceRequest) => {
        if (!invoice) return;
        try {
            await invoiceService.shipInvoice(invoice.id, payload);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: any) {
            console.error("Failed to ship invoice:", error);
            alert(error?.message || "Không thể xác nhận gửi hàng. Vui lòng thử lại.");
        }
    };

    const handleConfirmReceive = async () => {
        if (!invoice) return;
        try {
            await invoiceService.confirmInvoice(invoice.id);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: any) {
            console.error("Failed to confirm invoice:", error);
            alert(error?.message || "Không thể xác nhận nhận hàng. Vui lòng thử lại.");
        }
    };

    const handleDispute = async (payload: DisputeRequest) => {
        if (!invoice) return;
        try {
            await invoiceService.disputeInvoice(invoice.id, payload);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: any) {
            console.error("Failed to dispute invoice:", error);
            alert(error?.message || "Không thể gửi khiếu nại. Vui lòng thử lại.");
        }
    };

    const handleReportNonpayment = async () => {
        if (!invoice) return;
        try {
            await invoiceService.reportNonpayment(invoice.id);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: any) {
            console.error("Failed to report nonpayment:", error);
            alert(error?.message || "Không thể báo cáo đơn hàng. Vui lòng thử lại.");
        }
    };
    if (isLoadingInvoice) {
        return (
            <div className="bg-gray-50 dark:bg-gray-950 py-8">
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Chi tiết đơn hàng
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Đang tải thông tin hoá đơn...
                    </p>
                </div>
            </div>
        );
    }

    if (invoiceError) {
        return (
            <div className="bg-gray-50 dark:bg-gray-950 py-8">
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        Chi tiết đơn hàng
                    </h1>
                    <p className="text-sm text-red-600">
                        {invoiceError}
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
                    isSeller={isSeller}
                    onShip={handleShip}
                    onConfirmReceive={handleConfirmReceive}
                    onDispute={handleDispute}
                    onReportNonpayment={handleReportNonpayment}
                />
            </div>
        </div>
    );
}
