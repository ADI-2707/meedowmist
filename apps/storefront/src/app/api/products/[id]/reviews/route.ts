import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const r of reviews) {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
      sum += r.rating;
    }

    const total = reviews.length;
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return NextResponse.json({
      reviews,
      distribution: {
        average,
        total,
        counts,
      },
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to leave a review' }, { status: 401 });
    }

    const { id } = await context.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const title = body.title ? String(body.title).trim() : null;
    const comment = body.comment ? String(body.comment).trim() : '';

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    if (!comment || comment.length < 5) {
      return NextResponse.json({ error: 'Review comment must be at least 5 characters long' }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.userId,
          status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] },
        },
      },
    });

    const isVerifiedPurchase = Boolean(orderItem);

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: session.userId,
        rating,
        title,
        comment,
        isVerifiedPurchase,
        isApproved: true,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
