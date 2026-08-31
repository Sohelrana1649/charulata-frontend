'use client';

import React from 'react';
import Link from 'next/link';
import { useGetBlogPreviewQuery } from '@/store/api/blogApi';
import BlogDetailClient from '@/app/blog/[slug]/BlogDetailClient';
import { AlertTriangle, BookOpen, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function BlogPreviewClient({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const { locale } = useTranslation();

  const { data: previewRes, isLoading, isError } = useGetBlogPreviewQuery(
    { slug, token: token || '' },
    { skip: !token }
  );

  const blog = previewRes?.data?.blog;

  // 1. Missing Token
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center max-w-md shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <KeyRound size={32} />
          </div>
          <h2 className="text-xl font-bold font-serif text-foreground">
            {locale === 'bn' ? 'প্রিভিউ টোকেন প্রয়োজন' : 'Preview Token Required'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {locale === 'bn'
              ? 'এই ব্লগটি প্রিভিউ দেখতে একটি বৈধ সিক্রেট টোকেন প্যারামিটার (?token=xxx) প্রয়োজন।'
              : 'A valid secret preview token is required to preview this unpublished blog.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            <span>{locale === 'bn' ? 'ব্লগে ফিরে যান' : 'Back to Blog'}</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-xs sm:text-sm font-bold text-muted-foreground">
          {locale === 'bn' ? 'প্রিভিউ লোড হচ্ছে...' : 'Loading draft preview...'}
        </p>
      </div>
    );
  }

  // 3. Error or Invalid Token
  if (isError || !blog) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center max-w-md shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold font-serif text-foreground">
            {locale === 'bn' ? 'অবৈধ বা মেয়াদোত্তীর্ণ প্রিভিউ লিঙ্ক' : 'Invalid or Expired Preview Link'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {locale === 'bn'
              ? 'প্রিভিউ লিঙ্কটির মেয়াদ শেষ হয়ে গেছে বা টোকেনটি ভুল। অনুগ্রহ করে এডমিন প্যানেল থেকে নতুন লিঙ্ক তৈরি করুন।'
              : 'This preview token is invalid or has expired. Please regenerate a new preview link from the admin dashboard.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-90 transition"
            >
              <BookOpen size={16} />
              <span>{locale === 'bn' ? 'সকল ব্লগ দেখুন' : 'Browse All Blogs'}</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-extrabold text-xs sm:text-sm hover:bg-muted transition"
            >
              <ArrowLeft size={16} />
              <span>{locale === 'bn' ? 'হোমপেজ' : 'Homepage'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Render Preview Blog
  return <BlogDetailClient slug={slug} previewBlog={blog} isPreview={true} />;
}
