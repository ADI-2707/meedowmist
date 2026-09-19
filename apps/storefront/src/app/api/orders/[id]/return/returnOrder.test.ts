import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { getSessionUser, getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getSessionUser: vi.fn(),
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Order Return Request API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContext = {
    params: Promise.resolve({ id: 'order_123' }),
  };

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Damaged ceramic piece' }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(401);
  });

  it('returns 404 when order does not exist', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'user@example.com',
      name: 'User One',
      role: 'CUSTOMER',
    });
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Damaged piece' }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(404);
  });

  it('returns 403 when user does not own the order', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'user@example.com',
      name: 'User One',
      role: 'CUSTOMER',
    });
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_123',
      userId: 'user_other',
      status: 'DELIVERED',
      returnStatus: 'NONE',
    } as any);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Damaged piece' }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(403);
  });

  it('returns 400 when order is not DELIVERED', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'user@example.com',
      name: 'User One',
      role: 'CUSTOMER',
    });
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_123',
      userId: 'user_1',
      status: 'SHIPPED',
      returnStatus: 'NONE',
    } as any);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Damaged piece' }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('only be requested for delivered orders');
  });

  it('returns 400 when a return is already requested or processed', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'user@example.com',
      name: 'User One',
      role: 'CUSTOMER',
    });
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_123',
      userId: 'user_1',
      status: 'DELIVERED',
      returnStatus: 'REQUESTED',
    } as any);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Damaged piece' }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('already requested');
  });

  it('successfully creates return request with resolution preference and notes', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: 'user_1',
      email: 'user@example.com',
      name: 'User One',
      role: 'CUSTOMER',
    });
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_123',
      userId: 'user_1',
      status: 'DELIVERED',
      returnStatus: 'NONE',
    } as any);

    vi.mocked(prisma.order.update).mockResolvedValue({
      id: 'order_123',
      status: 'DELIVERED',
      returnStatus: 'REQUESTED',
      returnReason: 'Damaged during transit [Preference: REPLACEMENT] - Ceramic saucer arrived cracked',
      returnRequestedAt: new Date(),
    } as any);

    const req = new Request('http://localhost:3000/api/orders/order_123/return', {
      method: 'POST',
      body: JSON.stringify({
        reason: 'Damaged during transit',
        resolutionPreference: 'REPLACEMENT',
        notes: 'Ceramic saucer arrived cracked',
      }),
    });

    const res = await POST(req, mockContext);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order.returnStatus).toBe('REQUESTED');
    expect(data.order.returnReason).toContain('Preference: REPLACEMENT');
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order_123' },
        data: expect.objectContaining({
          returnStatus: 'REQUESTED',
        }),
      })
    );
  });
});
