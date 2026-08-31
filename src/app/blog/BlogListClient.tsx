'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetAllBlogsQuery, useGetFeaturedBlogQuery, IBlogItem } from '@/store/api/blogApi';
import BlogCard, { BlogCardSkeleton, formatBlogDate, calculateReadTime } from '@/components/common/BlogCard';
import Image from '@/components/SafeImage';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Clock, 
  Eye, 
  Tag, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  X,
  Newspaper
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

const BLOG_CATEGORIES = [
  { id: 'all', labelEn: 'All Posts', labelBn: 'সব পোস্ট' },
  { id: 'Fashion', labelEn: 'Fashion', labelBn: 'ফ্যাশন' },
  { id: 'Saree & Traditional', labelEn: 'Saree & Traditional', labelBn: 'শাড়ি ও ঐতিহ্য' },
  { id: 'Panjabi & Men', labelEn: 'Panjabi & Men', labelBn: 'পাঞ্জাবি ও পুরুষ' },
  { id: 'Jewelry & Accessories', labelEn: 'Jewelry & Accessories', labelBn: 'জুয়েলারি ও আনুষঙ্গিক' },
  { id: 'Beauty & Fragrance', labelEn: 'Beauty & Fragrance', labelBn: 'সৌন্দর্য ও সুগন্ধি' },
  { id: 'Styling Tips', labelEn: 'Styling Tips', labelBn: 'স্টাইলিং টিপস' },
  { id: 'Lifestyle', labelEn: 'Lifestyle', labelBn: 'লাইফস্টাইল' },
];

