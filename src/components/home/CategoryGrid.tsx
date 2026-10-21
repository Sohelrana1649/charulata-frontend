'use client';

import React from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { useTranslation } from '@/i18n/LanguageContext';
import { useGetCategoriesQuery, useGetProductsQuery } from '@/store/api/productApi';
import { translateCategoryName } from '@/utils/categoryTranslator';
import {
  ArrowRight,
  Package,
  Shirt,
  Sparkles,
  Home,
  Watch,
  Baby,
  Smartphone,
  ShoppingBag,
  HeartPulse,
  Gem,
  Flower2,
  Footprints,
  SprayCan,
  Glasses,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface CategoryItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  image?: string;
  iconBg?: string;
  LucideIcon?: any;
}

interface CategoryGridProps {
  categories?: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

/** Soft pastel themes, cycled per parent category (static strings so Tailwind can see them). */
const THEMES = [
  { card: 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-500/10 dark:to-rose-500/15 border-pink-100 dark:border-pink-500/20', blob: 'bg-pink-200/70 dark:bg-pink-400/20', badge: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-300' },
  { card: 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-500/10 dark:to-blue-500/15 border-sky-100 dark:border-sky-500/20', blob: 'bg-sky-200/70 dark:bg-sky-400/20', badge: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-300' },
  { card: 'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/15 border-orange-100 dark:border-orange-500/20', blob: 'bg-orange-200/70 dark:bg-orange-400/20', badge: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-300' },
  { card: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-500/10 dark:to-green-500/15 border-emerald-100 dark:border-emerald-500/20', blob: 'bg-emerald-200/70 dark:bg-emerald-400/20', badge: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300' },
  { card: 'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/15 border-violet-100 dark:border-violet-500/20', blob: 'bg-violet-200/70 dark:bg-violet-400/20', badge: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-300' },
  { card: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-500/10 dark:to-amber-500/15 border-yellow-100 dark:border-yellow-500/20', blob: 'bg-yellow-200/70 dark:bg-yellow-400/20', badge: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  { card: 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-500/10 dark:to-cyan-500/15 border-teal-100 dark:border-teal-500/20', blob: 'bg-teal-200/70 dark:bg-teal-400/20', badge: 'bg-teal-600', text: 'text-teal-700 dark:text-teal-300' },
  { card: 'bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-500/10 dark:to-blue-500/15 border-indigo-100 dark:border-indigo-500/20', blob: 'bg-indigo-200/70 dark:bg-indigo-400/20', badge: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-300' },
];

/** Pick an icon from the category slug/name (used for badges and when no product image exists). */
function pickIcon(cat: any) {
  const key = `${cat?.slug || ''} ${cat?.name || ''}`.toLowerCase();
  if (/women|saree|kurti|fashion/.test(key) && !/men's|mens/.test(key)) return Shirt;
  if (/men/.test(key)) return Shirt;
  if (/beauty|personal|perfume|attar/.test(key)) return Flower2;
  if (/home|lifestyle|clean/.test(key)) return Home;
  if (/kid|baby|boy|girl/.test(key)) return Baby;
  if (/gadget|electronic|mobile/.test(key)) return Smartphone;
  if (/bag/.test(key)) return ShoppingBag;
  if (/shoe|footwear/.test(key)) return Footprints;
  if (/jewel|gem/.test(key)) return Gem;
  if (/watch/.test(key)) return Watch;
  if (/sunglass|glass/.test(key)) return Glasses;
  if (/health|fitness|sport/.test(key)) return HeartPulse;
  if (/clean|spray/.test(key)) return SprayCan;
  if (/access/.test(key)) return Sparkles;
  return Package;
}

const idOf = (v: any): string => (v && typeof v === 'object' ? String(v._id || '') : String(v || ''));
const firstImage = (p: any): string => {
  const imgs = Array.isArray(p?.productImages) ? p.productImages : [];
  return imgs.find((i: any) => typeof i === 'string' && i.trim()) || '';
};

const extractList = (res: any, key: string): any[] => {
  if (Array.isArray(res?.data?.[key])) return res.data[key];
  if (Array.isArray(res?.[key])) return res[key];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
};

export default function CategoryGrid({ categories = [], selectedCategory, onSelectCategory }: CategoryGridProps) {
  const { locale } = useTranslation();
  const bn = locale === 'bn';

  const { data: catRes, isLoading: catLoading, isError: catError, refetch } = useGetCategoriesQuery({});
  const { data: prodRes } = useGetProductsQuery({ limit: 100 });

  // Prefer the shared categories API (has parent/child info); fall back to landing-page data passed in as a prop.
  const allCategories: any[] = React.useMemo(() => {
    const fromApi = extractList(catRes, 'categories');
    return fromApi.length > 0 ? fromApi : (categories as any[]);
  }, [catRes, categories]);

  const products: any[] = React.useMemo(() => extractList(prodRes, 'products'), [prodRes]);

  const { parents, popularSubs } = React.useMemo(() => {
    const byOrder = (a: any, b: any) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || '');
    const active = allCategories.filter((c: any) => c && c.isActive !== false);

    const parentList = active.filter((c: any) => c.level === 0 || !c.parentCategory).sort(byOrder);
    const subList = active.filter((c: any) => !(c.level === 0 || !c.parentCategory)).sort(byOrder);

    // Product-derived thumbnails & popularity
    const imageBySub: Record<string, string> = {};
    const countBySub: Record<string, number> = {};
    const imageByParent: Record<string, string> = {};
    products.forEach((p: any) => {
      if (p?.isActive === false || p?.isDeleted) return;
      const img = firstImage(p);
      const subId = idOf(p.category);
      const parentId = idOf(p.parentCategory) || idOf(p.category?.parentCategory);
      if (subId) {
        countBySub[subId] = (countBySub[subId] || 0) + 1;
        if (img && !imageBySub[subId]) imageBySub[subId] = img;
      }
      if (parentId && img && !imageByParent[parentId]) imageByParent[parentId] = img;
    });

    const subsByParent: Record<string, any[]> = {};
    subList.forEach((s: any) => {
      const pid = idOf(s.parentCategory);
      if (!pid) return;
      (subsByParent[pid] = subsByParent[pid] || []).push(s);
    });

    const enrichedParents = parentList.slice(0, 8).map((p: any) => {
      const pid = String(p._id || '');
      const subs = subsByParent[pid] || [];
      const image =
        p.image ||
        imageByParent[pid] ||
        subs.map((s: any) => imageBySub[String(s._id)]).find(Boolean) ||
        '';
      return { ...p, subs, image };
    });

    const popular = subList
      .map((s: any) => ({
        ...s,
        image: s.image || imageBySub[String(s._id)] || '',
        count: countBySub[String(s._id)] || 0,
      }))
      .sort((a: any, b: any) => b.count - a.count || byOrder(a, b));

    return { parents: enrichedParents, popularSubs: popular };
  }, [allCategories, products]);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const tolerance = 4;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(maxScroll > tolerance && Math.ceil(el.scrollLeft) < maxScroll - tolerance);
  }, []);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        checkScroll();
      });
      ro.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      ro?.disconnect();
    };
  }, [checkScroll, popularSubs.length]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(Math.round(el.clientWidth * 0.82), 200);
    const amount = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const hrefFor = (cat: any) => `/search?category=${encodeURIComponent(cat.slug || cat.name)}`;
  const isSelected = (cat: any) =>
    !!selectedCategory && (selectedCategory === cat.slug || selectedCategory === cat.name);

  const viewAllLabel = bn ? 'সব ক্যাটাগরি দেখুন' : 'View All Categories';

  // ---------- Loading ----------
  if (catLoading && allCategories.length === 0) {
    return (
      <section className="w-full" aria-busy="true" aria-label="Loading categories">
        <div className="h-5 w-32 rounded bg-muted animate-pulse mb-3" />
        <div className="h-8 w-72 max-w-full rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[190px] sm:h-[200px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  // ---------- Error ----------
  if (catError && allCategories.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          {bn ? 'ক্যাটাগরি লোড করা যায়নি।' : 'We could not load categories right now.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
        >
          <RefreshCw size={14} />
          {bn ? 'আবার চেষ্টা করুন' : 'Try again'}
        </button>
      </section>
    );
  }

  // ---------- Empty ----------
  if (parents.length === 0) return null;

  return (
    <section className="w-full overflow-hidden" aria-labelledby="category-section-title">
      {/* ================= PARENT CATEGORIES ================= */}
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary">
            {bn ? 'ক্যাটাগরি অনুযায়ী কিনুন' : 'Shop by Category'}
          </span>
          <h2
            id="category-section-title"
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif mt-1 tracking-tight"
          >
            {bn ? 'আপনার পছন্দের পণ্য খুঁজুন' : 'Find What You’re Looking For'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            {bn
              ? 'আমাদের সেরা ক্যাটাগরিগুলো ঘুরে দেখুন এবং দারুণ সব পণ্য আবিষ্কার করুন।'
              : 'Explore our top categories and discover amazing products.'}
          </p>
        </div>
        <Link
          href="/search"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary hover:gap-2.5 transition-all whitespace-nowrap pb-1"
        >
          <span className="hidden min-[400px]:inline">{viewAllLabel}</span>
          <span className="min-[400px]:hidden">{bn ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {parents.map((cat: any, idx: number) => {
          const theme = THEMES[idx % THEMES.length];
          const Icon = pickIcon(cat);
          const name = translateCategoryName(cat, bn ? 'bn' : 'en');
          const subNames = (cat.subs || []).slice(0, 3).map((s: any) => translateCategoryName(s, bn ? 'bn' : 'en'));
          const hasMore = (cat.subs || []).length > 3;
          const selected = isSelected(cat);

          return (
            <Link
              key={cat._id || cat.slug || idx}
              href={hrefFor(cat)}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug || cat.name)}
              aria-label={name}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 sm:p-5 min-h-[190px] sm:min-h-[210px] shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary ${theme.card} ${
                selected ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Decorative blob */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 sm:h-52 sm:w-52 rounded-full ${theme.blob} transition-transform duration-500 group-hover:scale-110`}
              />

              {/* Visual: product photo or icon */}
              <div className="absolute right-0 top-0 h-[96px] w-[96px] sm:inset-y-0 sm:h-auto sm:w-[44%]">
                {cat.image ? (
                  <div className="relative h-full w-full overflow-hidden rounded-bl-[2rem] sm:rounded-bl-none sm:rounded-l-[2.5rem]">
                    <Image
                      src={cat.image}
                      alt={name}
                      fill
                      sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className={`h-14 w-14 sm:h-20 sm:w-20 opacity-30 ${theme.text}`} strokeWidth={1.25} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <span
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full text-white shadow-sm ${theme.badge}`}
                >
                  <Icon size={18} className="text-white" />
                </span>
              </div>

              <div className="relative z-10 max-w-[62%] sm:max-w-[58%]">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground leading-tight line-clamp-2">
                  {name}
                </h3>
                {subNames.length > 0 && (
                  <p className="mt-1 text-[11px] sm:text-xs font-medium text-foreground/70 leading-snug line-clamp-2">
                    {subNames.join(' • ')}
                    {hasMore ? (bn ? ' ও আরও' : ' & More') : ''}
                  </p>
                )}
                <span
                  className={`mt-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-card shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white ${theme.text}`}
                >
                  <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ================= POPULAR SUBCATEGORIES ================= */}
      {popularSubs.length > 0 && (
        <div className="mt-8 sm:mt-10 lg:mt-12">
          {/* Section Header: Aligned on desktop, responsive on mobile, with Next/Prev Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary">
                {bn ? 'জনপ্রিয় সাব-ক্যাটাগরি' : 'Popular Subcategories'}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif mt-1 tracking-tight">
                {bn ? 'আপনার প্রিয় পণ্য কিনুন' : 'Shop Your Favourite'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium line-clamp-1 sm:line-clamp-none">
                {bn ? 'সবচেয়ে জনপ্রিয় ক্যাটাগরিগুলোতে দ্রুত যান।' : 'Quick access to the most loved categories.'}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0">
              {/* Carousel Prev & Next Navigation Buttons in Website Brand Color (Positioned UP in Header) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => scrollByAmount('left')}
                  disabled={!canScrollLeft}
                  aria-label={bn ? 'পূর্ববর্তী ক্যাটাগরি' : 'Previous categories'}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-white hover:bg-primary/90 shadow-xs shadow-primary/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByAmount('right')}
                  disabled={!canScrollRight}
                  aria-label={bn ? 'পরবর্তী ক্যাটাগরি' : 'Next categories'}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-white hover:bg-primary/90 shadow-xs shadow-primary/25 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="h-4 w-px bg-border/80 hidden sm:block" />

              <Link
                href="/search"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary hover:gap-2.5 transition-all whitespace-nowrap pb-0.5"
              >
                <span className="hidden min-[400px]:inline">{viewAllLabel}</span>
                <span className="min-[400px]:hidden">{bn ? 'সব দেখুন' : 'View All'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Strictly One Line: Horizontal Scrollable Strip with Responsive Card Widths */}
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            role="region"
            aria-label={bn ? 'জনপ্রিয় সাব-ক্যাটাগরি তালিকা' : 'Popular subcategories'}
            className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x touch-pan-x pb-2 pt-1 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-2xl"
          >
            {popularSubs.map((sub: any) => {
              const Icon = pickIcon(sub);
              const name = translateCategoryName(sub, bn ? 'bn' : 'en');
              const selected = isSelected(sub);
              return (
                <Link
                  key={sub._id || sub.slug || sub.name}
                  href={hrefFor(sub)}
                  onClick={() => onSelectCategory && onSelectCategory(sub.slug || sub.name)}
                  aria-label={name}
                  className={`group snap-start shrink-0 w-[calc((100%-2.25*0.625rem)/3.25)] min-[420px]:w-[calc((100%-2.5*0.625rem)/3.5)] sm:w-[calc((100%-3*0.75rem)/4)] md:w-[calc((100%-4*0.75rem)/5)] lg:w-[calc((100%-5*0.75rem)/6)] xl:w-[calc((100%-7*0.75rem)/8)] min-w-[90px] h-[124px] sm:h-[132px] flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border bg-card shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary select-none ${
                    selected
                      ? 'border-primary ring-2 ring-primary/25 bg-primary/5 text-primary'
                      : 'border-border/80 hover:bg-card'
                  }`}
                >
                  {/* Circular Product Thumbnail */}
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 lg:h-[68px] lg:w-[68px] shrink-0 overflow-hidden rounded-full bg-muted/40 ring-1 ring-border/60 flex items-center justify-center">
                    {sub.image ? (
                      <Image
                        src={sub.image}
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 68px, (min-width: 640px) 64px, 56px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <Icon size={24} className="text-primary/90" />
                      </div>
                    )}
                  </div>

                  {/* Category Name: 2 lines max, centered */}
                  <span
                    title={name}
                    className={`w-full mt-1.5 sm:mt-2 text-center text-[11px] sm:text-xs lg:text-[13px] font-bold leading-tight line-clamp-2 px-1 transition-colors ${
                      selected
                        ? 'text-primary font-extrabold'
                        : 'text-foreground/90 group-hover:text-primary'
                    }`}
                  >
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
