// Payment related DTOs

export interface PaymentResponse {
    code: string; // "00" = success, others = failure
    message: string;
    paymentTime: string;
    transactionId: string;
    invoiceId: string;
}
