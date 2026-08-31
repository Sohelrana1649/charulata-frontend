'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useGetBlogBySlugQuery, IBlogItem, IBlogImage } from '@/store/api/blogApi';
import BlogCard from '@/components/common/BlogCard';
import ProductCard from '@/components/common/ProductCard';
import Image from '@/components/SafeImage';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Tag, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  User, 
  Check, 
  Copy, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen,
  MessageCircle,
  Newspaper,
  Layers,
  Images,
  Maximize2,
  X,
  ShoppingBag,
  List,
  ChevronDown,
  Compass,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Award
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { toast } from 'react-toastify';

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const SIDEBAR_CATEGORIES = [
  { id: 'Fashion', labelEn: 'Fashion & Trends', labelBn: 'ফ্যাশন ও ট্রেন্ডস' },
  { id: 'Saree & Traditional', labelEn: 'Saree & Heritage', labelBn: 'শাড়ি ও ঐতিহ্য' },
  { id: 'Panjabi & Men', labelEn: 'Panjabi & Men', labelBn: 'পাঞ্জাবি ও পুরুষ' },
  { id: 'Jewelry & Accessories', labelEn: 'Jewelry Collection', labelBn: 'জুয়েলারি কালেকশন' },
  { id: 'Styling Tips', labelEn: 'Styling Tips', labelBn: 'স্টাইলিং টিপস' },
];

