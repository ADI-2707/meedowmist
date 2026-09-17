import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const promo = await prisma.promotion.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 404 });
    }

    const now = new Date();
    if (promo.startsAt && now < promo.startsAt) {
      return NextResponse.json({ error: 'Promo code is not active yet' }, { status: 400 });
    }

    if (promo.expiresAt && now > promo.expiresAt) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) {
      return NextResponse.json({ error: 'Promo code usage limit has been reached' }, { status: 400 });
    }

    const amount = Number(orderAmount) || 0;
    if (amount < promo.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${promo.minOrderValue.toLocaleString('en-IN')} required for this code`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    return NextResponse.json({
      code: promo.code,
      discount: Math.round(discount),
      description: promo.description,
    });
  } catch (error) {
    console.error('Promo verify error:', error);
    return NextResponse.json({ error: 'Failed to verify promo code' }, { status: 500 });
  }
}
