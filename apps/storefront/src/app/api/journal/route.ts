import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const whereClause: {
      isPublished: boolean;
      category?: string;
    } = {
      isPublished: true,
    };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const articles = await prisma.journalArticle.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Journal articles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal articles' }, { status: 500 });
  }
}
