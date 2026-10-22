'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import CountUp from 'react-countup';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import ProductGrid from '@/components/common/ProductGrid';
import ProductSlider from '@/components/home/ProductSlider';
import { useGetLandingDataQuery } from '@/store/api/landingApi';
import { getGuestWishlist, toggleGuestWishlist } from '@/utils/guestWishlist';
import { toast } from 'react-toastify';
import { useGetProductsQuery } from '@/store/api/productApi';
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Quote,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Info,
  Loader2,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  Share2,
  Check,
  Users,
  Clock,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useSubscribeNewsletterMutation,
  useSubmitContactFormMutation
} from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/i18n/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const resolveBannerLink = (link: string | undefined): string => {
  if (!link || !link.trim() || link.trim() === '#' || link.trim() === 'javascript:void(0)') return '/search';
  const trimmed = link.trim().toLowerCase();

  // If banner explicitly links to a single product details page
  if (trimmed.startsWith('/product/') || trimmed.startsWith('product/')) {
    const slug = link.replace(/^\/?product\//i, '');
    return `/products/${encodeURIComponent(slug)}`;
  }

  // For all shop, category, and promo banners, link directly to /search (All Pieces)
  return '/search';
};

// ─── Skeleton Components for Progressive Loading ───────────────────────────
const ProductCardSkeleton = () => (
  <div className="flex flex-col bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs">
    <div className="aspect-[3/4] shimmer-bg" />
    <div className="p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="h-3.5 shimmer-bg rounded w-4/5" />
        <div className="h-3 shimmer-bg rounded w-3/5" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="h-4 shimmer-bg rounded w-16" />
        <div className="h-8 w-8 shimmer-bg rounded-lg" />
      </div>
    </div>
  </div>
);

const SectionSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="space-y-5 sm:space-y-6 animate-fadeIn">
    <div className="flex justify-between items-center pb-4 border-b border-border">
      <div className="space-y-1">
        <div className="h-3 shimmer-bg rounded w-24" />
        <div className="h-5 sm:h-6 shimmer-bg rounded w-36 sm:w-44" />
      </div>
      <div className="h-7 w-20 shimmer-bg rounded-full" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const BannerSkeleton = () => (
  <div className="relative overflow-hidden bg-muted/60 dark:bg-neutral-900/60 aspect-[2.2/1] sm:aspect-[2.5/1] md:aspect-[2.65/1] lg:aspect-[2.7/1] min-h-[150px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[340px] xl:min-h-[380px] max-h-[240px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[500px] w-full rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-none border border-border/40 shimmer-bg flex items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-1.5 opacity-40 text-muted-foreground select-none">
      <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-primary/70 animate-pulse" />
      <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-muted-foreground/80">
        Charulata
      </span>
    </div>
  </div>
);
// ─── END Skeleton Components ────────────────────────────────────────────────

interface HomeClientViewProps {
  initialData?: any;
}

export default function HomeClientView({ initialData }: HomeClientViewProps) {
  const [noteForm, setNoteForm] = useState({ name: '', email: '', message: '' });
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionErrorMsg, setSubscriptionErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const [testimonialsSwiper, setTestimonialsSwiper] = useState<any>(null);
  const { t, locale } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [subscribeNewsletter] = useSubscribeNewsletterMutation();
  const [submitContactForm] = useSubmitContactFormMutation();

  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
    setGuestWishlist(getGuestWishlist());
    const handleUpdate = () => setGuestWishlist(getGuestWishlist());
    window.addEventListener('guest_wishlist_updated', handleUpdate);
    return () => window.removeEventListener('guest_wishlist_updated', handleUpdate);
  }, []);

  const wishlistArray = useMemo(() => {
    if (!isAuthenticated) return guestWishlist;
    const serverArray = Array.isArray(wishlistResponse?.data?.products)
      ? wishlistResponse.data.products
      : Array.isArray(wishlistResponse?.products)
        ? wishlistResponse.products
        : Array.isArray(wishlistResponse?.data)
          ? wishlistResponse.data
          : Array.isArray(wishlistResponse)
            ? wishlistResponse
            : [];
    return serverArray.map((item: any) => (item._id || item.id || item)?.toString());
  }, [isAuthenticated, wishlistResponse, guestWishlist]);

  const handleWishlistToggle = async (productOrId: any) => {
    const productId = (typeof productOrId === 'object' ? (productOrId._id || productOrId.id) : productOrId)?.toString();

    if (!isAuthenticated) {
      const added = toggleGuestWishlist(productOrId);
      if (added) {
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
      } else {
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      }
      return;
    }

    const isInWishlist = wishlistArray.some((item: any) => item?.toString() === productId);
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId).unwrap();
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  // ─── COMBINED LANDING DATA: Prefer Server ISR initialData, fallback to RTK Query ─────
  const { data: landingResponse, isLoading: isLandingLoading } = useGetLandingDataQuery({}, {
    skip: !!initialData,
  });
  const landingData = initialData || landingResponse?.data || landingResponse;



  // Real-time Countdown timer for promo section (dynamically calculated from backend active campaign endDate)
  const activeCampaign = landingData?.campaign || null;

  const campaignImages = useMemo(() => {
    if (!activeCampaign) return [];
    if (Array.isArray(activeCampaign.images) && activeCampaign.images.length > 0) {
      return activeCampaign.images.filter(Boolean);
    }
    return [activeCampaign.bannerImage1, activeCampaign.bannerImage2].filter(Boolean) as string[];
  }, [activeCampaign]);

  const campaignTargetDate = useMemo(() => {
    if (activeCampaign?.endDate) {
      return new Date(activeCampaign.endDate);
    }
    return null;
  }, [activeCampaign]);

  const [campaignTimeLeft, setCampaignTimeLeft] = useState({ days: 4, hours: 12, minutes: 35, seconds: 53, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = campaignTargetDate ? campaignTargetDate.getTime() : (now + (4 * 24 * 60 * 60 + 12 * 60 * 60 + 35 * 60 + 53) * 1000);
      const difference = target - now;

      if (difference <= 0) {
        setCampaignTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCampaignTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [campaignTargetDate]);

  // Banners come strictly from the backend (admin > banners). No hardcoded fallback.
  const banners = useMemo(() => {
    return (Array.isArray(landingData?.banners) ? landingData.banners : [])
      .filter((b: any) => b && typeof b === 'object' && b.isActive !== false && (
        (typeof b.image === 'string' && b.image.trim() !== '') ||
        (typeof b.imageUrl === 'string' && b.imageUrl.trim() !== '') ||
        (typeof b.img === 'string' && b.img.trim() !== '')
      ));
  }, [landingData]);

  const categories = useMemo(() => {
    return landingData?.categories || [];
  }, [landingData?.categories]);

  const bestSellingProducts = useMemo(() =>
    (landingData?.bestSelling || []).slice(0, 12),
    [landingData?.bestSelling]
  );

  const newArrivalProducts = useMemo(() =>
    (landingData?.newArrivals || []).slice(0, 12),
    [landingData?.newArrivals]
  );



  // All Products: 10 cards → 2 clean rows of 5 on desktop
  const allProducts = useMemo(() =>
    (landingData?.allProducts || []).slice(0, 10),
    [landingData?.allProducts]
  );

  const isProductsLoading = !landingData && isLandingLoading;

  // Carousel State & Auto-Slide (every 6s) with pause on hover & touch swipe
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1 || isBannerPaused) return;
    const timer = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, isBannerPaused]);

  useEffect(() => {
    setAnimate(true);
  }, [currentSlide]);

  const handlePrevSlide = () => {
    if (banners.length <= 1) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
    }, 300);
  };

  const handleNextSlide = () => {
    if (banners.length <= 1) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      handleNextSlide();
    } else if (distance < -50) {
      handlePrevSlide();
    }
  };

  const approvedReviews = useMemo(() =>
    landingData?.reviews || [],
    [landingData?.reviews]
  );

  const dbTestimonials = useMemo(() => {
    if (!Array.isArray(approvedReviews) || approvedReviews.length === 0) return [];
    return approvedReviews.map((rev: any) => {
      const customerObj = typeof rev.customer === 'object' ? rev.customer : {};
      const productObj = typeof rev.product === 'object' ? rev.product : {};

      const authorName = customerObj?.name || (locale === 'bn' ? 'যাচাইকৃত কাস্টমার' : 'Verified Buyer');
      const productName = productObj?.title || (locale === 'bn' ? 'চারুলতা প্রোডাক্ট' : 'Charulata Product');
      const pSlug = productObj?.slug ? `/products/${productObj.slug}` : '/search';

      return {
        quote: rev.comment,
        author: authorName,
        role: `${productName} ${locale === 'bn' ? 'ক্রেতা' : 'Buyer'}`,
        productName: productName,
        productSlug: pSlug,
        rating: rev.rating || 5,
        profileImage: customerObj?.profileImage || ''
      };
    });
  }, [approvedReviews, locale]);

  // Testimonials come strictly from approved backend reviews. No hardcoded fallback.
  const slideItems = dbTestimonials;

  // Brand stats: only real numbers from the backend. Entries with no data are not shown.
  const { data: productCountResponse } = useGetProductsQuery({ limit: 1 });
  const brandStats = useMemo(() => {
    const totalProducts = Number(productCountResponse?.total ?? productCountResponse?.data?.total ?? 0);
    const parentCategoryCount = (Array.isArray(categories) ? categories : [])
      .filter((c: any) => c && (c.level === 0 || !c.parentCategory)).length;
    const reviewList: any[] = Array.isArray(approvedReviews) ? approvedReviews : [];
    const ratings = reviewList.map((r: any) => Number(r?.rating)).filter((n: number) => n > 0);
    const avgRating = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

    const stats: { key: string; value: number; decimals: number; suffix: string; label: string; icon: any }[] = [];
    if (totalProducts > 0) stats.push({ key: 'products', value: totalProducts, decimals: 0, suffix: '', label: locale === 'bn' ? 'পণ্য' : 'Products', icon: ShoppingBag });
    if (parentCategoryCount > 0) stats.push({ key: 'categories', value: parentCategoryCount, decimals: 0, suffix: '', label: locale === 'bn' ? 'ক্যাটাগরি' : 'Categories', icon: Sparkles });
    if (reviewList.length > 0) stats.push({ key: 'reviews', value: reviewList.length, decimals: 0, suffix: '', label: locale === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews', icon: Users });
    if (avgRating > 0) stats.push({ key: 'rating', value: avgRating, decimals: 1, suffix: ' ★', label: locale === 'bn' ? 'গড় রেটিং' : 'Average Rating', icon: Star });
    return stats;
  }, [productCountResponse, categories, approvedReviews, locale]);

  return (
    <div className="flex-1 w-full bg-background text-foreground font-sans relative">

      {/* 1. Hero Banner Slider */}
      <section className="w-full relative z-10 animate-fadeIn pt-1.5 sm:pt-2">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-3 sm:px-6 lg:px-10 xl:px-12">
          {isProductsLoading ? (
            <BannerSkeleton />
          ) : banners.length > 0 ? (
            <div 
              className="relative overflow-hidden bg-card aspect-[2.2/1] sm:aspect-[2.5/1] md:aspect-[2.65/1] lg:aspect-[2.7/1] min-h-[150px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[340px] xl:min-h-[380px] max-h-[240px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[500px] w-full rounded-xl sm:rounded-2xl lg:rounded-3xl group shadow-sm hover:shadow-md transition-shadow border border-border/40 select-none"
              onMouseEnter={() => setIsBannerPaused(true)}
              onMouseLeave={() => setIsBannerPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >

              {/* Slides with Premium Cross-Fade */}
              {banners.map((banner: any, idx: number) => {
                const isActive = idx === currentSlide;

                const rawTitle = (banner.title || '').trim();
                const rawSubtitle = (banner.subtitle || '').trim();
                const hasText = !!(rawTitle || rawSubtitle);

                const bannerLink = resolveBannerLink(banner.link);
                const ctaLabel = banner.buttonText || banner.ctaText || (locale === 'bn' ? 'শপ করুন' : 'Shop Now');
                const altText = rawTitle || banner.alt || (locale === 'bn' ? 'চারুলতা লাইফস্টাইল ব্যানার' : 'Charulata Lifestyle Banner');
                const bannerImg = banner.image || banner.imageUrl || banner.img;

                return (
                  <div
                    key={banner._id || idx}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-10 scale-100 pointer-events-none'
                    }`}
                  >
                    <Link 
                      href={bannerLink} 
                      className="block w-full h-full relative cursor-pointer group/banner"
                      aria-label={altText}
                    >
                      <Image
                        src={bannerImg}
                        alt={altText}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1536px) 1536px, 1680px"
                        quality={90}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover/banner:scale-[1.01]"
                      />

                      {hasText && (
                        <div className="absolute inset-0 z-20 flex items-center w-full h-full pointer-events-none">
                          <div className="pl-4 sm:pl-10 lg:pl-16 pr-4 sm:pr-10 w-full text-left">
                            <div 
                              className={`space-y-1.5 sm:space-y-3 transition-all duration-700 ease-out transform max-w-[280px] sm:max-w-md lg:max-w-lg p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-black/40 dark:bg-black/55 backdrop-blur-xs sm:backdrop-blur-sm border border-white/15 shadow-2xl ${
                                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                              }`}
                            >
                              {banner.badge && (
                                <div className="inline-flex items-center space-x-1.5 rounded-full bg-primary text-white px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-xs font-mono font-bold tracking-widest uppercase shadow-xs">
                                  <Sparkles size={11} className="animate-pulse" />
                                  <span>{banner.badge}</span>
                                </div>
                              )}

                              {rawTitle && (
                                <h1 className="hero-title-white text-base sm:text-2xl md:text-3xl lg:text-[34px] font-extrabold tracking-tight text-white font-serif leading-[1.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
                                  {rawTitle}
                                </h1>
                              )}

                              {rawSubtitle && (
                                <p className="hero-subtitle-white text-[10px] sm:text-xs md:text-sm text-white/95 font-medium line-clamp-2 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                  {rawSubtitle}
                                </p>
                              )}

                              <div className="pt-0.5 sm:pt-1">
                                <span className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-primary hover:bg-primary/90 text-white text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md">
                                  <span>{ctaLabel}</span>
                                  <ArrowRight size={13} className="stroke-[2.5]" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrevSlide();
                    }}
                    className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-primary border border-white/20 text-white hidden sm:flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={locale === 'bn' ? 'পূর্ববর্তী ব্যানার' : 'Previous banner'}
                  >
                    <ChevronLeft size={18} className="stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextSlide();
                    }}
                    className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-primary border border-white/20 text-white hidden sm:flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={locale === 'bn' ? 'পরবর্তী ব্যানার' : 'Next banner'}
                  >
                    <ChevronRight size={18} className="stroke-[2.5]" />
                  </button>
                </>
              )}

              {/* Slide Indicators */}
              {banners.length > 1 && (
                <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 sm:space-x-2 bg-black/40 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                  {banners.map((_: any, idx: number) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (currentSlide === idx) return;
                          setAnimate(false);
                          setTimeout(() => {
                            setCurrentSlide(idx);
                          }, 300);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                          isActive ? 'w-5 sm:w-7 bg-primary shadow-xs' : 'w-1.5 sm:w-2 bg-white/45 hover:bg-white/75'
                        }`}
                        aria-label={`${locale === 'bn' ? 'ব্যানার' : 'Slide'} ${idx + 1}`}
                        aria-current={isActive ? 'true' : 'false'}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* 2. Flash Sale Section */}
      <FlashSaleSection
        rawProducts={landingData?.flashSale}
        campaign={landingData?.campaign}
        wishlistArray={wishlistArray}
        onWishlistToggle={handleWishlistToggle}
      />

      {/* 3. Categories Section Grid */}
      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-12">
        <CategoryGrid categories={categories} />
      </div>

      {/* 4. Products Catalog Sections */}
      <section id="shop" className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-3 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-12 lg:py-14">
        {isProductsLoading ? (
          <div className="space-y-16 sm:space-y-20">
            <SectionSkeleton count={8} />
            <SectionSkeleton count={8} />
            <SectionSkeleton count={8} />
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* 4.2 Best Sellers Section (Slider) */}
            {bestSellingProducts.length > 0 && (
              <ProductSlider
                id="best-sellers"
                tag={t('home.bestSellersTag')}
                title={t('home.bestSellers')}
                icon={TrendingUp}
                viewMoreHref="/search?sort=rating-desc"
                viewMoreLabel={t('home.viewMore')}
                products={bestSellingProducts}
                wishlistArray={wishlistArray}
                onWishlistToggle={handleWishlistToggle}
                autoplayDelay={4500}
              />
            )}

            {/* 4.3 New Arrivals Section (Slider) */}
            {newArrivalProducts.length > 0 && (
              <ProductSlider
                id="new-arrivals"
                tag={t('home.newArrivalsTag')}
                title={t('home.newArrivals')}
                icon={Sparkles}
                viewMoreHref="/search?sort=newest"
                viewMoreLabel={t('home.viewMore')}
                products={newArrivalProducts}
                wishlistArray={wishlistArray}
                onWishlistToggle={handleWishlistToggle}
                autoplayDelay={5200}
              />
            )}

            {/* 4.4 All Pieces Section */}
            {allProducts.length > 0 && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                      <ShoppingBag size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-primary uppercase tracking-widest block">{t('home.allPiecesTag')}</span>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground font-serif mt-0.5 truncate">{t('home.allPieces')}</h3>
                    </div>
                  </div>
                  <Link href="/search" prefetch={false} className="shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link px-3 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                    <span>{t('home.viewMore')}</span>
                    <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-primary/30 via-border to-transparent mb-5 sm:mb-6" />
                <ProductGrid
                  products={allProducts}
                  wishlistArray={wishlistArray}
                  onWishlistToggle={handleWishlistToggle}
                  columns={5}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Countdown Promotional Festive Offer Section */}
      {activeCampaign && !campaignTimeLeft.isExpired && (
        <section className="w-full bg-muted/50 dark:bg-muted/30 py-16 sm:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 text-center lg:text-left">
              {activeCampaign.badgeText && (
                <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20">
                  {activeCampaign.badgeText}
                </span>
              )}

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-serif leading-tight">
                {activeCampaign.title}
              </h2>

              {activeCampaign.description && (
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {activeCampaign.description}
                </p>
              )}

              {/* Live Countdown Grid */}
              <div className="flex justify-center lg:justify-start gap-3 pt-3">
                {[
                  { label: locale === 'bn' ? 'দিন' : 'Days', val: campaignTimeLeft.days },
                  { label: locale === 'bn' ? 'ঘণ্টা' : 'Hrs', val: campaignTimeLeft.hours },
                  { label: locale === 'bn' ? 'মিনিট' : 'Mins', val: campaignTimeLeft.minutes },
                  { label: locale === 'bn' ? 'সেকেন্ড' : 'Secs', val: campaignTimeLeft.seconds }
                ].map((time, idx) => (
                  <div key={idx} className="bg-card border border-border/60 rounded-2xl px-4 py-2.5 text-center min-w-[65px] shadow-2xs">
                    <p className="text-lg font-black text-foreground font-mono">{String(time.val).padStart(2, '0')}</p>
                    <p className="text-[9px] text-primary uppercase font-extrabold tracking-wider mt-0.5">{time.label}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={activeCampaign.ctaLink || '/search'}
                  className="inline-flex items-center space-x-2 bg-primary hover:opacity-90 text-white text-xs font-extrabold px-6 py-3.5 rounded-xl transition shadow-md"
                >
                  <span>{activeCampaign.ctaText || (locale === 'bn' ? 'অফার প্রোডাক্টস দেখুন' : 'Shop Special Sale')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Swiper Image Carousel for Campaign Slider */}
            <div className="w-full relative min-h-[320px] flex items-center justify-center">
              {campaignImages.length === 0 ? null : campaignImages.length === 1 ? (
                <div className="aspect-[3/4] max-w-xs sm:max-w-sm mx-auto rounded-3xl overflow-hidden relative border border-border/50 shadow-xl group w-full">
                  <Image
                    src={campaignImages[0]}
                    alt={activeCampaign.title || "Campaign Featured"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="w-full relative px-1 sm:px-0">
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    loop={campaignImages.length > 2}
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: Math.min(campaignImages.length, 2), spaceBetween: 16 }
                    }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="w-full rounded-3xl p-1 pb-10! campaign-swiper"
                  >
                    {campaignImages.map((imgUrl: string, i: number) => (
                      <SwiperSlide key={i} className="pb-8">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden relative border border-border/50 shadow-md group hover:shadow-xl transition-all duration-500 bg-card">
                          <Image
                            src={imgUrl}
                            alt={`${activeCampaign.title || 'Campaign'} ${i + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-30 group-hover:opacity-75 transition-opacity duration-300" />
                          <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-extrabold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-between">
                            <span>{locale === 'bn' ? 'স্পেশাল কালেকশন' : 'Special Collection'}</span>
                            <Sparkles size={12} className="text-primary animate-pulse" />
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. Brand Stats Strip (real values from backend only; hidden when there is nothing to show) */}
      {brandStats.length > 0 && (
        <section className="w-full bg-muted/40 dark:bg-muted/20 py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[220px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className={`mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 grid grid-cols-2 ${brandStats.length >= 4 ? 'lg:grid-cols-4' : brandStats.length === 3 ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-6 relative z-10`}>
            {brandStats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="group relative p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-background shadow-2xs hover:shadow-md transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-2xs">
                    <StatIcon size={24} className="stroke-[2.2]" />
                  </div>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-serif tracking-tight group-hover:text-primary transition-colors">
                    {mounted ? (
                      <CountUp end={stat.value} decimals={stat.decimals} duration={2.5} enableScrollSpy scrollSpyOnce suffix={stat.suffix} />
                    ) : (
                      `${stat.value.toFixed(stat.decimals)}${stat.suffix}`
                    )}
                  </p>
                  <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors font-sans">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Testimonials Section */}
      {slideItems.length > 0 && (
      <section className="w-full bg-background py-20 overflow-hidden">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('home.testimonialsTag')}</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground font-serif mt-1">{t('home.testimonialsTitle')}</h2>
            </div>

            <div className="flex items-center justify-center space-x-3 mt-6 md:mt-0">
              <button
                onClick={() => testimonialsSwiper?.slidePrev()}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300 cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => testimonialsSwiper?.slideNext()}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300 cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {mounted ? (
            <Swiper
              modules={[Autoplay, Pagination]}
              onSwiper={setTestimonialsSwiper}
              spaceBetween={24}
              slidesPerView={1}
              loop={slideItems.length > 3}
              observer={true}
              observeParents={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="testimonials-swiper"
            >
              {slideItems.map((t: any, idx: number) => (
                <SwiperSlide key={idx} className="!h-auto">
                  <div className="h-full w-full bg-card/90 dark:bg-card/75 border border-border/70 hover:border-primary/50 p-6 sm:p-7 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between relative overflow-hidden backdrop-blur-md group">
                    <Quote size={76} className="absolute -bottom-3 -right-2 text-primary/5 group-hover:text-primary/12 transition-all duration-500 pointer-events-none stroke-[1]" />

                    <div className="space-y-4 flex-1 z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" className="stroke-amber-400" />
                          ))}
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 ml-0.5">
                            {(t.rating || 5).toFixed(1)}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={11} className="stroke-[2.5]" />
                          <span>{locale === 'bn' ? 'যাচাইকৃত কাস্টমার' : 'Verified Buyer'}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium pt-1">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-border/60 flex items-center gap-3.5 z-10">
                      {t.profileImage ? (
                        <Image src={t.profileImage} alt={t.author} width={44} height={44} className="w-11 h-11 rounded-full object-cover border-2 border-primary/40 shadow-xs shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-black text-sm shrink-0 border-2 border-primary/30 shadow-xs">
                          {t.author?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">{t.author}</p>
                        <Link
                          href={t.productSlug || '/search'}
                          prefetch={false}
                          className="inline-flex items-center space-x-1 text-[10px] text-primary hover:underline font-extrabold tracking-wide mt-0.5 max-w-full group/link"
                          title={locale === 'bn' ? 'প্রোডাক্ট বিস্তারিত দেখুন' : 'View Product Details'}
                        >
                          <span className="truncate">{t.role}</span>
                          <ExternalLink size={10} className="shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-primary" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {slideItems.slice(0, 3).map((t: any, idx: number) => (
                <div key={idx} className="bg-card/90 dark:bg-card/75 border border-border/70 hover:border-primary/50 p-6 sm:p-7 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden backdrop-blur-md group">
                  <Quote size={76} className="absolute -bottom-3 -right-2 text-primary/5 group-hover:text-primary/12 transition-all duration-500 pointer-events-none stroke-[1]" />
                  <div className="space-y-4 flex-1 z-10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" className="stroke-amber-400" />)}
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 ml-0.5">5.0</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} className="stroke-[2.5]" />
                        <span>{locale === 'bn' ? 'যাচাইকৃত কাস্টমার' : 'Verified Buyer'}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium pt-1">"{t.quote}"</p>
                  </div>
                  <div className="pt-4 mt-5 border-t border-border/60 flex items-center gap-3.5 z-10">
                    {t.profileImage ? (
                      <Image src={t.profileImage} alt={t.author} width={44} height={44} className="w-11 h-11 rounded-full object-cover border-2 border-primary/40 shadow-xs shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-black text-sm shrink-0 border-2 border-primary/30 shadow-xs">
                        {t.author?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">{t.author}</p>
                      <Link
                        href={t.productSlug || '/search'}
                        prefetch={false}
                        className="inline-flex items-center space-x-1 text-[10px] text-primary hover:underline font-extrabold tracking-wide mt-0.5 max-w-full group/link"
                        title={locale === 'bn' ? 'প্রোডাক্ট বিস্তারিত দেখুন' : 'View Product Details'}
                      >
                        <span className="truncate">{t.role}</span>
                        <ExternalLink size={10} className="shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-primary" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

    </div>
  );
}
