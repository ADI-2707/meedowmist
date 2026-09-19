import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const ratingParam = searchParams.get('rating');
    const search = searchParams.get('search')?.trim();

    const whereClause: {
      productId?: string;
      rating?: number;
      OR?: Array<{
        comment?: { contains: string };
        title?: { contains: string };
        user?: { name: { contains: string } };
      }>;
    } = {};

    if (productId) {
      whereClause.productId = productId;
    }

    if (ratingParam) {
      const r = parseInt(ratingParam, 10);
      if (r >= 1 && r <= 5) {
        whereClause.rating = r;
      }
    }

    if (search) {
      whereClause.OR = [
        { comment: { contains: search } },
        { title: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Seller reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
