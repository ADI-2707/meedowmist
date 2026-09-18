import { describe, it, expect } from 'vitest';
import { prisma } from './index';

describe('Database Client & Domain Invariants', () => {
  it('initializes prisma client properly', () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.product.findMany).toBe('function');
    expect(typeof prisma.order.findMany).toBe('function');
    expect(typeof prisma.user.findMany).toBe('function');
  });

  it('verifies product pricing and stock business invariants in database', async () => {
    const products = await prisma.product.findMany({ take: 20 });
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.stockQuantity).toBeGreaterThanOrEqual(0);
      expect(product.lowStockThreshold).toBeGreaterThanOrEqual(1);

      if (product.salePrice !== null) {
        expect(product.salePrice).toBeLessThanOrEqual(product.price);
      }

      if (product.stockQuantity === 0) {
        expect(product.inStock).toBe(false);
      }
    }
  });

  it('verifies order financial calculation invariants', async () => {
    const orders = await prisma.order.findMany({ take: 20 });

    for (const order of orders) {
      expect(order.subtotal).toBeGreaterThanOrEqual(0);
      expect(order.shippingCharges).toBeGreaterThanOrEqual(0);
      expect(order.discountAmount).toBeGreaterThanOrEqual(0);

      const calculatedTotal = order.subtotal + order.shippingCharges - order.discountAmount;
      expect(Math.abs(order.totalAmount - calculatedTotal)).toBeLessThanOrEqual(0.01);
    }
  });
});
