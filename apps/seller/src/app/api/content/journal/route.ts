import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSessionUser } from '@/lib/session';

export async function GET() {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.journalArticle.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Seller journal GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal articles' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminSessionUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isPublished } = body;

    const updated = await prisma.journalArticle.update({
      where: { id },
      data: { isPublished: Boolean(isPublished) },
    });

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error('Seller journal PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update article status' }, { status: 500 });
  }
}
