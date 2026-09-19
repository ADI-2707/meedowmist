import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import JournalClient from './JournalClient';

export const metadata: Metadata = {
  title: 'Journal & Care Guides | Meadow Mist',
  description: 'Care guides, gifting ideas, and notes from the studio — the Meadow Mist artisan journal.',
};

export default async function JournalPage() {
  let articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readTime: string;
    coverImage: string;
    isPublished: boolean;
    publishedAt: Date;
  }> = [];

  try {
    articles = await prisma.journalArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to query journal articles from DB:', err);
    articles = [];
  }

  const formatted = articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category,
    readTime: a.readTime,
    coverImage: a.coverImage,
    isPublished: a.isPublished,
    publishedAt: typeof a.publishedAt === 'string' ? a.publishedAt : a.publishedAt.toISOString(),
  }));

  return <JournalClient articles={formatted} />;
}