function calculateReadTime(text?: string): number {
  if (!text) return 3;
  const words = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

function formatDate(dateString?: string, locale: string = 'en'): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

export default function BlogDetailClient({ 
  slug, 
  previewBlog, 
  isPreview = false 
}: { 
  slug: string; 
  previewBlog?: IBlogItem; 
  isPreview?: boolean; 
}) {
  const { locale, t } = useTranslation();
  const { data: blogRes, isLoading: isQueryLoading, isError: isQueryError } = useGetBlogBySlugQuery(slug, {
    skip: Boolean(previewBlog),
  });

  const blog = previewBlog || blogRes?.data?.blog;
  const relatedBlogs = blogRes?.data?.relatedBlogs || [];
  const isLoading = previewBlog ? false : isQueryLoading;
  const isError = previewBlog ? false : isQueryError;

  const [copied, setCopied] = useState(false);
  const [contentLang, setContentLang] = useState<'auto' | 'en' | 'bn'>('auto');

  // Lightbox modal state for gallery images
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // TOC & Reading Progress states
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const articleBodyRef = useRef<HTMLDivElement>(null);

  const titleText = contentLang === 'bn' 
    ? (blog?.titleBn || blog?.title) 
    : contentLang === 'en' 
      ? blog?.title 
      : (locale === 'bn' && blog?.titleBn ? blog?.titleBn : blog?.title);

  const rawContent = contentLang === 'bn' 
    ? (blog?.contentBn || blog?.content) 
    : contentLang === 'en' 
      ? blog?.content 
      : (locale === 'bn' && blog?.contentBn ? blog?.contentBn : blog?.content);

  const hasBothLanguages = !!blog?.titleBn && !!blog?.contentBn;
  const readTime = calculateReadTime(rawContent);

  // Sorted gallery images
  const galleryImages: IBlogImage[] = useMemo(() => {
    if (!blog?.images || !Array.isArray(blog.images)) return [];
    return [...blog.images].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [blog?.images]);

  // 1. Extract Headings for TOC from Rendered Content
  useEffect(() => {
    if (!contentRef.current) return;

    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      const elements = contentRef.current.querySelectorAll('h2, h3');
      const items: HeadingItem[] = [];

      elements.forEach((el, index) => {
        let id = el.id;
        if (!id) {
          id = (el.textContent || '')
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim() || `section-${index + 1}`;
          el.id = id;
        }

        const level = el.tagName.toLowerCase() === 'h3' ? 3 : 2;
        const text = el.textContent?.trim() || `Section ${index + 1}`;
        if (text) {
          items.push({ id, text, level });
        }
      });

      setHeadings(items);
      if (items.length > 0 && !activeHeadingId) {
        setActiveHeadingId(items[0].id);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [rawContent, contentLang]);

  // 2. IntersectionObserver to Highlight Active TOC Heading
  useEffect(() => {
    if (headings.length < 3 || !contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-90px 0% -65% 0%',
        threshold: 0.1,
      }
    );

    const elements = contentRef.current.querySelectorAll('h2, h3');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // 3. Reading Progress Calculation for Article Content Area
  useEffect(() => {
    const handleScroll = () => {
      if (!articleBodyRef.current) return;
      const rect = articleBodyRef.current.getBoundingClientRect();
      const contentHeight = rect.height;
      const windowHeight = window.innerHeight;
      const contentTop = rect.top;

      const totalScrollable = contentHeight - windowHeight + 150;
      if (totalScrollable <= 0) {
        setReadingProgress(0);
        return;
      }

      const scrolled = Math.max(0, -contentTop + 100);
      const percentage = Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100));
      setReadingProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [rawContent]);

  // 4. Smooth Scroll to Heading
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = isPreview ? -120 : -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActiveHeadingId(id);
    setIsMobileTocOpen(false);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(locale === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const shareTitle = encodeURIComponent(titleText || 'Charulata Lifestyle Blog');

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevLightboxImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : galleryImages.length - 1));
  };

  const nextLightboxImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < galleryImages.length - 1 ? prev! + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 py-12" style={{ backgroundColor: '#ffffff', color: '#18181b' }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-1/4" />
          <div className="h-10 bg-zinc-200 rounded w-3/4" />
          <div className="h-4 bg-zinc-200 rounded w-1/2" />
          <div className="h-96 bg-zinc-200 rounded-3xl w-full" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-zinc-200 rounded w-full" />
            <div className="h-4 bg-zinc-200 rounded w-full" />
            <div className="h-4 bg-zinc-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center p-6" style={{ backgroundColor: '#ffffff', color: '#18181b' }}>
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-10 sm:p-14 text-center max-w-md shadow-xs space-y-4" style={{ backgroundColor: '#f9fafb' }}>
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <BookOpen size={32} />
          </div>
          <h2 className="text-xl font-bold font-serif text-zinc-900">
            {locale === 'bn' ? 'ব্লগটি পাওয়া যায়নি' : 'Blog Article Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            {locale === 'bn' 
              ? 'অনুরোধকৃত ব্লগ আর্টিকেলটি সরানো হয়েছে বা লিঙ্কটি ভুল।'
              : 'The requested blog post may have been removed or the link is incorrect.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            <span>{locale === 'bn' ? 'সকল ব্লগে ফিরে যান' : 'Back to All Blogs'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasToc = headings.length >= 3;

  return (
    <div className="w-full bg-white text-zinc-900" style={{ backgroundColor: '#ffffff', color: '#18181b' }}>
      
      {/* Scoped CSS to ensure 100% white background regardless of theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-detail-canvas,
        .blog-detail-canvas * {
          box-sizing: border-box;
        }
        .blog-detail-canvas {
          background-color: #ffffff !important;
          color: #18181b !important;
        }
        .blog-detail-canvas footer,
        .blog-detail-canvas .tags-section,
        .blog-detail-canvas .share-section {
          background-color: #ffffff !important;
          color: #18181b !important;
        }
      `}} />

      <article 
        ref={articleBodyRef} 
        className="blog-detail-canvas min-h-screen bg-white text-zinc-900 pb-20 relative" 
        style={{ backgroundColor: '#ffffff', color: '#18181b' }}
      >
        
        {/* ─── Reading Progress Bar (Fixed Top) ───────────────────────────── */}
        <div 
          className="fixed top-0 left-0 right-0 h-1 z-50 bg-primary/10 pointer-events-none"
          style={{ top: isPreview ? '37px' : '0px' }}
        >
          <div 
            className="h-full bg-primary transition-all duration-75 ease-out shadow-xs"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* ─── Persistent Preview Mode Banner ──────────────────────────────── */}
        {isPreview && (
          <div className="sticky top-0 z-50 bg-amber-500 text-amber-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm border-b border-amber-600">
            <div className="flex items-center space-x-2 font-black">
              <Sparkles size={16} className="text-amber-950 animate-spin" />
              <span>Preview Mode — This article is not yet published to the public.</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="uppercase tracking-wider px-2.5 py-0.5 bg-amber-900/20 rounded-md font-mono text-[11px] font-extrabold">
                Status: {blog.status} {blog.scheduledAt ? `(${new Date(blog.scheduledAt).toLocaleDateString()})` : ''}
              </span>
            </div>
          </div>
        )}

        {/* ─── Breadcrumbs Bar (Subtle, Soft Border-b) ────────────────────── */}
        <div className="border-b border-zinc-200/60 bg-zinc-50/60" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center space-x-2 text-xs font-bold text-zinc-500 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
              <ChevronRight size={13} />
              <Link href="/blog" className="hover:text-primary transition-colors">{locale === 'bn' ? 'ব্লগ' : 'Blog'}</Link>
              {blog.category && (
                <>
                  <ChevronRight size={13} />
                  <Link href={`/blog?category=${encodeURIComponent(blog.category)}`} className="hover:text-primary transition-colors">
                    {blog.category}
                  </Link>
                </>
              )}
              <ChevronRight size={13} />
              <span className="text-zinc-900 truncate max-w-[220px] sm:max-w-md">{titleText}</span>
            </nav>
          </div>
        </div>

        {/* ─── Main Content & Sidebar Grid ─────────────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10" style={{ backgroundColor: '#ffffff' }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ─── Left / Main Editorial Column (8 Cols) ────────────────────── */}
            <div className="lg:col-span-8 space-y-8 min-w-0" style={{ backgroundColor: '#ffffff' }}>
              
              {/* ─── Article Header ───────────────────────────────────────── */}
              <header className="space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Category Pill */}
                  {blog.category && (
                    <Link 
                      href={`/blog?category=${encodeURIComponent(blog.category)}`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-primary text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-colors border border-rose-200/80 shadow-2xs"
                      style={{ backgroundColor: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' }}
                    >
                      <Sparkles size={12} />
                      <span>{blog.category}</span>
                    </Link>
                  )}

                  {/* Language Switcher if bilingual */}
                  {hasBothLanguages && (
                    <div className="inline-flex items-center bg-zinc-100 border border-zinc-200/80 p-1 rounded-xl text-xs font-extrabold shadow-2xs" style={{ backgroundColor: '#f4f4f5', borderColor: '#e4e4e7' }}>
                      <button
                        onClick={() => setContentLang('en')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          contentLang === 'en' || (contentLang === 'auto' && locale === 'en')
                            ? 'bg-white text-primary font-black shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                        style={{
                          backgroundColor: contentLang === 'en' || (contentLang === 'auto' && locale === 'en') ? '#ffffff' : 'transparent',
                          color: contentLang === 'en' || (contentLang === 'auto' && locale === 'en') ? '#e11d48' : '#52525b'
                        }}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setContentLang('bn')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          contentLang === 'bn' || (contentLang === 'auto' && locale === 'bn')
                            ? 'bg-white text-primary font-black shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                        style={{
                          backgroundColor: contentLang === 'bn' || (contentLang === 'auto' && locale === 'bn') ? '#ffffff' : 'transparent',
                          color: contentLang === 'bn' || (contentLang === 'auto' && locale === 'bn') ? '#e11d48' : '#52525b'
                        }}
                      >
                        বাংলা
                      </button>
                    </div>
                  )}
                </div>

                {/* Article Headline (User-friendly Balanced Size) */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold sm:font-extrabold font-serif text-zinc-900 leading-[1.35] tracking-tight" style={{ color: '#18181b' }}>
                  {titleText}
                </h1>

                {/* Post Meta Data Bar (Soft, Friendly Border-y) */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-zinc-200/60 text-xs sm:text-sm font-medium text-zinc-500" style={{ borderColor: '#e4e4e7' }}>
                  
                  {/* Author info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-primary font-serif font-black shadow-2xs" style={{ backgroundColor: '#fff1f2', color: '#e11d48', borderColor: '#fecdd3' }}>
                      {blog.author?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-extrabold text-zinc-900" style={{ color: '#18181b' }}>{blog.author || 'Charulata Lifestyle'}</p>
                      <p className="text-[11px] text-zinc-500 font-medium">{locale === 'bn' ? 'সম্পাদকীয় দল' : 'Editorial Team'}</p>
                    </div>
                  </div>

                  {/* Date, Read Time, Views */}
                  <div className="flex items-center space-x-3 sm:space-x-4 text-zinc-600">
                    <span className="flex items-center space-x-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>{formatDate(blog.createdAt, locale)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1.5">
                      <Clock size={14} className="text-primary" />
                      <span>{readTime} {locale === 'bn' ? 'মিনিট পড়া' : 'min read'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1.5">
                      <Eye size={14} className="text-primary" />
                      <span>{blog.views || 0} {locale === 'bn' ? 'বার দেখা' : 'views'}</span>
                    </span>
                  </div>

                </div>

              </header>

              {/* ─── Hero Cover Image (Soft Bordered Container) ───────────── */}
              {blog.coverImage && (
                <div className="relative w-full aspect-[16/9] sm:h-[480px] rounded-3xl overflow-hidden border border-zinc-200/70 shadow-xs bg-zinc-100" style={{ borderColor: '#e4e4e7' }}>
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              )}

              {/* ─── Excerpt / Focus Topic Pull-Quote ─────────────────────── */}
              {(blog.focusKeyword || blog.excerpt) && (
                <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/40 border border-rose-200/60 border-l-4 border-l-primary text-zinc-800 font-serif text-base sm:text-lg leading-relaxed italic space-y-2 shadow-2xs" style={{ backgroundColor: '#fff1f2', color: '#1f2937', borderColor: '#fecdd3', borderLeftColor: '#e11d48' }}>
                  {blog.focusKeyword && (
                    <div className="not-italic text-xs font-black uppercase tracking-wider text-primary flex items-center space-x-1.5 pb-1 border-b border-rose-200/60">
                      <Sparkles size={13} className="animate-pulse shrink-0" />
                      <span>{locale === 'bn' ? 'ফোকাস কিওয়ার্ড' : 'Focus Topic'}</span>: <span className="font-extrabold">{blog.focusKeyword}</span>
                    </div>
                  )}
                  {blog.excerpt && <p>"{blog.excerpt}"</p>}
                </div>
              )}

              {/* ─── Mobile Collapsible Table of Contents ─────────────────── */}
              {hasToc && (
                <div className="block lg:hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 shadow-2xs" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
                  <button
                    type="button"
                    onClick={() => setIsMobileTocOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between font-serif font-black text-sm text-zinc-900 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Compass size={17} className="text-primary" />
                      <span>{locale === 'bn' ? 'সূচিপত্র (Table of Contents)' : 'Table of Contents'}</span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {headings.length}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-zinc-500 transition-transform duration-200 ${
                        isMobileTocOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMobileTocOpen && (
                    <nav className="mt-3 pt-3 border-t border-zinc-200/60 space-y-1.5 max-h-60 overflow-y-auto">
                      {headings.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => scrollToHeading(h.id)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center space-x-2 ${
                            activeHeadingId === h.id
                              ? 'bg-primary/10 text-primary font-black'
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                          } ${h.level === 3 ? 'pl-6 text-[11px]' : ''}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeHeadingId === h.id ? 'bg-primary' : 'bg-zinc-400'}`} />
                          <span className="truncate">{h.text}</span>
                        </button>
                      ))}
                    </nav>
                  )}
                </div>
              )}

              {/* ─── Article Rich HTML Content Body ────────────────────────── */}
              <div 
                ref={contentRef}
                className="prose prose-lg prose-zinc max-w-none text-zinc-800 font-sans leading-relaxed
                  prose-headings:font-serif prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-zinc-900 prose-headings:scroll-mt-28
                  prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:border-b prose-h2:border-zinc-200/60 prose-h2:pb-2.5 prose-h2:mt-8
                  prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6
                  prose-p:text-zinc-700 prose-p:leading-relaxed
                  prose-strong:text-zinc-900
                  prose-a:text-primary prose-a:underline hover:prose-a:opacity-80
                  prose-img:rounded-3xl prose-img:border prose-img:border-zinc-200/70 prose-img:shadow-sm"
                style={{ color: '#27272a' }}
                dangerouslySetInnerHTML={{ __html: rawContent || '<p>No content available.</p>' }}
              />

              {/* ─── Photo Gallery Section (Soft Border-t) ─────────────────── */}
              {galleryImages.length > 0 && (
                <section className="pt-10 mt-10 border-t border-zinc-200/60 space-y-5" style={{ borderColor: '#e4e4e7' }}>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Images size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black font-serif text-zinc-900">
                        {locale === 'bn' ? 'ফটো গ্যালারি' : 'Photo Gallery'}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        {galleryImages.length} {locale === 'bn' ? 'টি ছবি • বড় করে দেখতে ক্লিক করুন' : 'Photos • Click any image to view in full size'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img._id || img.url || idx}
                        onClick={() => openLightbox(idx)}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200/70 bg-zinc-100 cursor-pointer shadow-2xs hover:shadow-md hover:border-primary/50 transition-all duration-300"
                        style={{ borderColor: '#e4e4e7' }}
                      >
                        <Image
                          src={img.url}
                          alt={img.caption || `Gallery image ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="p-2.5 rounded-full bg-white/30 backdrop-blur-md text-white">
                            <Maximize2 size={20} />
                          </div>
                        </div>

                        {img.caption && (
                          <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <p className="text-white text-xs font-semibold truncate">
                              {img.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ─── Shop the Look (Related Products) (Soft Border-t) ──────── */}
              {blog.relatedProducts && blog.relatedProducts.length > 0 && (
                <section className="pt-10 mt-10 border-t border-zinc-200/60 space-y-6" style={{ borderColor: '#e4e4e7' }}>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black font-serif text-zinc-900">
                        {locale === 'bn' ? 'শপ দ্য লুক (পণ্যসমূহ)' : 'Shop the Look'}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        {locale === 'bn' ? 'এই ব্লগে উল্লেখিত আকর্ষণীয় পণ্যগুলো এখনই কিনুন' : 'Featured products mentioned in this article'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    {blog.relatedProducts.map((prod: any) => (
                      <ProductCard key={prod._id || prod.slug} product={prod} />
                    ))}
                  </div>
                </section>
              )}

              {/* ─── Clean Tags & Social Share Footer (Soft Border-t) ──────── */}
              <footer className="tags-section mt-10 pt-8 border-t border-zinc-200/60 space-y-5 bg-white text-zinc-900" style={{ backgroundColor: '#ffffff', color: '#18181b', borderColor: '#e4e4e7' }}>
                
                {/* Clickable Tags Row */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 bg-white pb-4 border-b border-zinc-200/50" style={{ backgroundColor: '#ffffff', borderColor: '#f4f4f5' }}>
                    <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-zinc-600 mr-1" style={{ color: '#52525b' }}>
                      <Tag size={14} className="text-primary" />
                      <span>{locale === 'bn' ? 'ট্যাগ সমূহ:' : 'Tags:'}</span>
                    </span>
                    {blog.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-zinc-50 hover:bg-primary hover:text-white text-zinc-800 font-bold text-xs transition-all border border-zinc-200/80 hover:border-primary shadow-2xs"
                        style={{ backgroundColor: '#f9fafb', color: '#18181b', borderColor: '#e4e4e7' }}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Social Share Bar */}
                <div className="share-section flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 bg-white" style={{ backgroundColor: '#ffffff' }}>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-black text-zinc-900" style={{ color: '#18181b' }}>
                    <Share2 size={16} className="text-primary" />
                    <span>{locale === 'bn' ? 'আর্টিকেলটি শেয়ার করুন:' : 'Share this article:'}</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap">
                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-blue-200/80 flex items-center justify-center transition-all shadow-2xs"
                      title="Share on Facebook"
                      style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                    >
                      <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </a>

                    {/* Twitter / X */}
                    <a
                      href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareTitle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-zinc-50 hover:bg-black text-zinc-800 hover:text-white border border-zinc-200/80 flex items-center justify-center transition-all shadow-2xs"
                      title="Share on X"
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareTitle}%20${currentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-emerald-200/80 flex items-center justify-center transition-all shadow-2xs"
                      title="Share on WhatsApp"
                      style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
                    >
                      <MessageCircle size={17} />
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className={`h-10 px-4 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        copied
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200/80'
                      }`}
                      title="Copy Link"
                      style={{ backgroundColor: copied ? '#059669' : '#f9fafb', color: copied ? '#ffffff' : '#27272a', borderColor: copied ? '#059669' : '#e4e4e7' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied') : (locale === 'bn' ? 'কপি লিঙ্ক' : 'Copy Link')}</span>
                    </button>
                  </div>
                </div>

              </footer>

            </div>

            {/* ─── Right Sticky Editorial Sidebar (4 Cols, User-friendly Cards) */}
            <aside className="lg:col-span-4 sticky top-24 self-start space-y-6 hidden lg:block" style={{ backgroundColor: '#ffffff' }}>
              
              {/* Widget 1: Table of Contents (if 3+ headings) */}
              {hasToc && (
                <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50/60 p-6 shadow-xs space-y-4" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50">
                    <div className="flex items-center space-x-2 font-serif font-bold text-zinc-900" style={{ color: '#18181b' }}>
                      <Compass size={18} className="text-primary" />
                      <span className="text-sm font-extrabold uppercase tracking-wider">
                        {locale === 'bn' ? 'সূচিপত্র' : 'Table of Contents'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {headings.length}
                    </span>
                  </div>

                  <nav className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
                    {headings.map((h) => {
                      const isActive = activeHeadingId === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => scrollToHeading(h.id)}
                          className={`w-full text-left py-2 px-3 rounded-xl text-xs transition-all flex items-start space-x-2.5 cursor-pointer ${
                            isActive
                              ? 'bg-primary/10 text-primary font-black shadow-2xs border-l-2 border-primary'
                              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 font-medium'
                          } ${h.level === 3 ? 'pl-7 text-[11px]' : ''}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors ${
                              isActive ? 'bg-primary scale-125' : 'bg-zinc-300'
                            }`}
                          />
                          <span className="leading-snug line-clamp-2">{h.text}</span>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="pt-3 border-t border-zinc-200/50 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                      <span>{locale === 'bn' ? 'পড়ার অগ্রগতি' : 'Reading Progress'}</span>
                      <span className="font-mono text-primary font-extrabold">{Math.round(readingProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${readingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Widget 2: Author & Editorial Brand Card */}
              <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50/60 p-6 shadow-xs space-y-4" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-serif font-black text-lg shadow-sm shrink-0">
                    C
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-serif font-extrabold text-zinc-900 text-sm sm:text-base" style={{ color: '#18181b' }}>
                        {blog.author || 'Charulata Lifestyle'}
                      </h4>
                      <CheckCircle2 size={15} className="text-primary fill-primary/10 shrink-0" />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">
                      {locale === 'bn' ? 'ফ্যাশন ও লাইফস্টাইল জার্নাল' : 'Fashion & Lifestyle Journal'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {locale === 'bn' 
                    ? 'ঐতিহ্যবাহী বাংলাদেশি ফ্যাশন, প্রিমিয়াম জামদানি ও আধুনিক স্টাইলিংয়ের নির্ভরযোগ্য প্ল্যাটফর্ম।'
                    : 'Curating the finest Bangladeshi traditional textiles, modern silhouettes, and styling wisdom.'}
                </p>

                <Link
                  href="/blog"
                  className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-primary hover:underline"
                >
                  <span>{locale === 'bn' ? 'সকল আর্টিকেল দেখুন' : 'Explore All Stories'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Widget 3: Explore Categories */}
              <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50/60 p-6 shadow-xs space-y-3.5" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
                <h4 className="font-serif font-extrabold text-sm uppercase tracking-wider text-zinc-900 flex items-center space-x-2 pb-2 border-b border-zinc-200/50" style={{ color: '#18181b' }}>
                  <Bookmark size={15} className="text-primary" />
                  <span>{locale === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}</span>
                </h4>

                <div className="space-y-1">
                  {SIDEBAR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${encodeURIComponent(cat.id)}`}
                      className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-primary hover:bg-zinc-100/80 transition-colors"
                    >
                      <span>{locale === 'bn' ? cat.labelBn : cat.labelEn}</span>
                      <ChevronRight size={13} className="text-zinc-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Widget 4: Quick Share */}
              <div className="rounded-3xl border border-zinc-200/70 bg-gradient-to-br from-rose-50/40 via-zinc-50/60 to-zinc-50/60 p-5 shadow-xs space-y-3" style={{ backgroundColor: '#f9fafb', borderColor: '#e4e4e7' }}>
                <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center space-x-1.5" style={{ color: '#18181b' }}>
                  <Share2 size={14} className="text-primary" />
                  <span>{locale === 'bn' ? 'বন্ধুদের সাথে শেয়ার করুন' : 'Share with Friends'}</span>
                </p>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100/80 text-xs font-extrabold text-zinc-800 transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs border border-zinc-200/80"
                  style={{ backgroundColor: '#ffffff', color: '#18181b', borderColor: '#e4e4e7' }}
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-primary" />}
                  <span>{copied ? (locale === 'bn' ? 'লিঙ্ক কপি হয়েছে' : 'Link Copied!') : (locale === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy Article Link')}</span>
                </button>
              </div>

            </aside>

          </div>

          {/* ─── Related Articles Section (Soft Border-t) ───────────────────── */}
          {relatedBlogs && relatedBlogs.length > 0 && (
            <section className="pt-14 mt-14 border-t border-zinc-200/60 space-y-6" style={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-zinc-900 flex items-center space-x-2" style={{ color: '#18181b' }}>
                  <Newspaper size={22} className="text-primary" />
                  <span>{locale === 'bn' ? 'সম্পর্কিত অন্যান্য নিবন্ধ' : 'Related Articles'}</span>
                </h3>
                <Link href="/blog" className="text-xs sm:text-sm font-extrabold text-primary hover:underline flex items-center space-x-1">
                  <span>{locale === 'bn' ? 'সকল ব্লগ দেখুন' : 'View All Blogs'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {relatedBlogs.slice(0, 3).map((rel) => (
                <BlogCard key={rel._id || rel.slug} blog={rel} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ─── Lightbox Modal for Gallery Images ─────────────────────────────── */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
          >
            <X size={24} />
          </button>

          {galleryImages.length > 1 && (
            <button
              onClick={prevLightboxImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {galleryImages.length > 1 && (
            <button
              onClick={nextLightboxImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={galleryImages[lightboxIndex].url}
                alt={galleryImages[lightboxIndex].caption || 'Gallery Photo'}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="text-center space-y-1">
              {galleryImages[lightboxIndex].caption && (
                <p className="text-white text-sm sm:text-base font-bold">
                  {galleryImages[lightboxIndex].caption}
                </p>
              )}
              <p className="text-xs text-white/60 font-mono">
                {lightboxIndex + 1} / {galleryImages.length}
              </p>
            </div>
          </div>

        </div>
      )}

    </article>
  </div>
  );
}
