'use client';

import React from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { Calendar, Clock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { IBlogItem } from '@/store/api/blogApi';

interface BlogCardProps {
  blog: IBlogItem;
  onTagClick?: (tag: string) => void;
  priority?: boolean;
}

export function calculateReadTime(text?: string): number {
  if (!text) return 3;
  const words = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

export function formatBlogDate(dateString?: string, locale: string = 'en'): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function BlogCard({ blog, onTagClick, priority = false }: BlogCardProps) {
  const { locale } = useTranslation();

  const titleText = locale === 'bn' && blog.titleBn ? blog.titleBn : blog.title;
  const excerptText =
    blog.excerpt ||
    (blog.content
      ? blog.content
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .slice(0, 130) + '...'
      : '');
  const readTime = calculateReadTime(blog.content);

  return (
    <article className="group w-full max-w-[420px] mx-auto sm:mx-0 bg-card rounded-2xl border border-border/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
      
      {/* ─── Top Section: Image & Body ───────────────────────────────────── */}
      <div>
        {/* Fixed Aspect Ratio Image with Category Overlay */}
        <Link 
          href={`/blog/${blog.slug}`} 
          className="block relative w-full aspect-[4/3] overflow-hidden bg-muted/60 rounded-t-2xl"
        >
          <Image
            src={blog.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'}
            alt={blog.title}
            fill
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {blog.category && (
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-primary text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-md">
                <Sparkles size={10} className="mr-0.5" />
                <span>{blog.category}</span>
              </span>
            </div>
          )}
        </Link>

        {/* Card Body Content */}
        <div className="p-5 space-y-3">
          
          {/* Category & Date & Reading Time Row */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs font-bold text-muted-foreground">
            {blog.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-extrabold text-[10px] uppercase tracking-wider">
                {blog.category}
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar size={12} className="text-primary shrink-0" />
              <span>{formatBlogDate(blog.createdAt, locale)}</span>
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span className="flex items-center space-x-1">
              <Clock size={12} className="text-primary shrink-0" />
              <span>
                {readTime} {locale === 'bn' ? 'মি. পড়া' : 'min read'}
              </span>
            </span>
          </div>

          {/* Title */}
          <Link href={`/blog/${blog.slug}`} className="block">
            <h4 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-tight">
              {titleText}
            </h4>
          </Link>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-normal">
            {excerptText}
          </p>

          {/* Tags Pills */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {blog.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onTagClick) {
                      onTagClick(tag);
                    }
                  }}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-primary bg-muted/80 hover:bg-muted px-2.5 py-1 rounded-full border border-border/50 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ─── Bottom Footer Row: Views & Read Button ──────────────────────── */}
      <div className="px-5 py-3.5 border-t border-border/60 flex items-center justify-between text-xs font-bold text-muted-foreground bg-card">
        <div className="flex items-center space-x-1.5">
          <Eye size={14} className="text-primary shrink-0" />
          <span>
            {blog.views || 0} {locale === 'bn' ? 'ভিউ' : 'views'}
          </span>
        </div>

        <Link
          href={`/blog/${blog.slug}`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:opacity-90 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 group/btn cursor-pointer"
        >
          <span>{locale === 'bn' ? 'পড়ুন' : 'Read Article'}</span>
          <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>

    </article>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="w-full max-w-[420px] mx-auto sm:mx-0 rounded-2xl border border-border/80 bg-card overflow-hidden animate-pulse shadow-xs flex flex-col justify-between">
      <div>
        <div className="w-full aspect-[4/3] bg-muted/70 rounded-t-2xl" />
        <div className="p-5 space-y-3">
          <div className="h-3.5 bg-muted rounded-md w-2/5" />
          <div className="h-5 bg-muted rounded-md w-4/5" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-muted rounded-md w-full" />
            <div className="h-3 bg-muted rounded-md w-3/4" />
          </div>
          <div className="flex gap-1.5 pt-2">
            <div className="h-5 w-14 bg-muted rounded-full" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-border/60 flex justify-between bg-card">
        <div className="h-3.5 w-16 bg-muted rounded" />
        <div className="h-7 w-24 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
