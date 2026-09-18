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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search')?.trim();

    const isPaginated = pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)));
    const skip = (page - 1) * limit;

    const whereClause: {
      role: 'CUSTOMER';
      OR?: Array<{
        name?: { contains: string };
        email?: { contains: string };
        phone?: { contains: string };
      }>;
    } = {
      role: 'CUSTOMER',
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const total = await prisma.user.count({ where: whereClause });

    const customers = await prisma.user.findMany({
      where: whereClause,
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            wishlistItems: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(isPaginated ? { skip, take: limit } : {}),
    });

    const userIds = customers.map((c) => c.id);

    const spendByUsers = userIds.length > 0
      ? await prisma.order.groupBy({
          by: ['userId'],
          where: {
            userId: { in: userIds },
            status: { not: 'CANCELLED' },
          },
          _sum: {
            totalAmount: true,
          },
        })
      : [];

    const spendMap = new Map(
      spendByUsers.map((s) => [s.userId, s._sum.totalAmount || 0])
    );

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || (c.addresses[0]?.phone ?? null),
      createdAt: c.createdAt,
      totalOrders: c._count.orders,
      lifetimeSpend: spendMap.get(c.id) || 0,
      wishlistCount: c._count.wishlistItems,
      primaryAddress: c.addresses[0]
        ? `${c.addresses[0].city}, ${c.addresses[0].state}`
        : 'No saved address',
    }));

    return NextResponse.json({
      customers: formatted,
      pagination: {
        page: isPaginated ? page : 1,
        limit: isPaginated ? limit : total,
        total,
        totalPages: isPaginated ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
