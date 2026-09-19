import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import JournalClient from './JournalClient';

export const metadata: Metadata = {
  title: 'Journal & Care Guides | Meadow Mist',
  description: 'Care guides, gifting ideas, and notes from the studio — the Meadow Mist artisan journal.',
};

export default async function JournalPage() {
  const articles = await prisma.journalArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  });

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
    publishedAt: a.publishedAt.toISOString(),
  }));

  return <JournalClient articles={formatted} />;
}
