'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import CountUp from 'react-countup';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductCard from '@/components/common/ProductCard';
import ProductSlider from '@/components/common/ProductSlider';
import { useGetLandingDataQuery } from '@/store/api/landingApi';
import { getGuestWishlist, toggleGuestWishlist } from '@/utils/guestWishlist';
import { toast } from 'react-toastify';
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
  Award,
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
  <div className="flex flex-col bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
    <div className="aspect-square shimmer-bg" />
    <div className="p-2.5 sm:p-3 space-y-2">
      <div className="h-3.5 shimmer-bg rounded w-3/4" />
      <div className="h-3 shimmer-bg rounded w-1/2" />
      <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
        <div className="h-4 shimmer-bg rounded w-16" />
        <div className="h-8 w-8 shimmer-bg rounded-lg" />
      </div>
    </div>
  </div>
);

const SectionSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-8 animate-fadeIn">
    <div className="flex justify-between items-end border-b border-border pb-4">
      <div className="space-y-2">
        <div className="h-3 shimmer-bg rounded w-24" />
        <div className="h-6 shimmer-bg rounded w-40" />
      </div>
      <div className="h-4 shimmer-bg rounded w-20" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const BannerSkeleton = () => (
  <div className="relative overflow-hidden bg-neutral-950 aspect-[2.4/1] sm:aspect-[2.8/1] lg:aspect-[3.2/1] min-h-[200px] max-h-[320px] sm:max-h-[400px] lg:max-h-[460px] w-full rounded-[2px] shadow-none border-0">
    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800" />
    <div className="absolute inset-0 flex items-center">
      <div className="mx-auto max-w-7xl pl-16 sm:pl-24 lg:pl-28 pr-16 sm:pr-24 w-full space-y-4">
        <div className="h-5 bg-white/10 rounded-full w-32 shimmer-bg" style={{ opacity: 0.2 }} />
        <div className="h-8 sm:h-10 bg-white/10 rounded w-80 max-w-full shimmer-bg" style={{ opacity: 0.2 }} />
        <div className="h-4 bg-white/10 rounded w-60 max-w-full shimmer-bg" style={{ opacity: 0.2 }} />
        <div className="h-9 sm:h-11 bg-white/10 rounded-xl w-36 shimmer-bg" style={{ opacity: 0.2 }} />
      </div>
    </div>
  </div>
);
// ─── END Skeleton Components ────────────────────────────────────────────────

