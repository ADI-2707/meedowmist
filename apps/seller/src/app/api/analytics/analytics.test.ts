import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      aggregate: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    orderItem: {
      groupBy: vi.fn(),
    },
  },
}));

describe('Seller Analytics API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when admin is not authenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('computes and returns database aggregations when admin is authenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue({
      userId: 'admin_1',
      email: 'artisan@meadowmist.in',
      role: 'ADMIN',
    });

    vi.mocked(prisma.order.aggregate).mockResolvedValue({
      _sum: { totalAmount: 48500 },
    } as unknown as ReturnType<typeof prisma.order.aggregate>);

    vi.mocked(prisma.order.count)
      .mockResolvedValueOnce(35)
      .mockResolvedValueOnce(2);

    vi.mocked(prisma.order.groupBy).mockResolvedValue([
      { status: 'PENDING', _count: { status: 5 } },
      { status: 'PROCESSING', _count: { status: 10 } },
      { status: 'DELIVERED', _count: { status: 18 } },
    ] as unknown as ReturnType<typeof prisma.order.groupBy>);

    vi.mocked(prisma.product.count)
      .mockResolvedValueOnce(24)
      .mockResolvedValueOnce(1);

    vi.mocked(prisma.product.aggregate)
      .mockResolvedValueOnce({ _sum: { stockQuantity: 120 } } as unknown as ReturnType<typeof prisma.product.aggregate>)
      .mockResolvedValueOnce({ _sum: { stockQuantity: 45 } } as unknown as ReturnType<typeof prisma.product.aggregate>);

    vi.mocked(prisma.product.findMany)
      .mockResolvedValueOnce([
        {
          id: 'p_low',
          name: 'Cedar Mist',
          category: 'candle',
          stockQuantity: 3,
          lowStockThreshold: 5,
        },
      ] as unknown as ReturnType<typeof prisma.product.findMany>)
      .mockResolvedValueOnce([
        {
          id: 'p_top',
          name: 'Amber Glow',
          images: '["/amber.jpg"]',
          category: 'candle',
          stockQuantity: 15,
        },
      ] as unknown as ReturnType<typeof prisma.product.findMany>);

    vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([
      {
        productId: 'p_top',
        _sum: { quantity: 18, lineTotal: 16182 },
      },
    ] as unknown as ReturnType<typeof prisma.orderItem.groupBy>);

    vi.mocked(prisma.order.findMany).mockResolvedValue([
      {
        id: 'o_1',
        orderNumber: 'MM-2026-1001',
        totalAmount: 1899,
        status: 'PENDING',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        items: [{ quantity: 2 }],
        user: { name: 'Pooja', email: 'pooja@test.com' },
      },
    ] as unknown as ReturnType<typeof prisma.order.findMany>);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.summary.totalRevenue).toBe(48500);
    expect(body.summary.totalOrdersCount).toBe(35);
    expect(body.summary.pendingOrdersCount).toBe(5);
    expect(body.summary.processingOrdersCount).toBe(10);
    expect(body.summary.deliveredOrdersCount).toBe(18);
    expect(body.summary.returnRequestedCount).toBe(2);
    expect(body.summary.totalProductsCount).toBe(24);
    expect(body.summary.totalCandlesInStock).toBe(120);
    expect(body.summary.totalCeramicsInStock).toBe(45);
    expect(body.summary.lowStockCount).toBe(1);
    expect(body.summary.outOfStockCount).toBe(1);

    expect(body.bestSelling.length).toBe(1);
    expect(body.bestSelling[0].productId).toBe('p_top');
    expect(body.bestSelling[0].unitsSold).toBe(18);

    expect(body.recentOrders.length).toBe(1);
    expect(body.recentOrders[0].orderNumber).toBe('MM-2026-1001');
  });
});
