import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

interface SyncItem {
  productId: string;
  qty?: number;
  quantity?: number;
  selectedFragrance?: string;
  selectedColor?: string;
  selectedSize?: string;
  customNotes?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const items: SyncItem[] = body.items || [];

    for (const item of items) {
      const quantity = item.quantity || item.qty || 1;
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) continue;

      await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId: session.userId,
            productId: item.productId,
          },
        },
        update: {
          quantity: { increment: quantity },
          selectedFragrance: item.selectedFragrance || null,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          customNotes: item.customNotes || null,
        },
        create: {
          userId: session.userId,
          productId: item.productId,
          quantity,
          selectedFragrance: item.selectedFragrance || null,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          customNotes: item.customNotes || null,
        },
      });
    }

    const dbCart = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            salePrice: true,
            images: true,
            category: true,
            stockQuantity: true,
            inStock: true,
          },
        },
      },
    });

    return NextResponse.json({ items: dbCart });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
