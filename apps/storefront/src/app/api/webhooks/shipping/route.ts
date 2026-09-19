import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CourierTrackingUpdate } from '@/lib/shipping/types';

export async function POST(request: Request) {
  try {
    const body: CourierTrackingUpdate = await request.json();
    const { trackingNumber, courierStatus, delivered } = body;

    if (!trackingNumber) {
      return NextResponse.json({ error: 'trackingNumber is required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { trackingNumber },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found for tracking number' }, { status: 404 });
    }

    const updateData: { courierStatus: string; status?: string } = {
      courierStatus,
    };

    if (delivered || courierStatus?.toLowerCase().includes('delivered')) {
      updateData.status = 'DELIVERED';
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, orderId: updated.id, status: updated.status });
  } catch (error) {
    console.error('Shipping webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
