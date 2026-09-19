import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { PATCH, DELETE } from './[id]/route';
import { getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Seller Reviews API Endpoints', () => {
  const adminUser = {
    userId: 'admin_1',
    email: 'admin@meadowmist.in',
    name: 'Admin',
    role: 'ADMIN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns 401 when admin is not authenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/reviews');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('GET filters reviews by rating and search keyword', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.review.findMany).mockResolvedValue([
      { id: 'rev-1', rating: 5, comment: 'Exceptional soy wax candle' } as any,
    ]);

    const req = new Request('http://localhost:3001/api/reviews?rating=5&search=candle');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviews).toHaveLength(1);
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          rating: 5,
          OR: expect.arrayContaining([
            { comment: { contains: 'candle' } },
            { title: { contains: 'candle' } },
          ]),
        }),
      })
    );
  });

  it('PATCH returns 401 when admin is not authenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/reviews/rev-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: false }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'rev-1' }) });

    expect(res.status).toBe(401);
  });

  it('PATCH returns 404 when review is not found', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/reviews/missing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: false }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'missing' }) });

    expect(res.status).toBe(404);
  });

  it('PATCH toggles approval status of review', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ id: 'rev-1', isApproved: true } as any);
    vi.mocked(prisma.review.update).mockResolvedValue({ id: 'rev-1', isApproved: false } as any);

    const req = new Request('http://localhost:3001/api/reviews/rev-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved: false }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'rev-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.review.isApproved).toBe(false);
  });

  it('DELETE returns 404 when review does not exist', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/reviews/missing', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'missing' }) });

    expect(res.status).toBe(404);
  });

  it('DELETE deletes review from database', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ id: 'rev-1' } as any);
    vi.mocked(prisma.review.delete).mockResolvedValue({ id: 'rev-1' } as any);

    const req = new Request('http://localhost:3001/api/reviews/rev-1', {
      method: 'DELETE',
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'rev-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 'rev-1' } });
  });
});
