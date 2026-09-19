import {
  PaymentProvider,
  PaymentSessionOptions,
  PaymentSessionResult,
  PaymentVerificationResult,
  RefundOptions,
  RefundResult,
} from './types';

export class RazorpayProvider implements PaymentProvider {
  name = 'RAZORPAY';

  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createSession(options: PaymentSessionOptions): Promise<PaymentSessionResult> {
    if (!this.keyId || !this.keySecret) {
      return {
        provider: this.name,
        sessionId: `RZP-STUB-${Date.now()}`,
        gatewayOrderId: `order_${options.orderNumber}`,
        amount: options.amount * 100,
        currency: 'INR',
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(options.amount * 100),
        currency: options.currency || 'INR',
        receipt: options.orderNumber,
        notes: {
          orderId: options.orderId,
        },
      }),
    });

    const data = await res.json();
    return {
      provider: this.name,
      sessionId: data.id,
      gatewayOrderId: data.id,
      amount: options.amount,
      currency: 'INR',
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const paymentId = payload.razorpay_payment_id as string | undefined;
    if (!paymentId) {
      return { success: false, error: 'Missing payment id' };
    }
    return {
      success: true,
      paymentRef: paymentId,
    };
  }

  async processRefund(options: RefundOptions): Promise<RefundResult> {
    return {
      success: true,
      refundRef: `rfnd_${Date.now()}`,
      amount: options.amount,
    };
  }
}
