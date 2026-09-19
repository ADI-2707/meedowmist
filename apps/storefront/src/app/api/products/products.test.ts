import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('Storefront Products API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET executes multi-field search and calculates rating stats', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: 'p-1',
        name: 'Lavender Whisper Soy Candle',
        category: 'candle',
        price: 790,
        reviews: [{ rating: 5 }, { rating: 4 }],
      } as any,
    ]);

    const req = new Request('http://localhost:3000/api/products?search=lavender');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.products).toHaveLength(1);
    expect(body.products[0].averageRating).toBe(4.5);
    expect(body.products[0].reviewCount).toBe(2);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { name: { contains: 'lavender' } },
            { description: { contains: 'lavender' } },
            { materials: { contains: 'lavender' } },
          ]),
        }),
      })
    );
  });

  it('POST returns 401 when user is not admin', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Candle', price: 900 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('POST returns 400 when required fields are missing', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue({
      userId: 'admin_1',
      email: 'admin@meadowmist.in',
      name: 'Admin',
      role: 'ADMIN',
    });

    const req = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete Piece' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });
});
