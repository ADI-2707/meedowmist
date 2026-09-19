import { describe, it, expect } from 'vitest';
import { MockPaymentProvider } from './mockProvider';
import { RazorpayProvider } from './razorpayProvider';

describe('Payment Providers', () => {
  describe('MockPaymentProvider', () => {
    const provider = new MockPaymentProvider();

    it('has correct provider name', () => {
      expect(provider.name).toBe('MOCK_COD');
    });

    it('creates payment session correctly', async () => {
      const res = await provider.createSession({
        orderId: 'order_123',
        orderNumber: 'MM-ORD-1001',
        amount: 1499,
        currency: 'INR',
        customerName: 'Artisan Buyer',
        customerEmail: 'buyer@example.com',
      });

      expect(res.provider).toBe('MOCK_COD');
      expect(res.amount).toBe(1499);
      expect(res.currency).toBe('INR');
      expect(res.gatewayOrderId).toBe('MOCK-GW-MM-ORD-1001');
      expect(res.sessionId).toContain('MOCK-SESS-');
    });

    it('verifies valid mock payment', async () => {
      const res = await provider.verifyPayment({ mockSuccess: true });
      expect(res.success).toBe(true);
      expect(res.paymentRef).toContain('MOCK-PAY-');
    });

    it('handles simulated payment failure', async () => {
      const res = await provider.verifyPayment({ simulateFailure: true });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Simulated payment failure');
    });

    it('processes refund successfully', async () => {
      const res = await provider.processRefund({
        orderId: 'order_123',
        paymentRef: 'MOCK-PAY-12345',
        amount: 500,
        reason: 'Customer cancelled before shipping',
      });
      expect(res.success).toBe(true);
      expect(res.amount).toBe(500);
      expect(res.refundRef).toContain('MOCK-REFUND-');
    });
  });

  describe('RazorpayProvider', () => {
    it('initializes and creates stub session when API credentials not provided in test environment', async () => {
      const provider = new RazorpayProvider();
      expect(provider.name).toBe('RAZORPAY');

      const res = await provider.createSession({
        orderId: 'order_456',
        orderNumber: 'MM-ORD-2002',
        amount: 2500,
        currency: 'INR',
        customerName: 'Jane Doe',
        customerEmail: 'customer@meadowmist.com',
      });

      expect(res.provider).toBe('RAZORPAY');
      expect(res.gatewayOrderId).toBe('order_MM-ORD-2002');
      expect(res.sessionId).toContain('RZP-STUB-');
    });

    it('verifies razorpay payment with payment id', async () => {
      const provider = new RazorpayProvider();
      const res = await provider.verifyPayment({
        razorpay_payment_id: 'pay_987654321',
        razorpay_order_id: 'order_MM-ORD-2002',
        razorpay_signature: 'dummy_sig',
      });

      expect(res.success).toBe(true);
      expect(res.paymentRef).toBe('pay_987654321');
    });

    it('fails payment verification if payment id is missing', async () => {
      const provider = new RazorpayProvider();
      const res = await provider.verifyPayment({});
      expect(res.success).toBe(false);
      expect(res.error).toBe('Missing payment id');
    });

    it('processes razorpay refund', async () => {
      const provider = new RazorpayProvider();
      const res = await provider.processRefund({
        orderId: 'order_456',
        paymentRef: 'pay_987654321',
        amount: 1000,
        reason: 'Defective item return',
      });

      expect(res.success).toBe(true);
      expect(res.amount).toBe(1000);
      expect(res.refundRef).toContain('rfnd_');
    });
  });
});
