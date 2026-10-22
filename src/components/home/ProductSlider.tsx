'use client';

import React, { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, A11y, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ArrowRight, ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useTranslation } from '@/i18n/LanguageContext';
import 'swiper/css';

interface ProductSliderProps {
  id: string;
  tag: string;
  title: string;
  icon: React.ElementType;
  viewMoreHref: string;
  viewMoreLabel: string;
  products: any[];
  wishlistArray?: any[];
  onWishlistToggle?: (productOrId: any) => void;
  autoplayDelay?: number;
}

export default function ProductSlider({
  id,
  tag,
  title,
  icon: Icon,
  viewMoreHref,
  viewMoreLabel,
  products,
  wishlistArray = [],
  onWishlistToggle,
  autoplayDelay = 4500,
}: ProductSliderProps) {
  const { locale } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleRatio, setVisibleRatio] = useState(1);

  // Keep arrow / progress UI in sync with the swiper state
  const sync = useCallback((s: SwiperType) => {
    setIsLocked(!!s.isLocked);
    setProgress(Math.min(1, Math.max(0, s.progress || 0)));
    const perView = typeof s.params.slidesPerView === 'number' ? s.params.slidesPerView : 1;
    const total = s.slides?.length || 1;
    setVisibleRatio(Math.min(1, perView / total));
  }, []);

  if (!products || products.length === 0) return null;

  const showControls = !isLocked && products.length > 1;
  const thumbWidth = Math.max(visibleRatio * 100, 12);
  const thumbLeft = progress * (100 - thumbWidth);

  return (
    <div id={id} className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center shrink-0">
            <Icon size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-primary uppercase tracking-widest block">{tag}</span>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground font-serif mt-0.5 truncate">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {showControls && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label={locale === 'bn' ? 'পূর্ববর্তী পণ্যসমূহ' : 'Previous products'}
                aria-controls={`${id}-track`}
                className="w-9 h-9 rounded-full border border-border/80 bg-card hover:bg-primary hover:text-white hover:border-primary text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronLeft size={17} className="stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label={locale === 'bn' ? 'পরবর্তী পণ্যসমূহ' : 'Next products'}
                aria-controls={`${id}-track`}
                className="w-9 h-9 rounded-full border border-border/80 bg-card hover:bg-primary hover:text-white hover:border-primary text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronRight size={17} className="stroke-[2.5]" />
              </button>
            </div>
          )}
          <Link
            href={viewMoreHref}
            prefetch={false}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link px-3 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <span>{viewMoreLabel}</span>
            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-primary/30 via-border to-transparent mb-5 sm:mb-6" />

      {/* Slider */}
      <div className="relative group/slider" id={`${id}-track`}>
        <Swiper
          modules={[Autoplay, A11y, Keyboard]}
          grabCursor
          rewind
          watchOverflow
          keyboard={{ enabled: true, onlyInViewport: true }}
          autoplay={{ delay: autoplayDelay, disableOnInteraction: false, pauseOnMouseEnter: true }}
          spaceBetween={10}
          slidesPerView={2}
          breakpoints={{
            480: { slidesPerView: 2.2, spaceBetween: 12 },
            640: { slidesPerView: 3, spaceBetween: 14 },
            900: { slidesPerView: 4, spaceBetween: 16 },
            1200: { slidesPerView: 5, spaceBetween: 16 },
          }}
          onSwiper={(s) => {
            swiperRef.current = s;
            sync(s);
          }}
          onSlideChange={sync}
          onProgress={sync}
          onResize={sync}
          onBreakpoint={sync}
          onLock={sync}
          onUnlock={sync}
          className="!py-1 !px-0.5"
        >
          {products.map((product: any) => {
            const productId = (product._id || product.id)?.toString();
            const isWishlisted = wishlistArray.some(
              (item: any) => (item?._id || item?.id || item)?.toString() === productId
            );
            return (
              <SwiperSlide key={productId} className="!h-auto flex">
                <div className="w-full h-full flex flex-col">
                  <ProductCard
                    product={product}
                    isWishlisted={isWishlisted}
                    onWishlistToggle={onWishlistToggle}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Floating side arrows on large screens (appear on hover) */}
        {showControls && (
          <>
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-hidden="true"
              tabIndex={-1}
              className="hidden lg:flex absolute -left-4 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg text-foreground hover:bg-primary hover:text-white hover:border-primary items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-hidden="true"
              tabIndex={-1}
              className="hidden lg:flex absolute -right-4 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-lg text-foreground hover:bg-primary hover:text-white hover:border-primary items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Progress track + mobile swipe hint */}
      {showControls && (
        <div className="mt-4 sm:mt-5 flex items-center justify-center gap-3">
          <span className="sm:hidden inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
            <Hand size={12} className="text-primary animate-pulse" />
            {locale === 'bn' ? 'সোয়াইপ করুন' : 'Swipe'}
          </span>
          <div
            className="relative h-1 w-28 sm:w-40 rounded-full bg-border/70 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={locale === 'bn' ? 'স্লাইডার অগ্রগতি' : 'Slider progress'}
          >
            <span
              className="absolute top-0 h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${thumbWidth}%`, left: `${thumbLeft}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
