import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getArticles } from './route';
import { GET as getArticleDetail } from './[slug]/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    journalArticle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe('Journal API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/journal returns published articles list', async () => {
    vi.mocked(prisma.journalArticle.findMany).mockResolvedValue([
      { id: 'art-1', slug: 'candle-care', title: 'Candle Care', category: 'Candle Care' } as any,
    ]);

    const req = new Request('http://localhost:3000/api/journal');
    const res = await getArticles(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.articles).toHaveLength(1);
    expect(body.articles[0].slug).toBe('candle-care');
  });

  it('GET /api/journal/[slug] returns 404 for unknown article', async () => {
    vi.mocked(prisma.journalArticle.findUnique).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/journal/unknown');
    const res = await getArticleDetail(req, { params: Promise.resolve({ slug: 'unknown' }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Article not found');
  });

  it('GET /api/journal/[slug] resolves article and related products', async () => {
    vi.mocked(prisma.journalArticle.findUnique).mockResolvedValue({
      id: 'art-1',
      slug: 'candle-care',
      title: 'Candle Care',
      isPublished: true,
      relatedProductSlugs: JSON.stringify(['sunflower-candle']),
    } as any);

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: 'prod-1', slug: 'sunflower-candle', name: 'Sunflower Candle', price: 850, salePrice: null } as any,
    ]);

    const req = new Request('http://localhost:3000/api/journal/candle-care');
    const res = await getArticleDetail(req, { params: Promise.resolve({ slug: 'candle-care' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.article.slug).toBe('candle-care');
    expect(body.relatedProducts).toHaveLength(1);
    expect(body.relatedProducts[0].name).toBe('Sunflower Candle');
  });
});
