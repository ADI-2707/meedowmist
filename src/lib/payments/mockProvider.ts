import {
  PaymentProvider,
  PaymentSessionOptions,
  PaymentSessionResult,
  PaymentVerificationResult,
  RefundOptions,
  RefundResult,
} from './types';

export class MockPaymentProvider implements PaymentProvider {
  name = 'MOCK_COD';

  async createSession(options: PaymentSessionOptions): Promise<PaymentSessionResult> {
    const sessionId = `MOCK-SESS-${Date.now()}`;
    return {
      provider: this.name,
      sessionId,
      gatewayOrderId: `MOCK-GW-${options.orderNumber}`,
      amount: options.amount,
      currency: options.currency || 'INR',
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    if (payload.simulateFailure) {
      return { success: false, error: 'Simulated payment failure' };
    }
    return {
      success: true,
      paymentRef: `MOCK-PAY-${Date.now()}`,
    };
  }

  async processRefund(options: RefundOptions): Promise<RefundResult> {
    return {
      success: true,
      refundRef: `MOCK-REFUND-${Date.now()}`,
      amount: options.amount,
    };
  }
}
