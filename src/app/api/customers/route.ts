import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            wishlistItems: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = customers.map((c) => {
      const successfulOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
      const lifetimeSpend = successfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || (c.addresses[0]?.phone ?? null),
        createdAt: c.createdAt,
        totalOrders: c._count.orders,
        lifetimeSpend,
        wishlistCount: c._count.wishlistItems,
        primaryAddress: c.addresses[0]
          ? `${c.addresses[0].city}, ${c.addresses[0].state}`
          : 'No saved address',
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
