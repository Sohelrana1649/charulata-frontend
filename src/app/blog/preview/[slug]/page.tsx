import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BlogPreviewClient from './BlogPreviewClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Draft Preview | Charulata Lifestyle',
  description: 'Unpublished blog article draft preview.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function BlogPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
  const token = resolvedSearchParams?.token || '';

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BlogPreviewClient slug={slug} token={token} />
    </Suspense>
  );
}
