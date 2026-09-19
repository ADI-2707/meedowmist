import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { trackingNumber, courierPartner, courierStatus } = body;

    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let targetStatus = existing.status;
    if (trackingNumber && (existing.status === 'PENDING' || existing.status === 'PROCESSING')) {
      targetStatus = 'SHIPPED';
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        trackingNumber: trackingNumber !== undefined ? (trackingNumber ? String(trackingNumber).trim() : null) : existing.trackingNumber,
        courierPartner: courierPartner !== undefined ? (courierPartner ? String(courierPartner).trim() : null) : existing.courierPartner,
        courierStatus: courierStatus !== undefined ? (courierStatus ? String(courierStatus).trim() : null) : existing.courierStatus,
        status: targetStatus,
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('Courier PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update courier tracking' }, { status: 500 });
  }
}
