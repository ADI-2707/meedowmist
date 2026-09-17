import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
    });

    let filtered = products;
    if (filter === 'LOW_STOCK') {
      filtered = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
    } else if (filter === 'OUT_OF_STOCK') {
      filtered = products.filter((p) => p.stockQuantity === 0);
    } else if (filter === 'CANDLES') {
      filtered = products.filter((p) => p.category === 'candle');
    } else if (filter === 'CERAMICS') {
      filtered = products.filter((p) => p.category === 'ceramic');
    }

    const totalCandles = products
      .filter((p) => p.category === 'candle')
      .reduce((sum, p) => sum + p.stockQuantity, 0);

    const totalCeramics = products
      .filter((p) => p.category === 'ceramic')
      .reduce((sum, p) => sum + p.stockQuantity, 0);

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (p.salePrice ?? p.price) * p.stockQuantity,
      0
    );

    return NextResponse.json({
      products: filtered,
      summary: {
        totalCandles,
        totalCeramics,
        totalInventoryValue,
        lowStockCount: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length,
        outOfStockCount: products.filter((p) => p.stockQuantity === 0).length,
      },
    });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, changeQuantity, newQuantity, reason = 'MANUAL_ADJUSTMENT', note } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let targetStock = product.stockQuantity;
    let delta = 0;

    if (newQuantity !== undefined) {
      targetStock = Math.max(0, Number(newQuantity));
      delta = targetStock - product.stockQuantity;
    } else if (changeQuantity !== undefined) {
      delta = Number(changeQuantity);
      targetStock = Math.max(0, product.stockQuantity + delta);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: targetStock,
          inStock: targetStock > 0,
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId,
          changeQuantity: delta,
          newQuantity: targetStock,
          reason: String(reason),
          note: note ? String(note).trim() : null,
        },
      });

      return updated;
    });

    return NextResponse.json({ product: result });
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
