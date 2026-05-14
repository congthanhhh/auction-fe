import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InvoiceDetail from "@/components/invoice/Detail";
import type { DisputeRequest, DisputeResponse, InvoiceResponse, ShipInvoiceRequest } from "@/types/invoice";
import { addressService } from "@/services/addressService";
import type { AddressResponse } from "@/types/user";
import { paymentService } from "@/services/paymentService";
import { invoiceService } from "@/services/invoiceService";
import { useAuthStore } from "@/stores/authStore";
import { feedbackService } from "@/services/feedbackService";
import type { FeedbackRequest } from "@/types/feedback";

interface LocationState {
    invoice?: InvoiceResponse;
    isSeller?: boolean;
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) {
            return message;
        }
    }

    return fallback;
};

export default function InvoiceDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState | null;

    const [invoice, setInvoice] = useState<InvoiceResponse | null>(locationState?.invoice ?? null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState<boolean>(!locationState?.invoice);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);
    const [dispute, setDispute] = useState<DisputeResponse | null>(null);
    const [isLoadingDispute, setIsLoadingDispute] = useState<boolean>(false);
    const [disputeError, setDisputeError] = useState<string | null>(null);

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
            } catch (error: unknown) {
                console.error("Failed to load invoice detail:", error);
                setInvoiceError(getErrorMessage(error, t("invoice.detail.loadError")));
            } finally {
                setIsLoadingInvoice(false);
            }
        };

        fetchInvoice();
    }, [id, locationState?.invoice, t]);

    useEffect(() => {
        let isMounted = true;

        const fetchDispute = async () => {
            if (!invoice || invoice.status !== "DISPUTE") {
                setDispute(null);
                setDisputeError(null);
                return;
            }

            try {
                setIsLoadingDispute(true);
                setDisputeError(null);
                const disputeResponse = await invoiceService.getDisputeByInvoice(invoice.id);

                if (isMounted) {
                    setDispute(disputeResponse);
                }
            } catch (error) {
                console.error("Failed to load dispute detail:", error);
                if (isMounted) {
                    setDispute(null);
                    setDisputeError(t("invoice.detail.disputeLoadError"));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingDispute(false);
                }
            }
        };

        fetchDispute();

        return () => {
            isMounted = false;
        };
    }, [invoice, t]);

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
            alert(t("invoice.detail.selectAddressFirst"));
            return;
        }

        try {
            setIsPaying(true);
            // Tạo URL thanh toán VNPay và redirect người dùng
            const paymentUrl = await paymentService.createVnPayPayment(invoice.id, selectedAddress.id);
            if (typeof window !== "undefined") {
                window.location.href = paymentUrl;
            }
        } catch (error: unknown) {
            console.error("Failed to create VNPay payment:", error);
            alert(getErrorMessage(error, t("invoice.detail.createPaymentError")));
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
        } catch (error: unknown) {
            console.error("Failed to ship invoice:", error);
            alert(getErrorMessage(error, t("invoice.detail.shipError")));
        }
    };

    const handleConfirmReceive = async () => {
        if (!invoice) return;
        try {
            await invoiceService.confirmInvoice(invoice.id);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: unknown) {
            console.error("Failed to confirm invoice:", error);
            alert(getErrorMessage(error, t("invoice.detail.confirmReceiveError")));
        }
    };

    const handleDispute = async (payload: DisputeRequest) => {
        if (!invoice) return;
        try {
            await invoiceService.disputeInvoice(invoice.id, payload);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
            const disputeResponse = await invoiceService.getDisputeByInvoice(invoice.id);
            setDispute(disputeResponse);
        } catch (error: unknown) {
            console.error("Failed to dispute invoice:", error);
            alert(getErrorMessage(error, t("invoice.detail.disputeError")));
        }
    };

    const handleReportNonpayment = async () => {
        if (!invoice) return;
        try {
            await invoiceService.reportNonpayment(invoice.id);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: unknown) {
            console.error("Failed to report nonpayment:", error);
            alert(getErrorMessage(error, t("invoice.detail.reportError")));
        }
    };
    const handleCreateFeedback = async (payload: FeedbackRequest) => {
        if (!invoice) return;
        try {
            await feedbackService.createFeedback(invoice.id, payload);
            const updatedInvoice = await invoiceService.getInvoiceById(invoice.id);
            setInvoice(updatedInvoice);
        } catch (error: unknown) {
            console.error("Failed to create feedback:", error);
            alert(getErrorMessage(error, t("invoice.detail.feedbackError")));
        }
    };

    if (isLoadingInvoice) {
        return (
            <div className="bg-gray-50 dark:bg-gray-950 py-8">
                <div className="container mx-auto px-4 max-w-3xl space-y-4">
                    <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                        {t("invoice.detail.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("invoice.detail.loading")}
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
                        {t("invoice.detail.title")}
                    </h1>
                    <p className="text-sm text-red-600">
                        {invoiceError}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/my-invoices")}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        {t("invoice.detail.backToOrders")}
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
                        {t("invoice.detail.title")}
                    </h1>
                    <p className="text-sm text-red-600">
                        {t("invoice.detail.notFound")}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/my-invoices")}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        {t("invoice.detail.backToOrders")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-4xl space-y-4">
                <h1 className="text-2xl font-bold text-brand2 dark:text-white">
                    {t("invoice.detail.title")}
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
                    onCreateFeedback={handleCreateFeedback}
                    dispute={dispute}
                    isLoadingDispute={isLoadingDispute}
                    disputeError={disputeError}
                />
            </div>
        </div>
    );
}
