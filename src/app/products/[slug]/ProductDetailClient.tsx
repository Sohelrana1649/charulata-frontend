'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from '@/components/SafeImage';
import { 
  useGetProductBySlugQuery, 
  useGetProductReviewsQuery, 
  useSubmitReviewMutation,
  useGetProductsQuery
} from '@/store/api/productApi';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { addToGuestCart } from '@/utils/guestCart';
import { triggerFlyToCartAnimation } from '@/utils/cartAnimation';
import ProductDescription from '@/components/common/ProductDescription';
import { useAppSelector } from '@/store/hooks';
import { 
  ShoppingBag, 
  Loader2, 
  ArrowLeft, 
  Star, 
  Check, 
  Plus, 
  Minus, 
  AlertTriangle,
  Heart,
  Truck,
  Zap,
  Share2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  X,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  Video,
  Play
} from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';
import { getGuestWishlist, toggleGuestWishlist } from '@/utils/guestWishlist';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/store/api/userApi';
import { toast } from 'react-toastify';
import { fbEvent } from '@/components/analytics/FacebookPixel';
import { useTranslation } from '@/i18n/LanguageContext';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { t, locale } = useTranslation();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const { data: productResponse, isLoading, error } = useGetProductBySlugQuery(slug, {
    skip: !slug,
  });

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();

  const product = productResponse?.data?.product || productResponse?.data || productResponse;

  // Related products query based on category
  const categoryId = product?.category?._id || product?.category;
  const { data: relatedResponse } = useGetProductsQuery(
    { category: categoryId, limit: 5 },
    { skip: !categoryId }
  );

  const relatedProducts = (relatedResponse?.data?.products || relatedResponse?.products || relatedResponse?.data || [])
    .filter((p: any) => p._id !== product?._id)
    .slice(0, 4);

  // Reviews hooks & state
  const { data: reviewsResponse } = useGetProductReviewsQuery(product?._id, {
    skip: !product?._id,
  });
  const [submitReview, { isLoading: isSubmittingReview }] = useSubmitReviewMutation();

  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isCartBouncing, setIsCartBouncing] = useState<boolean>(false);

  const reviewsList = Array.isArray(reviewsResponse?.data?.reviews)
    ? reviewsResponse.data.reviews
    : Array.isArray(reviewsResponse?.reviews)
      ? reviewsResponse.reviews
      : Array.isArray(reviewsResponse?.data)
        ? reviewsResponse.data
        : [];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a review comment.');
      return;
    }
    try {
      await submitReview({
        product: product._id,
        rating: newRating,
        comment: newComment.trim(),
      }).unwrap();
      toast.success(
        locale === 'bn' 
          ? 'ধন্যবাদ! আপনার মূল্যবান মতামত ও রিভিউটি সফলভাবে জমা হয়েছে। ✨' 
          : 'Thank you! Your valuable feedback & review has been submitted successfully. ✨'
      );
      setNewComment('');
      setNewRating(5);
      setShowReviewForm(false);
    } catch (err: any) {
      console.error('Review submit error:', err);
      toast.error(err?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>('image');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const thumbScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbScrollRef.current) {
      const amount = direction === 'left' ? -180 : 180;
      thumbScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };
  const [thumbStartIndex, setThumbStartIndex] = useState<number>(0);
  const maxVisiblePhotos = 4;

  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  React.useEffect(() => {
    setGuestWishlist(getGuestWishlist());
    const handleUpdate = () => setGuestWishlist(getGuestWishlist());
    window.addEventListener('guest_wishlist_updated', handleUpdate);
    return () => window.removeEventListener('guest_wishlist_updated', handleUpdate);
  }, []);

  const wishlistArray = React.useMemo(() => {
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

  const isInWishlist = wishlistArray.some((itemId: string) => itemId === product?._id?.toString());

  const handleWishlistToggle = async () => {
    if (!isAuthenticated && product?._id) {
      const added = toggleGuestWishlist(product._id);
      if (added) {
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
      } else {
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      }
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product._id).unwrap();
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(product._id).unwrap();
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
      }
    } catch (err: any) {
      console.error('Wishlist toggle error:', err);
      toast.error(err?.data?.message || 'Failed to update wishlist. Please try again.');
    }
  };

  const handleShareProduct = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  // Find matching variant based on selected attributes / color / size
  // Helper to naturally sort attribute options from Smallest to Largest (e.g. 6GB, 8GB, 12GB or 128GB, 256GB, 512GB, 1TB)
  const sortAttributeOptions = React.useCallback((options: string[]): string[] => {
    if (!options || options.length <= 1) return options;
    const parseNum = (str: string): number => {
      const s = str.trim().toLowerCase();
      const numMatch = s.match(/([0-9\.]+)/);
      if (!numMatch) return NaN;
      let num = parseFloat(numMatch[1]);
      if (s.includes('tb')) num *= 1024;
      return num;
    };
    return [...options].sort((a, b) => {
      const numA = parseNum(a);
      const numB = parseNum(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, []);

  // Compile all effective attributes from product.attributes AND product.variants
  const effectiveAttributes = React.useMemo(() => {
    if (!product) return [];

    const attrMap: Record<string, Set<string>> = {};

    // 1. From product.attributes
    if (Array.isArray(product.attributes) && product.attributes.length > 0) {
      product.attributes.forEach((attr: any) => {
        if (attr.name && Array.isArray(attr.options)) {
          if (!attrMap[attr.name]) attrMap[attr.name] = new Set();
          attr.options.forEach((opt: string) => {
            if (opt) attrMap[attr.name].add(String(opt));
          });
        }
      });
    }

    // 2. From product.variants
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      product.variants.forEach((v: any) => {
        if (v.color) {
          if (!attrMap['Color']) attrMap['Color'] = new Set();
          attrMap['Color'].add(v.color);
        }
        if (v.size) {
          if (!attrMap['Size']) attrMap['Size'] = new Set();
          attrMap['Size'].add(v.size);
        }
        const vAttrs = v.attributes ? (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes) : {};
        if (vAttrs && typeof vAttrs === 'object') {
          Object.entries(vAttrs).forEach(([k, val]) => {
            if (k && val) {
              if (!attrMap[k]) attrMap[k] = new Set();
              attrMap[k].add(String(val));
            }
          });
        }
      });
    }

    // 3. Fallback for legacy colors / sizes
    if (!attrMap['Color'] && Array.isArray(product.colors) && product.colors.length > 0) {
      attrMap['Color'] = new Set(product.colors);
    }
    if (!attrMap['Size'] && Array.isArray(product.sizes) && product.sizes.length > 0) {
      attrMap['Size'] = new Set(product.sizes);
    }

    return Object.entries(attrMap).map(([name, optionsSet]) => ({
      name,
      options: sortAttributeOptions(Array.from(optionsSet))
    }));
  }, [product, sortAttributeOptions]);

  // Find matching variant based on selected attributes / color / size
  const matchedVariant = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    const targetAttrs: Record<string, string> = { ...selectedAttributes };
    if (selectedColor && !targetAttrs['Color']) targetAttrs['Color'] = selectedColor;
    if (selectedSize && !targetAttrs['Size']) targetAttrs['Size'] = selectedSize;

    const targetEntries = Object.entries(targetAttrs).filter(([_, v]) => Boolean(v));
    if (targetEntries.length === 0) return product.variants[0] || null;

    let bestVariant: any = null;
    let maxScore = -1;

    for (const v of product.variants) {
      const vAttrs = v.attributes ? (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes) : {};
      let matchCount = 0;
      let nonColorMatchCount = 0;
      let nonColorTotal = 0;
      let hasColorMismatch = false;

      for (const [key, val] of targetEntries) {
        const kLower = key.toLowerCase();
        let matched = false;

        if (kLower === 'color') {
          const vColor = v.color || vAttrs['Color'] || vAttrs['color'];
          if (vColor === val) {
            matched = true;
          } else if (vColor) {
            hasColorMismatch = true;
          }
        } else if (kLower === 'size') {
          nonColorTotal++;
          const vSize = v.size || vAttrs['Size'] || vAttrs['size'];
          if (vSize === val) {
            matched = true;
            nonColorMatchCount++;
          }
        } else {
          nonColorTotal++;
          if (vAttrs[key] === val || vAttrs[kLower] === val) {
            matched = true;
            nonColorMatchCount++;
          }
        }

        if (matched) matchCount++;
      }

      // 1. Perfect exact match on all attributes
      if (matchCount === targetEntries.length) {
        return v;
      }

      // 2. Score based on matching attributes (prefer exact non-color matches even if color differs)
      let score = matchCount * 10;
      if (nonColorTotal > 0 && nonColorMatchCount === nonColorTotal) {
        score += 50; // Huge boost if all non-color attributes (RAM, Storage, Size) match perfectly!
      }
      if (hasColorMismatch) {
        score -= 2;
      }

      if (score > maxScore && score > 0) {
        maxScore = score;
        bestVariant = v;
      }
    }

    return bestVariant;
  }, [product, selectedAttributes, selectedColor, selectedSize]);

  // Initialize selected values once product loads
  React.useEffect(() => {
    if (product) {
      const initialAttrs: Record<string, string> = {};
      
      if (effectiveAttributes.length > 0) {
        effectiveAttributes.forEach((attr: any) => {
          if (attr.options && attr.options.length > 0) {
            initialAttrs[attr.name] = attr.options[0];
          }
        });
        setSelectedAttributes(initialAttrs);
      }

      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      } else if (initialAttrs['Color']) {
        setSelectedColor(initialAttrs['Color']);
      }

      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else if (initialAttrs['Size']) {
        setSelectedSize(initialAttrs['Size']);
      }

      if (product.productImages?.length > 0) {
        setActiveImage(product.productImages[0]);
      }

      if (product.videoUrl) {
        setActiveMediaType('video');
      }

      if (product._id) {
        fbEvent('track', 'ViewContent', {
          content_ids: [product._id],
          content_type: 'product',
          content_name: product.title,
          value: product.price,
          currency: 'BDT'
        });
      }
    }
  }, [product, effectiveAttributes]);

  // Update active image if matching variant has a custom image
  React.useEffect(() => {
    if (matchedVariant?.image) {
      setActiveImage(matchedVariant.image);
    }
  }, [matchedVariant]);

  const handleSelectAttributeOption = (attrName: string, optionVal: string) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: optionVal }));
    if (attrName === 'Color') setSelectedColor(optionVal);
    if (attrName === 'Size') setSelectedSize(optionVal);
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 300);
      triggerFlyToCartAnimation(e.currentTarget as HTMLElement, product?.productImages?.[0]);
    }

    if (effectiveAttributes.length > 0) {
      for (const attr of effectiveAttributes) {
        if (!selectedAttributes[attr.name]) {
          toast.error(`Please select a ${attr.name}.`);
          return false;
        }
      }
    } else {
      if (!selectedColor && product.colors?.length > 0) {
        toast.error('Please select a color.');
        return false;
      }
      if (!selectedSize && product.sizes?.length > 0) {
        toast.error('Please select a size.');
        return false;
      }
    }

    const chosenColor = selectedColor || selectedAttributes['Color'] || undefined;
    const chosenSize = selectedSize || selectedAttributes['Size'] || undefined;
    const chosenAttrs = Object.keys(selectedAttributes).length > 0 ? selectedAttributes : undefined;

    const basePrice = Number(product?.price) || 0;
    const finalUnitPrice = matchedVariant?.price !== undefined && matchedVariant.price > 0 ? matchedVariant.price : basePrice;

    if (!isAuthenticated) {
      addToGuestCart(product, quantity, chosenColor, chosenSize, chosenAttrs, finalUnitPrice);
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Successfully added to your cart!');
      return true;
    }

    try {
      const payload = {
        product: product._id,
        quantity,
        color: chosenColor,
        size: chosenSize,
        selectedAttributes: chosenAttrs,
      };

      await addToCart(payload).unwrap();
      toast.success('Successfully added to your cart!');
      
      if (product._id) {
        fbEvent('track', 'AddToCart', {
          content_ids: [product._id],
          content_type: 'product',
          content_name: product.title,
          value: finalUnitPrice * quantity,
          currency: 'BDT',
          quantity: quantity
        });
      }
      return true;
    } catch (err: any) {
      console.error('Add to cart error:', err);
      toast.error(err?.data?.message || 'Failed to add item to cart. Please try again.');
      return false;
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success !== false) {
      router.push('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-9 w-9 animate-spin text-primary mr-2" />
        <span className="text-sm font-bold text-muted-foreground">{locale === 'bn' ? 'পণ্যের বিবরণ লোড হচ্ছে...' : 'Loading product details...'}</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] max-w-md mx-auto">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-foreground font-serif mb-2">{locale === 'bn' ? 'পণ্যটি খুঁজে পাওয়া যায়নি' : 'Product Not Found'}</h2>
        <p className="text-muted-foreground text-sm mb-6">{locale === 'bn' ? 'আপনি যে পণ্যটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।' : 'The product you are looking for does not exist or has been removed.'}</p>
        <Link href="/" className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-xs hover:bg-primary/90 transition">
          <ArrowLeft size={16} />
          <span>{locale === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
        </Link>
      </div>
    );
  }

  const basePrice = Number(product?.price) || 0;
  const currentRegularPrice = matchedVariant?.price !== undefined && matchedVariant.price > 0 ? matchedVariant.price : basePrice;
  const baseSalePrice = Number(product?.salePrice) || 0;
  const currentSalePrice = matchedVariant?.salePrice !== undefined && matchedVariant.salePrice > 0 ? matchedVariant.salePrice : baseSalePrice;
  const isDiscountExpired = product?.discountEndDate && new Date() > new Date(product.discountEndDate);
  const isSale = !isDiscountExpired && currentSalePrice > 0 && currentRegularPrice > 0 && currentSalePrice < currentRegularPrice;
  const discountPercent = isSale ? Math.floor(((currentRegularPrice - currentSalePrice) / currentRegularPrice) * 100) : 0;
  const finalUnitPrice = isSale ? currentSalePrice : currentRegularPrice;
  const price = currentRegularPrice;
  const salePrice = currentSalePrice;
  const mainImage = activeImage || matchedVariant?.image || product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';
  const categoryName = product?.category?.name || (typeof product?.category === 'string' ? product.category : 'Collection');

  const galleryImages = (product?.productImages && product.productImages.length > 0)
    ? product.productImages
    : [mainImage];
  const activeImageIndex = galleryImages.findIndex((img: string) => img === mainImage);

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx = activeImageIndex > 0 ? activeImageIndex - 1 : galleryImages.length - 1;
    setActiveImage(galleryImages[prevIdx]);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = activeImageIndex < galleryImages.length - 1 ? activeImageIndex + 1 : 0;
    setActiveImage(galleryImages[nextIdx]);
  };

  return (
    <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full py-4 sm:py-8 flex-1 space-y-8 sm:space-y-12">
      
      {/* Sleek Breadcrumb Navigation Bar */}
      <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-none py-1">
        <Link href="/" className="hover:text-primary font-bold transition flex items-center gap-1 shrink-0">
          <span>{locale === 'bn' ? 'হোম' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        <Link href="/search" className="hover:text-primary font-medium transition shrink-0">
          <span>{locale === 'bn' ? 'সংগ্রহ' : 'Collections'}</span>
        </Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        <span className="font-semibold text-primary capitalize shrink-0 truncate max-w-[120px] sm:max-w-[200px]">
          {categoryName}
        </span>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[260px]">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        {/* Left Gallery Column (lg:col-span-5 xl:col-span-5) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5 lg:sticky lg:top-24 max-w-md mx-auto lg:max-w-none w-full">
          <div 
            className="aspect-square sm:aspect-[4/5] max-h-[500px] sm:max-h-[550px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border/80 shadow-xs relative group cursor-pointer"
            onClick={() => {
              if (activeMediaType === 'image') setIsZoomed(!isZoomed);
            }}
          >
            {activeMediaType === 'video' && product.videoUrl ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center rounded-2xl overflow-hidden">
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center space-x-1.5 z-20 border border-white/20">
                  <Play size={12} className="fill-white" />
                  <span>{locale === 'bn' ? 'প্রোডাক্ট ভিডিও ডেমো' : 'Product Video Demo'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaType('image');
                  }}
                  className="absolute top-3 right-3 bg-black/80 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-20 flex items-center space-x-1.5 text-[11px] font-extrabold shadow-lg border border-white/20 active:scale-95"
                  title="Close Video (Back to Photos)"
                >
                  <X size={14} />
                  <span>{locale === 'bn' ? 'ছবিতে ফিরে যান' : 'Back to Photos'}</span>
                </button>
              </div>
            ) : (
              <>
                <Image 
                  src={mainImage} 
                  alt={`${product.title} - চারুলতা লাইফস্টাইল`} 
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-500 ease-out ${isZoomed ? 'scale-125' : 'group-hover:scale-105'}`} 
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-10">
                  {isSale && discountPercent > 0 && (
                    <span className="bg-rose-600 text-white font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-md">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                    <span className="bg-amber-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                      Only {product.stockQuantity} Left!
                    </span>
                  )}
                </div>

                {/* Angle Counter Badge */}
                {galleryImages.length > 1 && (
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 z-10 shadow-xs">
                    {activeImageIndex >= 0 ? activeImageIndex + 1 : 1} / {galleryImages.length}
                  </div>
                )}

                {/* Next / Prev Navigation Arrows Overlay */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary text-white p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-20 cursor-pointer active:scale-95 border border-white/20"
                      aria-label="Previous angle photo"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary text-white p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-20 cursor-pointer active:scale-95 border border-white/20"
                      aria-label="Next angle photo"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Bottom Actions Bar (Zoom, Video Demo & Lightbox) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none gap-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                      className="pointer-events-auto bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md border border-white/20 active:scale-95"
                    >
                      <Sparkles size={13} className="text-amber-400 shrink-0" />
                      <span>{isZoomed ? (locale === 'bn' ? 'জুম আউট' : 'Zoom Out') : (locale === 'bn' ? 'জুম করতে ক্লিক করুন' : 'Hover / Click to Zoom')}</span>
                    </button>

                    {product.videoUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMediaType('video');
                          setIsVideoModalOpen(true);
                        }}
                        className="pointer-events-auto bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-3.5 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-black transition flex items-center gap-1.5 cursor-pointer shadow-md border border-white/20 active:scale-95"
                      >
                        <Video size={13} className="fill-white text-white shrink-0" />
                        <span>{locale === 'bn' ? 'ভিডিও ডেমো দেখুন' : 'Watch Video Demo'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                    className="pointer-events-auto bg-black/70 hover:bg-primary text-white p-2 rounded-xl backdrop-blur-md text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow-md border border-white/20 active:scale-95"
                    title={locale === 'bn' ? 'ফুলস্ক্রিন গ্যালারি খুলুন' : 'Open Fullscreen Gallery'}
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Interactive Multi-Angle Thumbnails & Video Carousel */}
          {(galleryImages.length > 1 || product.videoUrl) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
                <span>Multi-Angle Photos ({galleryImages.length}) & Video</span>
                <span className="text-[10px] text-primary font-mono">Swipe or click angle</span>
              </div>

              <div className="flex items-center justify-between gap-3 w-full py-1 relative group/thumbrow">
                <div className="relative flex items-center flex-1 min-w-0">
                  {galleryImages.length > 3 && (
                    <button
                      type="button"
                      onClick={() => scrollThumbnails('left')}
                      className="absolute -left-2 z-20 p-1.5 bg-black/80 hover:bg-primary text-white rounded-full transition shadow-md border border-white/20 opacity-0 group-hover/thumbrow:opacity-100 hidden sm:flex items-center justify-center cursor-pointer active:scale-95"
                      title="Scroll left"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}

                  <div
                    ref={thumbScrollRef}
                    className="flex items-center space-x-2.5 overflow-x-auto py-2 px-1 no-scrollbar scrollbar-none flex-1 min-w-0 snap-x snap-mandatory scroll-smooth"
                  >
                    {galleryImages.map((img: string, idx: number) => {
                      const isActive = activeMediaType === 'image' && mainImage === img;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => {
                            setActiveMediaType('image');
                            setActiveImage(img);
                          }}
                          className={`w-20 h-20 sm:w-22 sm:h-22 aspect-square rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 relative shrink-0 snap-start bg-card ${
                            isActive 
                              ? 'border-primary ring-2 ring-primary/50 shadow-md scale-105 z-10' 
                              : 'border-border hover:border-primary/50 opacity-85 hover:opacity-100'
                          }`}
                        >
                          <Image src={img} alt={`${product.title} - Image ${idx + 1} | চারুলতা লাইফস্টাইল`} fill sizes="120px" className="object-cover" />
                          <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            #{idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {galleryImages.length > 3 && (
                    <button
                      type="button"
                      onClick={() => scrollThumbnails('right')}
                      className="absolute -right-2 z-20 p-1.5 bg-black/80 hover:bg-primary text-white rounded-full transition shadow-md border border-white/20 opacity-0 group-hover/thumbrow:opacity-100 hidden sm:flex items-center justify-center cursor-pointer active:scale-95"
                      title="Scroll right"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {product.videoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaType('video');
                    }}
                    className={`h-20 sm:h-22 w-24 sm:w-32 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 relative shrink-0 snap-start flex items-center justify-center ml-auto shadow-md group ${
                      activeMediaType === 'video'
                        ? 'border-rose-500 ring-2 ring-rose-500/60 scale-105 z-10'
                        : 'border-rose-500/50 hover:border-rose-500 opacity-95 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                    title="Play Product Marketing Video"
                  >
                    <video
                      src={product.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white font-mono text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center space-x-1 border border-white/20 z-10">
                      <Play size={9} className="fill-white text-white" />
                      <span>VIDEO</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Lightbox Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base font-serif text-white">{product.title}</h3>
                <p className="text-xs text-gray-400">Photo {activeImageIndex >= 0 ? activeImageIndex + 1 : 1} of {galleryImages.length}</p>
              </div>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 my-4 flex items-center justify-center">
              <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
                <Image
                  src={mainImage}
                  alt={`${product.title} - চারুলতা লাইফস্টাইল`}
                  fill
                  className="object-contain"
                />
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition cursor-pointer border border-white/20"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-primary text-white p-3 rounded-full backdrop-blur-md transition cursor-pointer border border-white/20"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center space-x-2.5 overflow-x-auto pt-2 border-t border-white/10">
                {galleryImages.map((img: string, idx: number) => {
                  const isActive = mainImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-14 sm:h-20 sm:w-16 rounded-xl overflow-hidden border transition-all relative shrink-0 ${
                        isActive ? 'border-primary ring-2 ring-primary scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.title} - View ${idx + 1} | Charulata Lifestyle`} fill sizes="80px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Video Popup Modal */}
        {isVideoModalOpen && product.videoUrl && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="w-full max-w-4xl flex items-center justify-between text-white border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Video size={20} className="text-rose-500 shrink-0" />
                <h3 className="font-extrabold text-sm sm:text-base font-serif text-white truncate max-w-md">
                  {product.title} - {locale === 'bn' ? 'প্রোডাক্ট ডেমো ও মার্কেটিং ভিডিও' : 'Product Demo & Marketing Video'}
                </h3>
              </div>

              <button
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setActiveMediaType('image');
                }}
                className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                aria-label="Close Video Popup"
                title="Close Video"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <p className="mt-3 text-xs text-gray-400 font-medium text-center">
              {locale === 'bn' ? 'ভিডিও বন্ধ করতে উপরের ✕ বাটনে ক্লিক করুন।' : 'Click the ✕ button above to close video and return to product photos.'}
            </p>
          </div>
        )}

        {/* Right Details Column - Amazon E-Commerce Typography Specs */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          
          {/* Top Category & Stock Badge Bar */}
          <div className="space-y-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 bg-muted text-muted-foreground font-normal uppercase tracking-wider rounded text-[11px]">
                {categoryName}
              </span>
              
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check size={12} />
                <span>In Stock</span>
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-lg sm:text-xl md:text-[22px] font-bold text-foreground font-sans leading-snug tracking-normal pt-1">
              {product.title}
            </h1>

            {/* Rating, Reviews & SKU Row */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-xs">
              {reviewsList.length > 0 || (product.ratings?.count > 0 && product.ratings?.average > 0) ? (
                <div className="flex items-center space-x-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={13} 
                        fill={i < Math.round(product.ratings?.average || 5) ? 'currentColor' : 'none'} 
                        className="stroke-amber-400"
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="font-normal text-primary hover:underline cursor-pointer"
                  >
                    {Number(product.ratings?.average || 5).toFixed(1)} ({reviewsList.length || product.ratings?.count} reviews)
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setActiveTab('reviews');
                    setShowReviewForm(true);
                  }}
                  className="text-xs font-normal text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Star size={13} className="fill-amber-400 stroke-amber-400" />
                  <span>{locale === 'bn' ? 'প্রথম রিভিউটি আপনি দিন' : 'Be the first to review'}</span>
                </button>
              )}

              <div className="flex items-center space-x-1.5 text-muted-foreground font-mono text-[11px]">
                <span>SKU: <strong className="text-foreground font-normal">{matchedVariant?.sku || product.sku}</strong></span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(matchedVariant?.sku || product.sku);
                    toast.success('SKU copied!');
                  }}
                  className="p-1 hover:text-primary transition cursor-pointer"
                  title="Copy SKU"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Amazon Pricing Specs: 24px-28px Regular Price, Line-through Original Price */}
          <div className="bg-muted/20 dark:bg-card/70 border border-border/70 p-3.5 sm:p-4 rounded-lg space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal uppercase tracking-wider block">Special Price</span>
            <div className="flex items-baseline space-x-2.5 flex-wrap gap-y-1">
              {isSale ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-500 font-sans tracking-tight">৳{salePrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground line-through font-normal">৳{currentRegularPrice.toLocaleString('en-IN')}</span>
                  <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs px-2 py-0.5 rounded border border-rose-500/20">
                    -{discountPercent}% (Save ৳{(currentRegularPrice - salePrice).toLocaleString('en-IN')})
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-foreground font-sans tracking-tight">৳{currentRegularPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-normal pt-0.5">
              Includes all taxes. Free 7-day hassle-free replacement.
            </p>
          </div>

          {/* User-Friendly Variant Selector: Compact Card Container with Color Swatches */}
          {effectiveAttributes && effectiveAttributes.length > 0 ? (
            <div className="bg-muted/20 dark:bg-card/70 border border-border/70 p-3.5 sm:p-4 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles size={12} className="text-rose-500" />
                  <span>Select Product Specifications & Options</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {Object.keys(selectedAttributes).length} option(s) selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {effectiveAttributes.map((attr: { name: string; options: string[] }) => {
                  const isColor = attr.name.toLowerCase() === 'color';
                  const getColorHex = (name: string) => {
                    const l = name.toLowerCase().trim();
                    const map: Record<string, string> = {
                      black: '#1a1a1a', white: '#ffffff', blue: '#2563eb', red: '#dc2626',
                      green: '#16a34a', yellow: '#eab308', grey: '#6b7280', gray: '#6b7280',
                      brown: '#78350f', navy: '#1e3a8a', pink: '#ec4899', purple: '#9333ea',
                      orange: '#ea580c', golden: '#d97706', gold: '#d97706', silver: '#cbd5e1',
                      maroon: '#800000', ash: '#9ca3af', coffee: '#451a03', cream: '#fef3c7', olive: '#65a30d'
                    };
                    return map[l] || null;
                  };

                  return (
                    <div key={attr.name} className="space-y-1.5 bg-card/80 p-2.5 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium text-[11px]">
                          {attr.name}: <strong className="font-extrabold text-foreground capitalize">{selectedAttributes[attr.name] || 'Select'}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {attr.options.map((opt: string) => {
                          const isSelected = selectedAttributes[attr.name] === opt;
                          const hex = isColor ? getColorHex(opt) : null;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectAttributeOption(attr.name, opt)}
                              className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border-2 border-rose-600 bg-rose-600 text-white font-extrabold shadow-xs scale-[1.02]'
                                  : 'border border-border bg-card text-foreground hover:border-rose-400 font-medium hover:bg-muted/40'
                              }`}
                            >
                              {hex && (
                                <span 
                                  className={`w-3 h-3 rounded-full border shrink-0 ${isSelected ? 'border-white' : 'border-black/20'}`} 
                                  style={{ backgroundColor: hex }} 
                                />
                              )}
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {product.colors?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground font-normal block">
                    Color: <span className="font-semibold text-foreground capitalize">{selectedColor || 'Select'}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => {
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3.5 py-1.5 rounded-md text-xs transition-all capitalize cursor-pointer ${
                            isSelected
                              ? 'border-2 border-rose-600 bg-rose-600 text-white font-bold shadow-xs'
                              : 'border border-border bg-card text-foreground hover:border-gray-400 font-normal'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground font-normal block">
                    Size / Length: <span className="font-semibold text-foreground">{selectedSize || 'Select'}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-rose-600 bg-rose-600 text-white font-bold shadow-xs'
                              : 'border border-border bg-card text-foreground hover:border-gray-400 font-normal'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center space-x-3 pt-2">
            <span className="text-xs font-bold text-foreground">Quantity:</span>
            <div className="flex items-center border border-primary/25 rounded-xl bg-card p-1 shadow-2xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                title="Decrease Quantity"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="w-8 text-center text-xs font-black text-foreground font-mono select-none">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 rounded-lg bg-primary text-white hover:bg-primary/90 border border-primary flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
                title="Increase Quantity"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Distinct Action CTA Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Buy Now (Primary Solid Red Action) */}
              <button
                onClick={handleBuyNow}
                disabled={isAdding}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-center space-x-2 shadow-md shadow-rose-600/20 cursor-pointer"
              >
                <Zap size={18} />
                <span>{locale === 'bn' ? 'সরাসরি অর্ডার করুন' : 'Buy Now'}</span>
              </button>

              {/* Add to Cart (Secondary Distinct Outline Action) */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full border-2 border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 bg-card py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-center space-x-2 cursor-pointer ${
                  isCartBouncing ? 'animate-cart-bounce' : ''
                }`}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>{locale === 'bn' ? 'যোগ হচ্ছে...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>{t('product.addToCart')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist || isRemovingFromWishlist}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-normal transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isInWishlist 
                    ? 'border-rose-300 bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} className={isInWishlist ? "stroke-rose-600" : "stroke-current"} />
                <span>{isInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={handleShareProduct}
                className="py-2 px-3 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-xs font-normal transition flex items-center space-x-1 cursor-pointer"
                title="Share Product Link"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Order Banner Card — Entire Box Clickable */}
          {(() => {
            const productName = product?.title || product?.name || 'N/A';
            const productSku = product?.sku || 'N/A';
            const productPrice = product?.salePrice || product?.price || 'N/A';
            const pageLink = typeof window !== 'undefined' ? window.location.href : '';

            const whatsappMessage = locale === 'bn'
              ? `হ্যালো চারুলতা, আমি এই প্রোডাক্টটি অর্ডার করতে চাই:\nপ্রোডাক্ট: ${productName}\nSKU: ${productSku}\nমূল্য: ৳${productPrice}\nলিংক: ${pageLink}`
              : `Hello Charulata, I want to order this product:\nProduct: ${productName}\nSKU: ${productSku}\nPrice: ৳${productPrice}\nLink: ${pageLink}`;

            return (
              <a 
                href={`https://wa.me/8801620556299?text=${encodeURIComponent(whatsappMessage)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 cursor-pointer group shadow-xs hover:shadow-md min-h-[44px]"
                title={locale === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার করুন' : 'Order via WhatsApp'}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                    <Image 
                      src="/auth/whatsapp.png" 
                      alt="WhatsApp Order" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5 leading-tight">
                      <span>{locale === 'bn' ? 'হোয়াটসঅ্যাপ অর্ডার' : 'WhatsApp Order'}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-black tracking-wide mt-0.5">
                      01620-556299
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </a>
            );
          })()}

          {/* Trust & Guarantee Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-muted/40 border border-border/60 p-3 rounded-xl flex items-start space-x-3 text-xs">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Truck size={16} />
              </div>
              <div>
                <p className="font-extrabold text-foreground">{locale === 'bn' ? 'ডেলিভারি চার্জ' : 'Fast Shipping'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dhaka: ৳60 | Outside: ৳120
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/60 p-3 rounded-xl flex items-start space-x-3 text-xs">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw size={16} />
              </div>
              <div>
                <p className="font-extrabold text-foreground">{locale === 'bn' ? 'ওয়ারেন্টি ও রিপ্লেসমেন্ট' : 'Easy Returns'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  7-Day Replacement
                </p>
              </div>
            </div>

            <div className="bg-muted/40 border border-border/60 p-3 rounded-xl flex items-start space-x-3 text-xs">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Award size={16} />
              </div>
              <div>
                <p className="font-extrabold text-foreground">{locale === 'bn' ? 'কোয়ালিটি প্রোডাক্ট' : 'Guaranteed Quality'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Guaranteed Quality Product
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Detailed Product Information Section */}
      <div className="border-t border-border pt-8 sm:pt-12">
        <div className="flex items-center space-x-4 border-b border-border overflow-x-auto scrollbar-none pb-0.5 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm font-extrabold transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'description'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('product.description')}
          </button>

          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-3 text-sm font-extrabold transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'specifications'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {locale === 'bn' ? 'স্পেসিফিকেশন ও তথ্য' : 'Specifications & Details'}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-extrabold transition cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('product.reviews')} ({reviewsList.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="space-y-4 max-w-4xl animate-in fade-in">
            <h3 className="text-base font-bold text-foreground font-sans">Product Description & Details</h3>
            <ProductDescription 
              html={product.description || (locale === 'bn' ? '<p>এই পণ্যের জন্য বিস্তারিত বিবরণ উপলব্ধ রয়েছে।</p>' : '<p>Premium quality Bangladeshi lifestyle product crafted with precision and care.</p>')} 
            />
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="space-y-4 max-w-3xl animate-in fade-in">
            <h3 className="text-base font-bold text-foreground font-sans">Product Specifications</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border text-xs">
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Category</span><span className="w-2/3 font-semibold text-foreground">{categoryName}</span></div>
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Product SKU</span><span className="w-2/3 font-mono font-semibold text-primary">{matchedVariant?.sku || product.sku}</span></div>
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Available Colors</span><span className="w-2/3 font-medium text-foreground">{product.colors?.join(', ') || selectedColor || 'Standard'}</span></div>
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Size / Length</span><span className="w-2/3 font-medium text-foreground">{product.sizes?.join(', ') || selectedSize || 'Standard Size'}</span></div>
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Care Instructions</span><span className="w-2/3 font-medium text-foreground">Dry Clean Recommended / Gentle Hand Wash</span></div>
              <div className="flex p-3.5"><span className="w-1/3 text-muted-foreground font-semibold uppercase">Origin</span><span className="w-2/3 font-medium text-foreground">Handcrafted in Bangladesh</span></div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground font-sans">{t('product.reviews')}</h3>
                <p className="text-xs text-muted-foreground">Read verified customer reviews or share your feedback.</p>
              </div>

              {!showReviewForm && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push(`/login?redirect=products/${slug}`);
                    } else {
                      setShowReviewForm(true);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-xs cursor-pointer"
                >
                  {t('product.writeReview')}
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl space-y-4">
                <h4 className="text-sm font-extrabold text-foreground">{t('product.writeReview')}</h4>
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('product.rating')}</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-amber-400 p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          size={22}
                          fill={star <= (hoverRating || newRating) ? 'currentColor' : 'none'}
                          className="stroke-amber-400"
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-foreground ml-2">{newRating} Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('product.yourReview')}</label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your honest thoughts about the fabric, color, quality, and fit..."
                    className="w-full p-3 rounded-xl border border-border bg-muted/30 text-foreground text-xs focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
                  >
                    {isSubmittingReview ? 'Submitting...' : t('product.submitReview')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-muted/80 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="bg-card border border-border p-5 rounded-2xl text-center space-y-1">
                <span className="text-4xl font-black text-foreground font-serif">{product.ratings?.average || 4.5}</span>
                <div className="flex justify-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(product.ratings?.average || 4.5) ? 'currentColor' : 'none'} className="stroke-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-semibold">Based on {reviewsList.length} reviews</p>
              </div>

              <div className="md:col-span-2 space-y-2 bg-card border border-border p-5 rounded-2xl">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter((r: any) => r.rating === stars).length;
                  const percentage = reviewsList.length ? Math.round((count / reviewsList.length) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-3 text-xs">
                      <span className="w-8 font-bold text-muted-foreground">{stars} ★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-10 text-right text-muted-foreground font-mono">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reviewsList.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground">No customer reviews submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {reviewsList.map((rev: any) => (
                  <div key={rev._id} className="p-4 bg-card border border-border rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{rev.customer?.name || 'Verified Buyer'}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? 'currentColor' : 'none'} className="stroke-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border pt-10 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-serif tracking-tight">
              {locale === 'bn' ? 'অনুরূপ পণ্যসমূহ' : 'You May Also Like'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === 'bn' ? 'একই কালেকশনের আরও চমৎকার পণ্যসমূহ দেখুন।' : 'Explore more products from the same collection.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {relatedProducts.map((rel: any) => (
              <ProductCard 
                key={rel._id} 
                product={rel} 
                isWishlisted={wishlistArray.some((id: string) => id === rel._id?.toString())}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