export default function HomePage() {
  // Tabs removed for scroll layout
  const [noteForm, setNoteForm] = useState({ name: '', email: '', message: '' });
  const [emailInput, setEmailInput] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionErrorMsg, setSubscriptionErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);
  const [testimonialsSwiper, setTestimonialsSwiper] = useState<any>(null);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslation();

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const { scrollLeft, clientWidth } = categoryScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      categoryScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();
  const [submitContactForm, { isLoading: isSendingNote }] = useSubmitContactFormMutation();

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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyDesign = useCallback((id: string, slug: string) => {
    const link = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const [noteSubmitted, setNoteSubmitted] = useState(false);

  // ─── SINGLE COMBINED LANDING DATA QUERY ─────
  const { data: landingResponse, isLoading: isLandingLoading } = useGetLandingDataQuery({});
  const landingData = landingResponse?.data;

  // Helper to convert numbers to Bangla digits for super clear user-friendly display
  const toBanglaDigits = (num: number): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).padStart(2, '0').replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
  };

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateFlashSaleTime = () => {
      const now = Date.now();
      const rawFlashSale = landingData?.flashSale || [];

      // 1. Find all active FUTURE discountEndDate timestamps (sorted ascending: shortest remaining time first)
      const futureDates = rawFlashSale
        .map((p: any) => p.discountEndDate ? new Date(p.discountEndDate).getTime() : null)
        .filter((t: number | null): t is number => t !== null && !isNaN(t) && t > now)
        .sort((a: number, b: number) => a - b);

      let targetTime: number | null = null;

      if (futureDates.length > 0) {
        // Target the product with the earliest expiring flash sale
        targetTime = futureDates[0];
      } else if (landingData?.campaign?.endDate) {
        const campaignTime = new Date(landingData.campaign.endDate).getTime();
        if (campaignTime > now) {
          targetTime = campaignTime;
        }
      }

      if (!targetTime) {
        // Default fallback if no future discountEndDate set: End of current day (23:59:59)
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        targetTime = endOfToday.getTime();
      }

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const totalHours = days * 24 + hours;

      setTimeLeft({ hours: totalHours, minutes, seconds });
    };

    calculateFlashSaleTime();
    const interval = setInterval(calculateFlashSaleTime, 1000);
    return () => clearInterval(interval);
  }, [landingData]);

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

  const DEFAULT_BANNERS = React.useMemo(() => [
    {
      _id: "6a325e753cbc95710761451d",
      title: "Premium Fashion Collection 2026",
      subtitle: "COLLECTION 2026",
      image: "https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider_eezplq.jpg",
      link: "/shop"
    },
    {
      _id: "6a325e753cbc95710761451e",
      title: "Exclusive Ladies Collection - New Arrival",
      subtitle: "NEW ARRIVALS",
      image: "https://res.cloudinary.com/dau8sazoh/image/upload/v1781661675/Font_slider_diptia.jpg",
      link: "/category/women-fashion"
    },
    {
      _id: "6a325e763cbc95710761451f",
      title: "Best Deals & Trending Styles",
      subtitle: "EXCLUSIVES",
      image: "https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider2_poppa5.jpg",
      link: "/offers"
    }
  ], []);

  // Extract data from combined response, with fallback defaults

  const banners = useMemo(() => {
    const raw = landingData?.banners || [];
    return raw.length > 0 ? raw : DEFAULT_BANNERS;
  }, [landingData?.banners, DEFAULT_BANNERS]);

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

  const [nowTime, setNowTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = useMemo(() =>
    (landingData?.flashSale || [])
      .filter((p: any) => {
        if (!p.discountEndDate) return true;
        const endTime = new Date(p.discountEndDate).getTime();
        return !isNaN(endTime) && endTime > nowTime;
      })
      .slice(0, 10),
    [landingData?.flashSale, nowTime]
  );

  const allProducts = useMemo(() =>
    (landingData?.allProducts || []).slice(0, 15),
    [landingData?.allProducts]
  );

  const isProductsLoading = isLandingLoading && !landingData;
  // Carousel State & Auto-Slide (every 6s)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

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

  const approvedReviews = useMemo(() =>
    landingData?.reviews || [],
    [landingData?.reviews]
  );

  const staticTestimonials = [
    {
      quote: "Handmade Jamdani Saree-r color ebong texture visual image thikeo khub shundor. Fast delivery and original product!",
      author: "Sabrina Rahman",
      role: "Jamdani & Silk Sarees Buyer",
      productName: "Jamdani & Silk Sarees",
      productSlug: "jamdani-silk-sarees",
      profileImage: ""
    },
    {
      quote: "Designer Linen Kurti - exact fit and high quality stitching. Dhaka city-te 1 day-er vitor delivery peyechi!",
      author: "Sadia Islam",
      role: "Designer Kurtis Buyer",
      productName: "Designer Kurtis",
      productSlug: "designer-kurtis",
      profileImage: ""
    },
    {
      quote: "Royal Panjabi fabrics finish is extremely luxury. Authentic Charulata collection & hassle free checkout!",
      author: "Nabila Tabassum",
      role: "Premium Panjabis Buyer",
      productName: "Premium Panjabis",
      productSlug: "panjabi",
      profileImage: ""
    }
  ];

  const testimonials = approvedReviews.length > 0
    ? approvedReviews.map((rev: any) => ({
      quote: rev.comment,
      author: rev.customer?.name || "Verified Buyer",
      role: rev.product?.title ? `${rev.product.title} Buyer` : "Verified Buyer",
      productName: rev.product?.title || "",
      productSlug: rev.product?.slug || "",
      profileImage: rev.customer?.profileImage || ""
    }))
    : staticTestimonials;

  const slideItems = testimonials.length > 0
    ? (testimonials.length <= 4 ? [...testimonials, ...testimonials, ...testimonials] : testimonials)
    : [];

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteForm.name && noteForm.email && noteForm.message) {
      try {
        await submitContactForm(noteForm).unwrap();
        setNoteSubmitted(true);
        setNoteForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setNoteSubmitted(false);
        }, 5000);
      } catch (err) {
        console.error('Failed to send contact note:', err);
      }
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      try {
        await subscribeNewsletter(emailInput).unwrap();
        setSubscriptionSuccess(true);
        setSubscriptionErrorMsg('');
        setEmailInput('');
        setTimeout(() => {
          setSubscriptionSuccess(false);
        }, 5000);
      } catch (err: any) {
        console.error('Failed to subscribe:', err);
        setSubscriptionErrorMsg(err?.data?.message || 'Failed to subscribe. Please try again.');
        setTimeout(() => {
          setSubscriptionErrorMsg('');
        }, 5000);
      }
    }
  };

  return (
    <div className="flex-1 w-full bg-background text-foreground font-sans relative">

      {/* 1. Hero Banner Slider - Containerized Floating Card Layout */}
      <section className="w-full relative z-10 animate-fadeIn pt-1.5 sm:pt-2">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
          {isLandingLoading && !landingData ? (
            <BannerSkeleton />
          ) : (
            <div className="relative overflow-hidden bg-neutral-950 aspect-[2.4/1] sm:aspect-[2.8/1] lg:aspect-[3.2/1] min-h-[200px] max-h-[320px] sm:max-h-[400px] lg:max-h-[460px] w-full rounded-[2px] group shadow-none border-0">

              {/* Slides with Premium Cross-Fade */}
              {banners.map((banner: any, idx: number) => {
                const isActive = idx === currentSlide;

                // Intelligently parse long titles into headline + description to avoid crowded paragraphs
                const rawTitle = banner.title || "Exclusive Collection";
                const hasDot = rawTitle.includes('.');
                const isTitleTooLong = rawTitle.length > 40;

                const displayTitle = (isTitleTooLong && hasDot)
                  ? rawTitle.split('.')[0].trim()
                  : (isTitleTooLong ? `${rawTitle.slice(0, 42)}...` : rawTitle);

                const displayDesc = (isTitleTooLong && hasDot)
                  ? (banner.subtitle && banner.subtitle !== "Best Deals & Trending Styles" ? banner.subtitle : rawTitle.split('.').slice(1).join('.').trim())
                  : (banner.subtitle || "Discover handcrafted traditional sarees, designer panjabis, and premium lifestyle accessories.");

                return (
                  <div
                    key={banner._id || idx}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-10 scale-[1.01] pointer-events-none'
                      }`}
                  >
                    {/* Slide Image with slow Ken Burns effect */}
                    <Image
                      src={banner.image || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600"}
                      alt={displayTitle}
                      fill
                      priority={idx === 0}
                      sizes="100vw"
                      className={`object-cover transition-transform duration-[4000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'
                        }`}
                    />

                    {/* Slide Content Overlaid on top with soft subtle vignette mask */}
                    <div className="absolute inset-0 z-20 flex items-center bg-gradient-to-r from-black/75 via-black/25 to-transparent w-full h-full">
                      {/* Generous Left Padding (pl-14 sm:pl-20 lg:pl-28) to ensure text NEVER overlaps left arrow button */}
                      <div className="pl-14 sm:pl-20 lg:pl-28 pr-12 sm:pr-16 w-full text-left">
                        <div className={`space-y-2 sm:space-y-3.5 transition-all duration-[800ms] delay-200 ease-out transform max-w-lg sm:max-w-xl ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                          }`}>
                          <div className="inline-flex items-center space-x-1.5 rounded-full bg-primary/20 text-[#e6ca65] border border-primary/30 px-3 py-0.5 text-[9px] sm:text-xs font-mono font-bold tracking-widest backdrop-blur-md uppercase">
                            <Sparkles size={11} className="animate-pulse" />
                            <span>EXPORT QUALITY · CHARULATA</span>
                          </div>

                          <h1 className="hero-title-white text-xl sm:text-3xl lg:text-[40px] font-extrabold tracking-tight text-white font-serif leading-[1.18] drop-shadow-md line-clamp-2">
                            {displayTitle}
                          </h1>

                          <p className="hero-subtitle-white text-[11px] sm:text-xs md:text-sm text-gray-200/90 font-medium line-clamp-2 max-w-md leading-relaxed">
                            {displayDesc}
                          </p>

                          <div className="pt-1 sm:pt-2">
                            <Link
                              href={resolveBannerLink(banner.link)}
                              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-[#b0842e] hover:from-[#b0842e] hover:to-primary text-white text-xs sm:text-sm font-black uppercase tracking-wider px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-primary/30 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <span>{locale === 'bn' ? 'শপ করুন' : 'Shop Now'}</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows (Positioned safely on outer edges with z-30) */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-2.5 sm:left-5 top-1/2 transform -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-primary border border-white/20 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xl hover:scale-110 active:scale-95 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Previous banner"
                  >
                    <ChevronLeft size={18} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-2.5 sm:right-5 top-1/2 transform -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-primary border border-white/20 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-xl hover:scale-110 active:scale-95 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Next banner"
                  >
                    <ChevronRight size={18} className="stroke-[2.5]" />
                  </button>
                </>
              )}

              {/* Slide Indicators - Hidden on mobile for clean UI */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 hidden sm:flex items-center space-x-2 bg-black/35 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                  {banners.map((_: any, idx: number) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (currentSlide === idx) return;
                          setAnimate(false);
                          setTimeout(() => {
                            setCurrentSlide(idx);
                          }, 300);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${isActive ? 'w-7 bg-primary shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Flash Sale Section (Positioned ABOVE Category Grid for maximum focus) */}
      {flashSaleProducts.length > 0 && (
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 pt-8 sm:pt-12">
          <div id="flash-sale-section" className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-destructive uppercase tracking-widest bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 rounded-md">
                    {t('home.flashSaleTag')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <h3 className="text-xl sm:text-3xl font-extrabold text-foreground font-serif">{t('home.flashSale')}</h3>

                  {/* User-Friendly Live Digital Countdown Box */}
                  <div className="flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                    <span className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-primary tracking-wider">
                      <Clock size={16} className="animate-pulse text-primary shrink-0" />
                      <span>{locale === 'bn' ? 'সময় বাকি:' : 'Ends in:'}</span>
                    </span>

                    <div className="flex items-center space-x-1.5 font-bold">
                      <div className="flex items-center space-x-1">
                        <span className="bg-primary text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg shadow-xs font-mono">
                          {locale === 'bn' ? toBanglaDigits(timeLeft.hours) : String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-primary">
                          {locale === 'bn' ? 'ঘণ্টা' : 'Hours'}
                        </span>
                      </div>

                      <span className="text-primary font-bold text-xs sm:text-sm">:</span>

                      <div className="flex items-center space-x-1">
                        <span className="bg-primary text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg shadow-xs font-mono">
                          {locale === 'bn' ? toBanglaDigits(timeLeft.minutes) : String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-primary">
                          {locale === 'bn' ? 'মিনিট' : 'Mins'}
                        </span>
                      </div>

                      <span className="text-primary font-bold text-xs sm:text-sm">:</span>

                      <div className="flex items-center space-x-1">
                        <span className="bg-primary text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg shadow-xs font-mono">
                          {locale === 'bn' ? toBanglaDigits(timeLeft.seconds) : String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-primary">
                          {locale === 'bn' ? 'সেকেন্ড' : 'Secs'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/search" prefetch={false} className="text-xs sm:text-sm font-extrabold text-primary hover:underline flex items-center space-x-1 shrink-0">
                <span>{t('home.viewMore')}</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <ProductSlider
              products={flashSaleProducts}
              wishlistArray={wishlistArray}
              onWishlistToggle={handleWishlistToggle}
            />
          </div>
        </div>
      )}

      {/* 3. Categories Section Grid */}
      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-12">
        <CategoryGrid categories={categories} />
      </div>

      {/* 4. Products Catalog Sections */}
      <section id="shop" className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-12">
        {isProductsLoading ? (
          /* Progressive Skeleton Loading — shows structure immediately */
          <div className="space-y-24">
            <SectionSkeleton count={5} />
            <SectionSkeleton count={5} />
            <SectionSkeleton count={5} />
          </div>
        ) : (
          <div className="space-y-24">
            {/* 4.2 Best Sellers Section */}
            {bestSellingProducts.length > 0 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#c99a3c] uppercase tracking-widest">{t('home.bestSellersTag')}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif mt-1">{t('home.bestSellers')}</h3>
                  </div>
                  <Link href="/search?sort=rating-desc" prefetch={false} className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
                    <span>{t('home.viewMore')}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <ProductSlider
                  products={bestSellingProducts}
                  wishlistArray={wishlistArray}
                  onWishlistToggle={handleWishlistToggle}
                />
              </div>
            )}

            {/* 4.3 New Arrivals Section */}
            {newArrivalProducts.length > 0 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#c99a3c] uppercase tracking-widest">{t('home.newArrivalsTag')}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif mt-1">{t('home.newArrivals')}</h3>
                  </div>
                  <Link href="/search?sort=newest" prefetch={false} className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
                    <span>{t('home.viewMore')}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <ProductSlider
                  products={newArrivalProducts}
                  wishlistArray={wishlistArray}
                  onWishlistToggle={handleWishlistToggle}
                />
              </div>
            )}

            {/* 4.4 All Pieces Section */}
            {allProducts.length > 0 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#c99a3c] uppercase tracking-widest">{t('home.allPiecesTag')}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground font-serif mt-1">{t('home.allPieces')}</h3>
                  </div>
                  <Link href="/search" prefetch={false} className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
                    <span>{t('home.viewMore')}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
                <ProductSlider
                  products={allProducts}
                  wishlistArray={wishlistArray}
                  onWishlistToggle={handleWishlistToggle}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. Countdown Promotional Festive Offer Section (Dynamic from Admin Backend Campaign — strictly 0 mock data) */}
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

      {/* 2. Brand Stats Strip (Seamless Integrated Luxury Cards) */}
      <section className="w-full bg-muted/40 dark:bg-muted/20 py-12 sm:py-16 relative overflow-hidden">
        {/* Subtle Ambient Glow Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[220px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">

          {/* 1. 500+ Happy Clients */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-background shadow-2xs hover:shadow-md transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Top Accent Gradient Border on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Users size={24} className="stroke-[2.2]" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-serif tracking-tight group-hover:text-primary transition-colors">
              {mounted ? (
                <CountUp end={500} duration={2.5} enableScrollSpy scrollSpyOnce suffix="+" />
              ) : (
                "500+"
              )}
            </p>
            <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors font-sans">
              {locale === 'bn' ? 'সন্তুষ্ট গ্রাহক' : 'Happy Clients'}
            </p>
          </div>

          {/* 2. 2+ Years of Craft */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-background shadow-2xs hover:shadow-md transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Top Accent Gradient Border on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Award size={24} className="stroke-[2.2]" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-serif tracking-tight group-hover:text-primary transition-colors">
              {mounted ? (
                <CountUp end={2} duration={2.5} enableScrollSpy scrollSpyOnce suffix="+" />
              ) : (
                "2+"
              )}
            </p>
            <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors font-sans">
              {locale === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years of Craft'}
            </p>
          </div>

          {/* 3. 10+ Delivery Hubs */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-background shadow-2xs hover:shadow-md transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Top Accent Gradient Border on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Truck size={24} className="stroke-[2.2]" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-serif tracking-tight group-hover:text-primary transition-colors">
              {mounted ? (
                <CountUp end={10} duration={2.5} enableScrollSpy scrollSpyOnce suffix="+" />
              ) : (
                "10+"
              )}
            </p>
            <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors font-sans">
              {locale === 'bn' ? 'ডেলিভারি হাব' : 'Delivery Hubs'}
            </p>
          </div>

          {/* 4. 5.0 ★ Top Rating */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-background shadow-2xs hover:shadow-md transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Top Accent Gradient Border on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-amber-400 group-hover:text-white transition-all duration-300 shadow-2xs">
              <Star size={24} className="fill-amber-400 group-hover:fill-white stroke-[2]" />
            </div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-serif tracking-tight group-hover:text-primary transition-colors">
              {mounted ? (
                <CountUp end={5.0} decimals={1} duration={2.5} enableScrollSpy scrollSpyOnce suffix=" ★" />
              ) : (
                "5.0 ★"
              )}
            </p>
            <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest mt-2 group-hover:text-foreground transition-colors font-sans">
              {locale === 'bn' ? 'সেরা রেটিং' : 'Top Rating'}
            </p>
          </div>

        </div>
      </section>

      {/* 6. Testimonials / Customer Reviews Section */}
      <section className="w-full bg-background py-20 overflow-hidden">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('home.testimonialsTag')}</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground font-serif mt-1">{t('home.testimonialsTitle')}</h2>
            </div>

            {/* Custom Navigation Arrows */}
            <div className="flex items-center justify-center space-x-3 mt-6 md:mt-0">
              <button
                onClick={() => testimonialsSwiper?.slidePrev()}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => testimonialsSwiper?.slideNext()}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
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
              loop={true}
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
                    {/* Decorative Background Quote Watermark */}
                    <Quote size={76} className="absolute -bottom-3 -right-2 text-primary/5 group-hover:text-primary/12 transition-all duration-500 pointer-events-none stroke-[1]" />

                    <div className="space-y-4 flex-1 z-10">
                      {/* Rating + Verified Badge Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" className="stroke-amber-400" />
                          ))}
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 ml-0.5">5.0</span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={11} className="stroke-[2.5]" />
                          <span>{locale === 'bn' ? 'যাচাইকৃত কাস্টমার' : 'Verified Buyer'}</span>
                        </span>
                      </div>

                      {/* Customer Review Quote */}
                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium pt-1 line-clamp-3">
                        "{t.quote}"
                      </p>
                    </div>

                    {/* Customer Author Footer */}
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
                          href={t.productSlug ? `/products/${t.productSlug}` : '/search'}
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
              {testimonials.slice(0, 3).map((t: any, idx: number) => (
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
                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-medium pt-1 line-clamp-3">"{t.quote}"</p>
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
                        href={t.productSlug ? `/products/${t.productSlug}` : '/search'}
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









    </div>
  );
}
