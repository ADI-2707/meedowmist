import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      storeName,
      contactEmail,
      contactPhone,
      shippingFlatRate,
      freeShippingThreshold,
      codEnabled,
      codFee,
      aboutHeadline,
      aboutStory,
      aboutArtisanNote,
    } = body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName: storeName ? String(storeName).trim() : undefined,
        contactEmail: contactEmail ? String(contactEmail).trim() : undefined,
        contactPhone: contactPhone !== undefined ? (contactPhone ? String(contactPhone).trim() : null) : undefined,
        shippingFlatRate: shippingFlatRate !== undefined ? Number(shippingFlatRate) : undefined,
        freeShippingThreshold: freeShippingThreshold !== undefined ? Number(freeShippingThreshold) : undefined,
        codEnabled: codEnabled !== undefined ? Boolean(codEnabled) : undefined,
        codFee: codFee !== undefined ? Number(codFee) : undefined,
        aboutHeadline: aboutHeadline !== undefined ? aboutHeadline : undefined,
        aboutStory: aboutStory !== undefined ? aboutStory : undefined,
        aboutArtisanNote: aboutArtisanNote !== undefined ? aboutArtisanNote : undefined,
      },
      create: {
        id: 'default',
        storeName: storeName || 'Meadow Mist',
        contactEmail: contactEmail || 'hello@meadowmist.in',
        shippingFlatRate: Number(shippingFlatRate) || 99,
        freeShippingThreshold: Number(freeShippingThreshold) || 1499,
        codEnabled: codEnabled !== undefined ? Boolean(codEnabled) : true,
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
