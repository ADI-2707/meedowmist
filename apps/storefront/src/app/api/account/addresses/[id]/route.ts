import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { fullName, phone, streetAddress, apartment, city, state, postalCode, country, isDefault } = body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? String(fullName).trim() : existing.fullName,
        phone: phone !== undefined ? String(phone).trim() : existing.phone,
        streetAddress: streetAddress !== undefined ? String(streetAddress).trim() : existing.streetAddress,
        apartment: apartment !== undefined ? (apartment ? String(apartment).trim() : null) : existing.apartment,
        city: city !== undefined ? String(city).trim() : existing.city,
        state: state !== undefined ? String(state).trim() : existing.state,
        postalCode: postalCode !== undefined ? String(postalCode).trim() : existing.postalCode,
        country: country !== undefined ? String(country).trim() : existing.country,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
      },
    });

    return NextResponse.json({ address: updated });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
