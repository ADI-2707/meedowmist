export interface PaymentSessionOptions {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
}

export interface PaymentSessionResult {
  provider: string;
  sessionId: string;
  paymentUrl?: string;
  gatewayOrderId?: string;
  amount: number;
  currency: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  paymentRef?: string;
  error?: string;
}

export interface RefundOptions {
  orderId: string;
  paymentRef: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundRef?: string;
  amount: number;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  createSession(options: PaymentSessionOptions): Promise<PaymentSessionResult>;
  verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;
  processRefund(options: RefundOptions): Promise<RefundResult>;
}
