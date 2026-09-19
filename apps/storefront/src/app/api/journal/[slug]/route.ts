import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const article = await prisma.journalArticle.findUnique({
      where: { slug },
    });

    if (!article || !article.isPublished) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    let relatedProducts: Array<{
      id: string;
      slug: string;
      name: string;
      price: number;
      salePrice: number | null;
      images: string;
      category: string;
    }> = [];

    if (article.relatedProductSlugs) {
      try {
        const slugs: string[] = JSON.parse(article.relatedProductSlugs);
        if (Array.isArray(slugs) && slugs.length > 0) {
          relatedProducts = await prisma.product.findMany({
            where: {
              slug: { in: slugs },
              isActive: true,
            },
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              salePrice: true,
              images: true,
              category: true,
            },
          });
        }
      } catch (err) {
        console.error('Failed to parse relatedProductSlugs', err);
      }
    }

    if (relatedProducts.length === 0) {
      relatedProducts = await prisma.product.findMany({
        where: { isActive: true },
        take: 2,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          salePrice: true,
          images: true,
          category: true,
        },
      });
    }

    return NextResponse.json({ article, relatedProducts });
  } catch (error) {
    console.error('Journal article detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