export default function BlogListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useTranslation();

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedTag = searchParams.get('tag') || '';
  const initialSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);

  const queryParams = useMemo(() => {
    const params: { page: number; limit: number; search?: string; category?: string; tag?: string } = {
      page: currentPage,
      limit: 9,
    };
    if (activeSearch) params.search = activeSearch;
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    return params;
  }, [currentPage, activeSearch, selectedCategory, selectedTag]);

  const { data: blogResponse, isLoading, isFetching } = useGetAllBlogsQuery(queryParams);
  const { data: featuredResponse } = useGetFeaturedBlogQuery();

  const blogs = blogResponse?.data?.blogs || [];
  const pagination = blogResponse?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    updateUrl({ search: searchInput.trim(), page: 1 });
  };

  const handleCategoryClick = (catId: string) => {
    const newCat = catId === 'all' ? '' : catId;
    updateUrl({ category: newCat, page: 1 });
  };

  const handleTagRemove = () => {
    updateUrl({ tag: '', page: 1 });
  };

  const updateUrl = (newParams: { [key: string]: string | number | undefined }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'all') {
        current.delete(k);
      } else {
        current.set(k, String(v));
      }
    });
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/blog${query}`);
  };

  // Featured blog: prioritize manual featured blog from backend, else fall back to first published blog on page 1
  const isDefaultView = !activeSearch && (selectedCategory === 'all' || !selectedCategory) && !selectedTag && currentPage === 1;
  const featuredBlog = isDefaultView ? (featuredResponse?.data?.blog || (blogs.length > 0 ? blogs[0] : null)) : null;
  const gridBlogs = blogs;

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      
      {/* ─── Hero Banner Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background border-b border-border/60 pt-10 pb-12 sm:pt-14 sm:pb-16">
        {/* Decorative blur glows */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-72 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-60 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-2xs">
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span>{locale === 'bn' ? 'চারুলতা লাইফস্টাইল জার্নাল' : 'Charulata Lifestyle Journal'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight text-foreground leading-tight">
              {locale === 'bn' ? (
                <>ফ্যাশন, ঐতিহ্য ও <span className="text-primary">লাইফস্টাইল ব্লগ</span></>
              ) : (
                <>Stories, Fashion & <span className="text-primary">Lifestyle Insights</span></>
              )}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {locale === 'bn' 
                ? 'শাড়ি স্টাইলিং, পাঞ্জাবির ঐতিহ্য, আধুনিক ফ্যাশন ট্রেন্ড এবং লাইফস্টাইল গাইড নিয়ে আমাদের বিশেষ আয়োজন।'
                : 'Explore curated articles on saree styling, traditional heritage, modern wardrobe essentials, and beauty tips.'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={locale === 'bn' ? 'ব্লগ অনুসন্ধান করুন (যেমন: শাড়ি, পাঞ্জাবি)...' : 'Search blogs, styling tips, fabrics...'}
                  className="w-full h-12 pl-11 pr-10 rounded-2xl border border-border bg-card/90 backdrop-blur-sm text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setActiveSearch('');
                      updateUrl({ search: undefined, page: 1 });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-12 px-6 rounded-2xl bg-primary hover:opacity-90 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {locale === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </form>

          </div>
        </div>
      </section>

      {/* ─── Category Filter Strip ──────────────────────────────────────── */}
      <section className="sticky top-16 sm:top-20 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            {BLOG_CATEGORIES.map((cat) => {
              const isActive = (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all')) || selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
                      : 'bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                  }`}
                >
                  {locale === 'bn' ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Active Tag indicator */}
          {selectedTag && (
            <div className="flex items-center space-x-2 pt-2 text-xs font-bold text-muted-foreground">
              <span>{locale === 'bn' ? 'ট্যাগ ফিল্টার:' : 'Active Tag:'}</span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Tag size={12} />
                <span>#{selectedTag}</span>
                <button onClick={handleTagRemove} className="ml-1 hover:text-primary/70 cursor-pointer">
                  <X size={13} />
                </button>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ─── Main Content Container ─────────────────────────────────────── */}
      <main className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-10 pt-10">
        
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blogs.length === 0 && (
          <div className="bg-card border border-border rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-5 shadow-inner">
              <BookOpen size={36} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-serif text-foreground mb-2">
              {locale === 'bn' ? 'কোন ব্লগ পাওয়া যায়নি' : 'No Blog Posts Found'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {locale === 'bn' 
                ? 'আপনার দেওয়া সার্চ বা ফিল্টারে কোন আর্টিকেল পাওয়া যায়নি। ফিল্টার রিসেট করে আবার চেষ্টা করুন।'
                : 'We couldn’t find any articles matching your criteria. Try adjusting your search query or filters.'}
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setActiveSearch('');
                router.push('/blog');
              }}
              className="px-6 py-3 rounded-xl bg-primary hover:opacity-90 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              {locale === 'bn' ? 'সমস্ত ব্লগ দেখুন' : 'View All Blogs'}
            </button>
          </div>
        )}

        {/* ─── Featured Article Hero (Page 1 Top) ─────────────────────────── */}
        {!isLoading && featuredBlog && (
          <section className="mb-14">
            <div className="relative group overflow-hidden rounded-3xl border border-border bg-card shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                
                {/* Featured Image */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[300px] lg:min-h-[420px] overflow-hidden bg-muted">
                  <Image
                    src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200'}
                    alt={featuredBlog.title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-wider shadow-md">
                      <Sparkles size={13} />
                      <span>{locale === 'bn' ? 'ফিচার্ড স্টোরি' : 'Featured Story'}</span>
                    </span>
                  </div>
                </div>

                {/* Featured Details */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-card">
                  <div className="space-y-4">
                    
                    {/* Category & Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                      {featuredBlog.category && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-extrabold uppercase tracking-wider">
                          {featuredBlog.category}
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar size={13} className="text-primary shrink-0" />
                        <span>{formatBlogDate(featuredBlog.createdAt, locale)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock size={13} className="text-primary shrink-0" />
                        <span>{calculateReadTime(featuredBlog.content)} {locale === 'bn' ? 'মি. পড়া' : 'min read'}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${featuredBlog.slug}`}>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif text-foreground hover:text-primary transition-colors leading-snug">
                        {locale === 'bn' && featuredBlog.titleBn ? featuredBlog.titleBn : featuredBlog.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 font-normal">
                      {featuredBlog.excerpt || (featuredBlog.content ? featuredBlog.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : '')}
                    </p>

                    {/* Tags */}
                    {featuredBlog.tags && featuredBlog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {featuredBlog.tags.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => updateUrl({ tag, page: 1 })}
                            className="text-[11px] font-bold text-muted-foreground hover:text-primary bg-muted px-2.5 py-0.5 rounded-full border border-border/50 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Read More Button & Views */}
                  <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-muted-foreground">
                      <Eye size={15} className="text-primary" />
                      <span>{featuredBlog.views || 0} {locale === 'bn' ? 'ভিউ' : 'views'}</span>
                    </div>

                    <Link
                      href={`/blog/${featuredBlog.slug}`}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md group/btn cursor-pointer"
                    >
                      <span>{locale === 'bn' ? 'সম্পূর্ণ পড়ুন' : 'Read Article'}</span>
                      <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>

              </div>
            </div>
          </section>
        )}

        {/* ─── Articles Grid ─────────────────────────────────────────────── */}
        {!isLoading && gridBlogs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg sm:text-xl font-extrabold font-serif text-foreground flex items-center space-x-2">
                <Newspaper size={20} className="text-primary" />
                <span>{locale === 'bn' ? 'সাম্প্রতিক প্রকাশনা' : 'Latest Articles'}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                {pagination.total}{' '}
                {locale === 'bn'
                  ? 'টি নিবন্ধ'
                  : pagination.total === 1
                    ? 'Article'
                    : 'Articles'}
              </span>
            </div>

            {/* Responsive grid with uniform card sizing and compact gap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {gridBlogs.map((blog) => (
                <BlogCard
                  key={blog._id || blog.slug}
                  blog={blog}
                  onTagClick={(tag) => updateUrl({ tag, page: 1 })}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Pagination Controls ────────────────────────────────────────── */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-14">
            <button
              onClick={() => updateUrl({ page: Math.max(1, currentPage - 1) })}
              disabled={!pagination.hasPrevPage}
              className="h-10 px-4 rounded-xl border border-border bg-card text-foreground font-bold text-xs sm:text-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft size={16} />
              <span>{locale === 'bn' ? 'পূর্ববর্তী' : 'Prev'}</span>
            </button>

            {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateUrl({ page: p })}
                className={`h-10 w-10 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs border ${
                  p === currentPage
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-card text-foreground hover:bg-muted border-border'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => updateUrl({ page: currentPage + 1 })}
              disabled={!pagination.hasNextPage}
              className="h-10 px-4 rounded-xl border border-border bg-card text-foreground font-bold text-xs sm:text-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <span>{locale === 'bn' ? 'পরবর্তী' : 'Next'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
