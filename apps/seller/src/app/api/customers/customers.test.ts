import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    order: {
      groupBy: vi.fn(),
    },
  },
}));

describe('Seller Customers API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when admin is not authenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/customers');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('fetches paginated customer list and aggregates lifetime spend', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue({
      userId: 'admin_1',
      email: 'artisan@meadowmist.in',
      name: 'Artisan',
      role: 'ADMIN',
    });

    vi.mocked(prisma.user.count).mockResolvedValue(45);

    const mockCustomer = {
      id: 'cust_1',
      name: 'Rhea Sen',
      email: 'rhea@example.com',
      phone: '9876543210',
      createdAt: new Date(),
      addresses: [{ city: 'Mumbai', state: 'Maharashtra', isDefault: true }],
      _count: { orders: 3, wishlistItems: 4 },
    };

    (prisma.user.findMany as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue([mockCustomer]);
    (prisma.order.groupBy as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue([
      {
        userId: 'cust_1',
        _sum: { totalAmount: 4500 },
      },
    ]);

    const req = new Request('http://localhost:3001/api/customers?page=1&limit=20');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.customers.length).toBe(1);
    expect(body.customers[0].id).toBe('cust_1');
    expect(body.customers[0].name).toBe('Rhea Sen');
    expect(body.customers[0].lifetimeSpend).toBe(4500);
    expect(body.customers[0].totalOrders).toBe(3);
    expect(body.customers[0].wishlistCount).toBe(4);
    expect(body.customers[0].primaryAddress).toBe('Mumbai, Maharashtra');

    expect(body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it('applies search filters to whereClause when search param is passed', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue({
      userId: 'admin_1',
      email: 'artisan@meadowmist.in',
      name: 'Artisan',
      role: 'ADMIN',
    });

    vi.mocked(prisma.user.count).mockResolvedValue(1);
    (prisma.user.findMany as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue([]);
    (prisma.order.groupBy as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue([]);

    const req = new Request('http://localhost:3001/api/customers?search=Rhea');
    await GET(req);

    expect(prisma.user.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        role: 'CUSTOMER',
        OR: [
          { name: { contains: 'Rhea' } },
          { email: { contains: 'Rhea' } },
          { phone: { contains: 'Rhea' } },
        ],
      }),
    });
  });
});
