import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const revalidate = 60; // 60s ISR fallback

export const metadata: Metadata = {
  title: 'Blog & Fashion Journal | Charulata Lifestyle',
  description: 'Read the latest trends, styling guides, saree care tips, and lifestyle articles by Charulata Lifestyle.',
  keywords: [
    'charulata blog',
    'saree styling tips',
    'panjabi trends bangladesh',
    'bangladeshi fashion blog',
    'lifestyle articles dhaka',
    'traditional wear styling',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog & Fashion Journal | Charulata Lifestyle',
    description: 'Explore curated fashion insights, traditional styling guides, and saree tips from Charulata Lifestyle.',
    url: `${SITE_URL}/blog`,
    siteName: 'Charulata Lifestyle',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle Blog',
      },
    ],
  },
};

export default function BlogPage() {
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Charulata Lifestyle Blog',
    description: 'Explore the latest fashion, styling, and traditional lifestyle articles by Charulata Lifestyle.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Charulata Lifestyle',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BlogListClient />
      </Suspense>
    </>
  );
}
