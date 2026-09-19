import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from './route';
import { getAdminSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/session', () => ({
  getAdminSessionUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    journalArticle: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Seller Content Journal CMS API', () => {
  const adminUser = {
    userId: 'admin_1',
    email: 'admin@meadowmist.in',
    name: 'Admin',
    role: 'ADMIN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns 401 when unauthenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('GET returns articles ordered by published date', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.journalArticle.findMany).mockResolvedValue([
      { id: 'art-1', title: 'Candle Care Guide' } as any,
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.articles).toHaveLength(1);
    expect(prisma.journalArticle.findMany).toHaveBeenCalledWith({
      orderBy: { publishedAt: 'desc' },
    });
  });

  it('PATCH returns 401 when unauthenticated', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(null);

    const req = new Request('http://localhost:3001/api/content/journal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'art-1', isPublished: false }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('PATCH updates article publication status', async () => {
    vi.mocked(getAdminSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.journalArticle.update).mockResolvedValue({
      id: 'art-1',
      title: 'Candle Care Guide',
      isPublished: false,
    } as any);

    const req = new Request('http://localhost:3001/api/content/journal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'art-1', isPublished: false }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.article.isPublished).toBe(false);
    expect(prisma.journalArticle.update).toHaveBeenCalledWith({
      where: { id: 'art-1' },
      data: { isPublished: false },
    });
  });
});
