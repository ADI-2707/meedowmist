import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Promotions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      expiresAt,
      usageLimit,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Promo code and discount value are required' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const promo = await prisma.promotion.create({
      data: {
        code: cleanCode,
        description: description ? String(description).trim() : null,
        discountType: String(discountType),
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    console.error('Promotion POST error:', error);
    return NextResponse.json({ error: 'Failed to create promotion code' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Promotion DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
