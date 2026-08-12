'use client';

import React from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { useTranslation } from '@/i18n/LanguageContext';
import { ArrowRight, Package } from 'lucide-react';
import { translateCategoryName } from '@/utils/categoryTranslator';

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

export default function CategoryGrid({ categories = [], selectedCategory, onSelectCategory }: CategoryGridProps) {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Transform backend categories
  const displayList = React.useMemo(() => {
    return categories.map((cat, idx) => ({
      _id: cat._id || cat.id || `cat-${idx}`,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      image: cat.image,
      iconBg: cat.iconBg || 'bg-primary text-white',
      LucideIcon: cat.LucideIcon || Package
    }));
  }, [categories]);

  if (!displayList || displayList.length === 0) {
    return null;
  }

  // Initially show 16 items (2 rows of 8 on desktop / 4 rows of 4 on mobile). Expand when user clicks View All.
  const visibleList = isExpanded ? displayList : displayList.slice(0, 16);

  return (
    <section className="w-full my-6 sm:my-10">
      {/* Section Header */}
      <div className="flex items-end justify-between border-b border-border/70 pb-3.5 mb-4 sm:mb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
            {t('home.category') || (locale === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories')}
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-foreground font-serif mt-1 tracking-tight">
            {locale === 'bn' ? 'আমাদের সকল ক্যাটাগরি' : 'Explore by Category'}
          </h2>
        </div>

        {displayList.length > 16 && (
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs sm:text-sm font-extrabold text-primary hover:underline flex items-center space-x-1.5 transition-all cursor-pointer bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0 mb-0.5"
          >
            <span>{isExpanded ? (locale === 'bn' ? 'কম দেখুন' : 'Show Less') : (locale === 'bn' ? 'সব দেখুন' : 'View All')}</span>
            <ArrowRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* 1. MOBILE ONLY: Horizontal Story Scroll Strip (Amazon/Daraz Premium Mobile Style) */}
      <div className="sm:hidden w-full relative">
        {/* Subtle Right-Edge Gradient Scroll Indicator */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card via-card/80 to-transparent z-10 sm:hidden" />

        <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth gap-3.5 py-2.5 px-1 -mx-1 snap-x">
          {displayList.map((cat, idx) => {
            const isSelected = selectedCategory && (selectedCategory === cat.slug || selectedCategory === cat.name);
            const Icon = cat.LucideIcon || Package;
            const href = `/search?category=${encodeURIComponent(cat.slug || cat.name)}`;

            return (
              <Link
                key={`mobile-${cat._id || cat.slug || idx}`}
                href={href}
                onClick={() => onSelectCategory && onSelectCategory(cat.slug || cat.name)}
                className="snap-start flex flex-col items-center justify-start shrink-0 group cursor-pointer w-24"
              >
                <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative border-2 transition-all duration-300 shadow-xs bg-muted shrink-0 p-0.5 ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/40 shadow-md scale-105' 
                    : 'border-border/90 active:border-primary'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${cat.iconBg || 'bg-primary text-white'}`}>
                        <Icon size={32} className="stroke-[2]" />
                      </div>
                    )}
                  </div>
                </div>

                <span className={`text-[11px] sm:text-xs font-semibold text-center line-clamp-2 leading-snug tracking-normal mt-2 w-full px-1 min-h-[2.25rem] flex items-center justify-center ${
                  isSelected ? 'text-primary font-bold' : 'text-foreground/90'
                }`}>
                  {translateCategoryName(cat.name, locale)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP ONLY: Original Card Box Grid Layout */}
      <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5 sm:gap-4 lg:gap-5 transition-all duration-500">
        {visibleList.map((cat, idx) => {
          const isSelected = selectedCategory && (selectedCategory === cat.slug || selectedCategory === cat.name);
          const Icon = cat.LucideIcon || Package;
          const href = `/search?category=${encodeURIComponent(cat.slug || cat.name)}`;

          return (
            <Link
              key={`desktop-${cat._id || cat.slug || idx}`}
              href={href}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug || cat.name)}
              className={`group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md ${
                isSelected 
                  ? 'bg-primary/10 border-primary shadow-xs font-bold' 
                  : 'bg-card border-border/70 hover:border-primary/40'
              }`}
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center relative border-2 border-border/70 group-hover:border-primary shadow-2xs group-hover:scale-108 transition-all duration-300 bg-muted shrink-0">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="10vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${cat.iconBg || 'bg-primary text-white'}`}>
                    <Icon size={24} className="stroke-[2]" />
                  </div>
                )}
              </div>

              <span className="text-xs sm:text-[13px] lg:text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center line-clamp-2 leading-snug tracking-normal mt-2.5 min-h-[2.5rem] flex items-center justify-center">
                {translateCategoryName(cat.name, locale)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

