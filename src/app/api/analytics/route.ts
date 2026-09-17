import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrdersCount = orders.length;

    const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
    const processingOrdersCount = orders.filter((o) => o.status === 'PROCESSING').length;
    const shippedOrdersCount = orders.filter((o) => o.status === 'SHIPPED').length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrdersCount = orders.filter((o) => o.status === 'CANCELLED').length;
    const returnRequestedCount = orders.filter((o) => o.returnStatus === 'REQUESTED').length;

    const products = await prisma.product.findMany();
    const totalProductsCount = products.length;

    const candleProducts = products.filter((p) => p.category === 'candle');
    const ceramicProducts = products.filter((p) => p.category === 'ceramic');

    const totalCandlesInStock = candleProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalCeramicsInStock = ceramicProducts.reduce((sum, p) => sum + p.stockQuantity, 0);

    const lowStockProducts = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    );
    const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);

    const productSalesMap = new Map<string, {
      productId: string;
      productName: string;
      productImage: string;
      category: string;
      unitsSold: number;
      revenue: number;
      currentStock: number;
    }>();

    for (const p of products) {
      let img = '/images/products/sunflower-wax-cluster-yellow.jpg';
      try {
        const imgs = JSON.parse(p.images);
        if (Array.isArray(imgs) && imgs.length > 0) img = imgs[0];
      } catch {
        img = p.images;
      }

      productSalesMap.set(p.id, {
        productId: p.id,
        productName: p.name,
        productImage: img,
        category: p.category,
        unitsSold: 0,
        revenue: 0,
        currentStock: p.stockQuantity,
      });
    }

    for (const order of activeOrders) {
      for (const item of order.items) {
        const entry = productSalesMap.get(item.productId);
        if (entry) {
          entry.unitsSold += item.quantity;
          entry.revenue += item.lineTotal;
        }
      }
    }

    const bestSelling = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 8).map((o) => ({
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
        totalRevenue,
        totalOrdersCount,
        pendingOrdersCount,
        processingOrdersCount,
        shippedOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        returnRequestedCount,
        totalProductsCount,
        totalCandlesInStock,
        totalCeramicsInStock,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
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
