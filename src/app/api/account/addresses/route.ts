import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, streetAddress, apartment, city, state, postalCode, country, isDefault } = body;

    if (!fullName || !phone || !streetAddress || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: 'Please provide all required address fields' },
        { status: 400 }
      );
    }

    const existingCount = await prisma.address.count({
      where: { userId: session.userId },
    });

    const shouldBeDefault = isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        streetAddress: String(streetAddress).trim(),
        apartment: apartment ? String(apartment).trim() : null,
        city: String(city).trim(),
        state: String(state).trim(),
        postalCode: String(postalCode).trim(),
        country: country ? String(country).trim() : 'India',
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
