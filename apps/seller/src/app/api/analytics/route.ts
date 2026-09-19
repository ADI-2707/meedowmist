import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      revenueAgg,
      totalOrdersCount,
      orderStatusGroups,
      returnRequestedCount,
      totalProductsCount,
      candleStockAgg,
      ceramicStockAgg,
      outOfStockCount,
      potentialLowStock,
      topSoldItems,
      recentOrdersData,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.order.count({
        where: { returnStatus: 'REQUESTED' },
      }),
      prisma.product.count(),
      prisma.product.aggregate({
        where: { category: 'candle' },
        _sum: { stockQuantity: true },
      }),
      prisma.product.aggregate({
        where: { category: 'ceramic' },
        _sum: { stockQuantity: true },
      }),
      prisma.product.count({
        where: { stockQuantity: 0 },
      }),
      prisma.product.findMany({
        where: { stockQuantity: { gt: 0, lte: 20 } },
        select: {
          id: true,
          name: true,
          category: true,
          stockQuantity: true,
          lowStockThreshold: true,
        },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: { status: { not: 'CANCELLED' } },
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { select: { quantity: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    const statusCountMap: Record<string, number> = {};
    for (const g of orderStatusGroups) {
      statusCountMap[g.status] = g._count.status;
    }

    const lowStockProducts = potentialLowStock.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );

    const topProductIds = topSoldItems.map((item) => item.productId);
    const topProducts = topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, images: true, category: true, stockQuantity: true },
        })
      : [];
    const topProductMap = new Map(topProducts.map((p) => [p.id, p]));

    const bestSelling = topSoldItems.map((item) => {
      const p = topProductMap.get(item.productId);
      let img = '/images/products/sunflower-wax-cluster-yellow.jpg';
      if (p?.images) {
        try {
          const imgs = JSON.parse(p.images);
          if (Array.isArray(imgs) && imgs.length > 0) img = imgs[0];
        } catch {
          img = p.images;
        }
      }
      return {
        productId: item.productId,
        productName: p?.name || 'Unknown Product',
        productImage: img,
        category: p?.category || 'decor',
        unitsSold: item._sum.quantity || 0,
        revenue: item._sum.lineTotal || 0,
        currentStock: p?.stockQuantity || 0,
      };
    });

    const recentOrders = recentOrdersData.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || 'Guest',
      customerEmail: o.user?.email || '',
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue: revenueAgg._sum.totalAmount || 0,
        totalOrdersCount,
        pendingOrdersCount: statusCountMap['PENDING'] || 0,
        processingOrdersCount: statusCountMap['PROCESSING'] || 0,
        shippedOrdersCount: statusCountMap['SHIPPED'] || 0,
        deliveredOrdersCount: statusCountMap['DELIVERED'] || 0,
        cancelledOrdersCount: statusCountMap['CANCELLED'] || 0,
        returnRequestedCount,
        totalProductsCount,
        totalCandlesInStock: candleStockAgg._sum.stockQuantity || 0,
        totalCeramicsInStock: ceramicStockAgg._sum.stockQuantity || 0,
        lowStockCount: lowStockProducts.length,
        outOfStockCount,
      },
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stockQuantity: p.stockQuantity,
        threshold: p.lowStockThreshold,
      })),
      bestSelling,
      recentOrders,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
