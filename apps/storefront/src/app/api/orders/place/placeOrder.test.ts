import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe('Place Order API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validAddress = {
    fullName: 'Ananya Sharma',
    streetAddress: 'Flat 402, Green Meadows',
    city: 'Bengaluru',
    postalCode: '560001',
  };

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 'p1', qty: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Please sign in to place your order');
  });

  it('returns 400 when items array is missing or empty', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'ananya@example.com',
      role: 'CUSTOMER',
    });

    const req = new Request('http://localhost:3000/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Order must contain at least one item');
  });

  it('returns 400 when delivery address is incomplete', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'ananya@example.com',
      role: 'CUSTOMER',
    });

    const req = new Request('http://localhost:3000/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'p1', qty: 1 }],
        shippingAddress: { city: 'Bengaluru' },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Valid delivery address is required');
  });

  it('returns 400 when atomic stock decrement fails due to insufficient stock', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'ananya@example.com',
      role: 'CUSTOMER',
    });

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const mockTx = {
        product: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'p1',
            name: 'Amber Candle',
            price: 899,
            isActive: true,
            stockQuantity: 2,
            images: '["/amber.jpg"]',
          }),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      return callback(mockTx as unknown as Parameters<Parameters<typeof prisma.$transaction>[0]>[0]);
    });

    const req = new Request('http://localhost:3000/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'p1', qty: 3 }],
        shippingAddress: validAddress,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Insufficient stock for "Amber Candle"');
  });

  it('places order successfully and returns 201 when atomic stock update succeeds', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'ananya@example.com',
      role: 'CUSTOMER',
    });

    const mockCreatedOrder = {
      id: 'order_123',
      orderNumber: 'MM-2026-9999',
      subtotal: 899,
      totalAmount: 998,
      status: 'PENDING',
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      const mockTx = {
        product: {
          findUnique: vi.fn()
            .mockResolvedValueOnce({
              id: 'p1',
              name: 'Amber Candle',
              price: 899,
              isActive: true,
              stockQuantity: 10,
              images: '["/amber.jpg"]',
            })
            .mockResolvedValueOnce({
              stockQuantity: 9,
            }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          update: vi.fn(),
        },
        inventoryLog: {
          create: vi.fn().mockResolvedValue({ id: 'log_1' }),
        },
        order: {
          create: vi.fn().mockResolvedValue(mockCreatedOrder),
        },
        cartItem: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };
      return callback(mockTx as unknown as Parameters<Parameters<typeof prisma.$transaction>[0]>[0]);
    });

    const req = new Request('http://localhost:3000/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'p1', qty: 1 }],
        shippingAddress: validAddress,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.order).toEqual(mockCreatedOrder);
  });
});
