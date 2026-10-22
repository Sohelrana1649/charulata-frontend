'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import ProductCard from '@/components/common/ProductCard';
import 'swiper/css';

interface FlashSaleSectionProps {
  rawProducts?: any[];
  campaign?: any;
  wishlistArray?: any[];
  onWishlistToggle?: (productOrId: any) => void;
}

// Convert numbers to authentic Bangla digits
const toBanglaDigits = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).padStart(2, '0').replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
};

export default function FlashSaleSection({
  rawProducts = [],
  campaign,
  wishlistArray = [],
  onWishlistToggle,
}: FlashSaleSectionProps) {
  const { t, locale } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // 1. Filter genuine, active flash sale products
  const validProducts = useMemo(() => {
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) return [];

    return rawProducts
      .filter((product: any) => {
        if (!product) return false;
        const price = Number(product.price) || 0;
        const salePrice = Number(product.salePrice) || 0;

        // Check start time if set
        if (product.discountStartDate) {
          const startTime = new Date(product.discountStartDate).getTime();
          if (!isNaN(startTime) && startTime > now) return false;
        }

        // Check end time if set
        if (product.discountEndDate) {
          const endTime = new Date(product.discountEndDate).getTime();
          if (!isNaN(endTime) && endTime <= now) return false;
        }

        // Validate real discount
        return price > 0 && salePrice > 0 && salePrice < price;
      })
      .slice(0, 15);
  }, [rawProducts, now]);

  // 2. Determine genuine sale end target time (NEVER invent fake end of today)
  const targetEndTime = useMemo(() => {
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) return null;

    // Check active product discountEndDates in the future
    const futureDates = rawProducts
      .map((p: any) => (p?.discountEndDate ? new Date(p.discountEndDate).getTime() : null))
      .filter((timestamp: number | null): timestamp is number => timestamp !== null && !isNaN(timestamp) && timestamp > now)
      .sort((a, b) => a - b);

    if (futureDates.length > 0) {
      return futureDates[0];
    }

    // Check active campaign endDate
    if (campaign?.endDate) {
      const campEnd = new Date(campaign.endDate).getTime();
      if (!isNaN(campEnd) && campEnd > now) {
        return campEnd;
      }
    }

    return null;
  }, [rawProducts, campaign, now]);

  // 3. Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hasValidEnd: boolean;
  }>(() => {
    if (!targetEndTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, hasValidEnd: false };
    }
    const diff = targetEndTime - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, hasValidEnd: false };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      hasValidEnd: true,
    };
  });

  // 4. Stable 1-second timer tick
  useEffect(() => {
    if (!targetEndTime) {
      setTimeLeft(prev => prev.hasValidEnd ? { days: 0, hours: 0, minutes: 0, seconds: 0, hasValidEnd: false } : prev);
      return;
    }

    const updateTimer = () => {
      const currentNow = Date.now();
      setNow(currentNow);
      const diff = targetEndTime - currentNow;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, hasValidEnd: false });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        hasValidEnd: true,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetEndTime]);

  // Gracefully hide entire section if no valid products exist
  if (validProducts.length === 0) {
    return null;
  }

  return (
    <section 
      id="flash-sale-section" 
      aria-label={t('home.flashSale')}
      className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 pt-8 sm:pt-12"
    >
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
          <div className="space-y-2">
            {/* Tag Badge */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#BE123C] dark:text-rose-400 uppercase tracking-widest bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-3 py-1 rounded-full shadow-2xs">
                <Zap size={13} className="fill-current text-[#BE123C] dark:text-rose-400" />
                <span>{t('home.flashSaleTag')}</span>
              </span>
            </div>

            {/* Heading and Countdown Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-0.5">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif tracking-tight">
                {t('home.flashSale')}
              </h2>

              {/* Countdown Timer - only shown when valid sale end time exists */}
              {timeLeft.hasValidEnd && (
                <div
                  className="inline-flex items-center gap-2 sm:gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 px-3 sm:px-4 py-1.5 rounded-full shadow-2xs max-w-full"
                  role="timer"
                  aria-label={locale === 'bn' ? 'ফ্ল্যাশ সেল শেষ হওয়ার সময়' : 'Flash sale countdown'}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 shrink-0">
                    <Clock size={14} className="animate-pulse shrink-0 text-[#BE123C] dark:text-rose-400" />
                    <span className="text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                      {locale === 'bn' ? 'সময় বাকি:' : 'Ends in:'}
                    </span>
                  </div>

                  {/* Monospaced Digit Boxes */}
                  <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs font-black">
                    {timeLeft.days > 0 && (
                      <>
                        <div className="flex items-center gap-0.5 whitespace-nowrap">
                          <span className="bg-[#BE123C] text-white min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-md flex items-center justify-center text-[11px] sm:text-xs shadow-xs font-mono font-black">
                            {locale === 'bn' ? toBanglaDigits(timeLeft.days) : String(timeLeft.days).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-200 ml-0.5">
                            {locale === 'bn' ? 'দিন' : 'd'}
                          </span>
                        </div>
                        <span className="text-rose-400 font-bold">:</span>
                      </>
                    )}

                    <div className="flex items-center gap-0.5 whitespace-nowrap">
                      <span className="bg-[#BE123C] text-white min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-md flex items-center justify-center text-[11px] sm:text-xs shadow-xs font-mono font-black">
                        {locale === 'bn' ? toBanglaDigits(timeLeft.hours) : String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-200 ml-0.5">
                        {locale === 'bn' ? 'ঘণ্টা' : 'h'}
                      </span>
                    </div>

                    <span className="text-rose-400 font-bold">:</span>

                    <div className="flex items-center gap-0.5 whitespace-nowrap">
                      <span className="bg-[#BE123C] text-white min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-md flex items-center justify-center text-[11px] sm:text-xs shadow-xs font-mono font-black">
                        {locale === 'bn' ? toBanglaDigits(timeLeft.minutes) : String(timeLeft.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-200 ml-0.5">
                        {locale === 'bn' ? 'মি.' : 'm'}
                      </span>
                    </div>

                    <span className="text-rose-400 font-bold">:</span>

                    <div className="flex items-center gap-0.5 whitespace-nowrap">
                      <span className="bg-[#BE123C] text-white min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-1 rounded-md flex items-center justify-center text-[11px] sm:text-xs shadow-xs font-mono font-black">
                        {locale === 'bn' ? toBanglaDigits(timeLeft.seconds) : String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-800 dark:text-rose-200 ml-0.5">
                        {locale === 'bn' ? 'সে.' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Subtitle */}
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 max-w-xl">
              {t('home.flashSaleSub')}
            </p>
          </div>

          {/* Navigation Controls & View More Link */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            {/* Desktop Carousel Arrow Controls */}
            {validProducts.length > 2 && (
              <div className="hidden sm:flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  disabled={isBeginning}
                  aria-label={locale === 'bn' ? 'পূর্ববর্তী পণ্যসমূহ' : 'Previous products'}
                  className="w-8 h-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  disabled={isEnd}
                  aria-label={locale === 'bn' ? 'পরবর্তী পণ্যসমূহ' : 'Next products'}
                  className="w-8 h-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronRight size={16} className="stroke-[2.5]" />
                </button>
              </div>
            )}

            {/* View More Link connected to product listing /search */}
            <Link
              href="/search"
              prefetch={false}
              className="group inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-primary hover:text-[#b0842e] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5"
              aria-label={locale === 'bn' ? 'সব ফ্ল্যাশ সেল পণ্য দেখুন' : 'View all flash sale products'}
            >
              <span className="hover:underline">{t('home.viewMore')}</span>
              <ArrowRight size={14} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carousel / Product Slider */}
        <div className="relative w-full overflow-hidden">
          <Swiper
            grabCursor={true}
            modules={[Autoplay, A11y]}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={validProducts.length > 5}
            spaceBetween={12}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            breakpoints={{
              320: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 14,
              },
              900: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              1200: {
                slidesPerView: 5,
                spaceBetween: 16,
              },
            }}
            className="!py-1 !px-0.5"
          >
            {validProducts.map((product: any) => {
              const productId = product._id?.toString() || product.id?.toString();
              const isWishlisted = wishlistArray.some(
                (item: any) => (item._id || item.id || item)?.toString() === productId
              );

              return (
                <SwiperSlide key={product._id || product.id} className="!h-auto flex">
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
        </div>
      </div>
    </section>
  );
}
