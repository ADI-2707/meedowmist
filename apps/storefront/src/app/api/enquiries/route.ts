import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, getAdminSessionUser } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, category, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const session = await getSessionUser();

    const enquiry = await prisma.enquiry.create({
      data: {
        userId: session?.userId || null,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        category: category ? String(category).trim() : 'General',
        message: String(message).trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error('Enquiry POST error:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const whereClause: { status?: string } = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Enquiries GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminReply } = body;

    if (!id) {
      return NextResponse.json({ error: 'Enquiry id is required' }, { status: 400 });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: status || undefined,
        adminReply: adminReply !== undefined ? adminReply : undefined,
      },
    });

    return NextResponse.json({ enquiry: updated });
  } catch (error) {
    console.error('Enquiry PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}
