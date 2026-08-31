import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const cleanApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
  if (url.includes('charulata-backend.onrender.com')) {
    url = url.replace('charulata-backend.onrender.com', 'charulata-database.onrender.com');
  }
  return url;
};

const API_URL = cleanApiUrl();

export const revalidate = 60; // 60s ISR fallback

async function fetchBlog(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, {
      next: { revalidate: 60, tags: [`blog-${slug}`, 'blogs'] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const blog = json?.data?.blog || json?.blog || null;
    if (!blog) return null;

    // Block public access to draft or future-scheduled posts
    const isScheduledLive = blog.status === 'scheduled' && blog.scheduledAt && new Date(blog.scheduledAt).getTime() <= Date.now();
    const isPublished = blog.status === 'published';

    if (!isPublished && !isScheduledLive) {
      return null;
    }

    return blog;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
  const blog = await fetchBlog(slug);

  if (!blog) {
    return {
      title: 'Blog Article Not Found | Charulata Lifestyle',
      description: 'The requested blog post could not be found or has been removed.',
    };
  }

  const title = blog.metaTitle || blog.title;
  const description = blog.metaDescription || blog.excerpt || 'Read this article on Charulata Lifestyle.';
  const images = blog.coverImage ? [blog.coverImage] : ['/logo.png'];

  return {
    title: `${title} | Charulata Lifestyle`,
    description,
    keywords: blog.tags || [],
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: `${title} | Charulata Lifestyle`,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      siteName: 'Charulata Lifestyle',
      type: 'article',
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author || 'Charulata Lifestyle'],
      tags: blog.tags,
      images: images.map((img: string) => ({
        url: img,
        alt: blog.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Charulata Lifestyle`,
      description,
      images,
    },
  };
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
  const blog = await fetchBlog(slug);

  if (!blog) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.coverImage ? [blog.coverImage] : [`${SITE_URL}/logo.png`],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      '@type': 'Person',
      name: blog.author || 'Charulata Lifestyle',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Charulata Lifestyle',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BlogDetailClient slug={slug} />
      </Suspense>
    </>
  );
}
