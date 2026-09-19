import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderInvoiceModal } from './OrderInvoiceModal';

describe('OrderInvoiceModal Component', () => {
  const mockOrder = {
    id: 'order_123',
    orderNumber: 'MM-ORD-8899',
    createdAt: '2026-09-15T10:30:00Z',
    subtotal: 1180, // 1000 taxable + 180 (18% GST)
    shippingCharges: 99,
    discountAmount: 100,
    totalAmount: 1179,
    promoCode: 'MEADOW100',
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    paymentRef: 'pay_9988776655',
    shippingAddress: JSON.stringify({
      fullName: 'Aarav Mehta',
      phone: '+91 98765 43210',
      streetAddress: '12 Green Glen Layout',
      apartment: 'Apt 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
    }),
    items: [
      {
        id: 'item_1',
        productName: 'Cedarwood & Sage Soy Candle',
        quantity: 1,
        unitPrice: 1180,
        lineTotal: 1180,
        selectedFragrance: 'Smoked Cedar',
        selectedColor: 'Parchment White',
        selectedSize: '250g',
      },
    ],
  };

  it('returns null when isOpen is false or order is null', () => {
    const { container: c1 } = render(
      <OrderInvoiceModal
        isOpen={false}
        order={mockOrder}
        onClose={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <OrderInvoiceModal
        isOpen={true}
        order={null}
        onClose={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it('renders brand details, GSTIN, and tax invoice headers', () => {
    render(
      <OrderInvoiceModal
        isOpen={true}
        order={mockOrder}
        customerName="Aarav Mehta"
        customerEmail="aarav@example.com"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('TAX INVOICE')).toBeDefined();
    expect(screen.getByText(/INV-MM-MM-ORD-8899/i)).toBeDefined();
    expect(screen.getByText(/29AABCU9603R1ZM/i)).toBeDefined();
    expect(screen.getByText(/pay_9988776655/i)).toBeDefined();
  });

  it('renders parsed customer address and itemized products with variants', () => {
    render(
      <OrderInvoiceModal
        isOpen={true}
        order={mockOrder}
        customerName="Aarav Mehta"
        customerEmail="aarav@example.com"
        onClose={vi.fn()}
      />
    );

    expect(screen.getAllByText('Aarav Mehta').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12 Green Glen Layout/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Cedarwood & Sage Soy Candle')).toBeDefined();
    expect(screen.getByText(/Scent: Smoked Cedar/i)).toBeDefined();
    expect(screen.getByText(/Shade: Parchment White/i)).toBeDefined();
  });

  it('renders tax breakdown (CGST/SGST), shipping, discount and grand total', () => {
    render(
      <OrderInvoiceModal
        isOpen={true}
        order={mockOrder}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/CGST \(9%\)/i)).toBeDefined();
    expect(screen.getByText(/SGST \(9%\)/i)).toBeDefined();
    expect(screen.getByText(/Shipping Charges/i)).toBeDefined();
    expect(screen.getByText(/Discount \(MEADOW100\)/i)).toBeDefined();
    expect(screen.getByText('₹1,179')).toBeDefined();
  });

  it('triggers window.print when Print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <OrderInvoiceModal
        isOpen={true}
        order={mockOrder}
        onClose={vi.fn()}
      />
    );

    const printBtn = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <OrderInvoiceModal
        isOpen={true}
        order={mockOrder}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByLabelText(/Close invoice preview/i);
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
