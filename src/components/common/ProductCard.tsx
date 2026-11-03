'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from '@/components/SafeImage';
import { Heart, Star, ShoppingCart, ArrowRight, Clock, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { addToGuestCart } from '@/utils/guestCart';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'react-toastify';
import { triggerFlyToCartAnimation } from '@/utils/cartAnimation';
import { fbEvent, getCatalogProductId } from '@/components/analytics/FacebookPixel';
import { toggleGuestWishlist, isProductInGuestWishlist } from '@/utils/guestWishlist';
import { useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/store/api/userApi';

import { getStockStatus } from '@/utils/stock';

interface ProductCardProps {
  product: any;
  isWishlisted?: boolean;
  onWishlistToggle?: (productOrId: any) => void;
}

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }: ProductCardProps) {
  const { locale } = useTranslation();
  const router = useRouter();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [internalWishlisted, setInternalWishlisted] = useState(false);

  // If onWishlistToggle is not passed, use internal guest/server wishlisted state
  const effectiveIsWishlisted = onWishlistToggle ? isWishlisted : (isWishlisted || internalWishlisted);

  React.useEffect(() => {
    if (!onWishlistToggle && product?._id) {
      setInternalWishlisted(isProductInGuestWishlist(product._id));
      const handleUpdate = () => setInternalWishlisted(isProductInGuestWishlist(product._id));
      window.addEventListener('guest_wishlist_updated', handleUpdate);
      return () => window.removeEventListener('guest_wishlist_updated', handleUpdate);
    }
  }, [onWishlistToggle, product?._id]);

  // Prevent duplicate rapid clicks
  const cartClickRef = useRef(false);
  const wishlistClickRef = useRef(false);

  const [now] = useState(() => Date.now());
  const price = Number(product?.price) || 0;
  const salePrice = Number(product?.salePrice) || 0;
  const isDiscountStarted = !product?.discountStartDate || new Date(product.discountStartDate).getTime() <= now;
  const isDiscountExpired = product?.discountEndDate && new Date(product.discountEndDate).getTime() <= now;
  const isSale = isDiscountStarted && !isDiscountExpired && salePrice > 0 && price > 0 && salePrice < price;
  const discountPercent = isSale ? Math.round(((price - salePrice) / price) * 100) : 0;
  const categoryName = product?.category?.name || (typeof product?.category === 'string' ? product.category : '');
  const productAlt = `${product?.title || 'Product'}${categoryName ? ` - ${categoryName}` : ''} | চারুলতা লাইফস্টাইল (Charulata Lifestyle)`;

  const img = (Array.isArray(product?.productImages) ? product.productImages : [])
    .concat(Array.isArray(product?.images) ? product.images : [])
    .concat(product?.image ? [product.image] : [])
    .find((src: any) => typeof src === 'string' && src.trim() !== '') || '';

  // Helper to convert numbers to Bangla digits
  const toBanglaDigits = (num: number): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
  };

  // Individual Product Flash Sale Time Remaining Helper
  const getProductTimeLeftText = (endDateStr?: string, currentTimestamp?: number) => {
    if (!endDateStr || !currentTimestamp) return null;
    const end = new Date(endDateStr).getTime();
    const diff = end - currentTimestamp;
    if (diff <= 0 || isNaN(diff)) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (locale === 'bn') {
      if (days > 0) return `${toBanglaDigits(days)} দিন বাকি`;
      if (hours > 0) return `${toBanglaDigits(hours)} ঘণ্টা বাকি`;
      return `${toBanglaDigits(mins)} মিনিট বাকি`;
    }

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const productTimeLeftText = isSale ? getProductTimeLeftText(product?.discountEndDate, now) : null;

  const hasVariantsOrAttributes =
    (product?.attributes && product.attributes.length > 0) ||
    (product?.colors && product.colors.length > 0) ||
    (product?.sizes && product.sizes.length > 0);

  const { isInStock, stockQuantity } = getStockStatus(product);

  const handleAddToCartClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate rapid clicks
    if (cartClickRef.current || isAdding) return;
    cartClickRef.current = true;
    setTimeout(() => { cartClickRef.current = false; }, 1000);

    // Trigger bounce micro-interaction
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 300);

    // Trigger fly to cart animation effect
    const buttonTarget = e.currentTarget as HTMLElement;
    triggerFlyToCartAnimation(buttonTarget, img);

    if (hasVariantsOrAttributes) {
      router.push(`/products/${product.slug}`);
      return;
    }

    const catalogId = getCatalogProductId(product);
    const itemPrice = isSale ? salePrice : price;

    if (!isAuthenticated) {
      addToGuestCart(product, 1);
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 1500);

      if (catalogId) {
        fbEvent('track', 'AddToCart', {
          content_ids: [catalogId],
          content_type: 'product',
          content_name: product.title,
          value: itemPrice,
          currency: 'BDT',
          quantity: 1
        });
      }
      return;
    }

    try {
      await addToCart({
        product: product._id,
        quantity: 1
      }).unwrap();
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 1500);

      if (catalogId) {
        fbEvent('track', 'AddToCart', {
          content_ids: [catalogId],
          content_type: 'product',
          content_name: product.title,
          value: itemPrice,
          currency: 'BDT',
          quantity: 1
        });
      }
    } catch (err: any) {
      router.push(`/products/${product.slug}`);
    }
  }, [addToCart, hasVariantsOrAttributes, img, isAdding, isAuthenticated, isSale, locale, price, product, router, salePrice]);

  const handleWishlistClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate rapid clicks
    if (wishlistClickRef.current) return;
    wishlistClickRef.current = true;
    setTimeout(() => { wishlistClickRef.current = false; }, 600);

    if (onWishlistToggle) {
      onWishlistToggle(product);
      return;
    }

    const prodId = (product?._id || product?.id)?.toString();
    if (!prodId) return;

    if (!isAuthenticated) {
      const added = toggleGuestWishlist(product);
      setInternalWishlisted(added);
      if (added) {
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
        const catalogId = getCatalogProductId(product);
        const itemPrice = isSale ? salePrice : price;
        if (catalogId) {
          fbEvent('track', 'AddToWishlist', {
            content_ids: [catalogId],
            content_type: 'product',
            content_name: product.title || product.name,
            value: itemPrice,
            currency: 'BDT',
          });
        }
      } else {
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      }
      return;
    }

    try {
      if (effectiveIsWishlisted) {
        await removeFromWishlist(prodId).unwrap();
        setInternalWishlisted(false);
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(prodId).unwrap();
        setInternalWishlisted(true);
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
        const catalogId = getCatalogProductId(product);
        const itemPrice = isSale ? salePrice : price;
        if (catalogId) {
          fbEvent('track', 'AddToWishlist', {
            content_ids: [catalogId],
            content_type: 'product',
            content_name: product.title || product.name,
            value: itemPrice,
            currency: 'BDT',
          });
        }
      }
    } catch (err: any) {
      toast.error('Failed to update wishlist');
    }
  }, [addToWishlist, effectiveIsWishlisted, isAuthenticated, isSale, locale, onWishlistToggle, price, product, removeFromWishlist, salePrice]);

  return (
    <div
      className="product-card group flex flex-col bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative h-full"
    >
      {/* Discount Badge */}
      {isSale && discountPercent > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white font-mono font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
          -{discountPercent}%
        </span>
      )}
      {product?.badge && !isSale && (
        <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${effectiveIsWishlisted
            ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-rose-100'
            : 'bg-white/90 hover:bg-white border-black/10 text-gray-700 hover:text-rose-600'
          }`}
        title={effectiveIsWishlisted ? (locale === 'bn' ? 'পছন্দের তালিকা থেকে সরান' : 'Remove from Wishlist') : (locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত করুন' : 'Add to Wishlist')}
        aria-label={effectiveIsWishlisted ? (locale === 'bn' ? 'পছন্দের তালিকা থেকে সরান' : 'Remove from Wishlist') : (locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত করুন' : 'Add to Wishlist')}
      >
        <Heart
          size={15}
          fill={effectiveIsWishlisted ? "#e11d48" : "none"}
          className={`transition-all duration-200 ${effectiveIsWishlisted ? "stroke-[#e11d48] text-rose-600 scale-110" : "stroke-gray-700 hover:stroke-rose-600"}`}
        />
      </button>

      {/* Product Image - 3:4 Aspect Ratio for Fashion */}
      <Link
        href={`/products/${product.slug}`}
        prefetch={false}
        className="aspect-[3/4] overflow-hidden bg-muted/50 relative block select-none cursor-pointer"
      >
        <Image
          src={img}
          alt={productAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-300 ${!isInStock ? 'grayscale opacity-70 contrast-90' : 'group-hover:scale-105'}`}
          loading="lazy"
        />

        {/* Stock Out Overlay Badge on Image */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center p-2 z-10 pointer-events-none">
            <span className="bg-rose-600/95 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
              {locale === 'bn' ? 'স্টক আউট' : 'Stock Out'}
            </span>
          </div>
        )}

        {/* Individual Product Flash Sale Time Remaining Badge */}
        {productTimeLeftText && isInStock && (
          <span suppressHydrationWarning className="absolute bottom-2 left-2 z-10 bg-black/80 text-amber-300 backdrop-blur-md text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-400/30 shadow-xs">
            <Clock size={11} className="text-amber-400 animate-pulse shrink-0" />
            <span suppressHydrationWarning>{productTimeLeftText}</span>
          </span>
        )}
      </Link>

      {/* Body Info & Actions */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5">
        <div className="space-y-1 flex-1 flex flex-col">
          {/* Product Title - 2 Line Clamp */}
          <h3
            className="text-[12px] sm:text-[13px] font-semibold leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[2.4em]"
            title={product?.title || product?.name || 'Product'}
          >
            <Link href={`/products/${product.slug}`} prefetch={false} className="hover:underline decoration-primary/30 underline-offset-2 block">
              {product?.title || product?.name || 'Product'}
            </Link>
          </h3>

          {/* Dynamic DB Rating Bar (Displayed only when genuine review data is available; row height reserved for grid alignment) */}
          <div className="min-h-[16px]">
            {product.ratings?.count > 0 && product.ratings?.average > 0 && (
              <div className="flex items-center gap-1 pt-0.5">
                <div className="flex items-center gap-px">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const avgRating = Number(product.ratings.average);
                    const isStarFilled = starIdx <= Math.round(avgRating);
                    return (
                      <Star
                        key={starIdx}
                        size={12}
                        fill={isStarFilled ? 'currentColor' : 'none'}
                        className={isStarFilled ? 'text-amber-400 stroke-amber-400' : 'text-amber-400/30 stroke-amber-400/40'}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold text-foreground/80 font-mono">
                  {Number(product.ratings.average).toFixed(1)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  ({product.ratings.count})
                </span>
              </div>
            )}
          </div>

          {/* Pricing Section & Stock Badge */}
          <div className="flex items-center justify-between gap-1 pt-0.5 min-h-[22px]">
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5">
              {isSale ? (
                <>
                  <span className="text-[14px] sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                    ৳{salePrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 line-through decoration-rose-500/40 font-medium font-mono">
                    ৳{price.toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="text-[14px] sm:text-base font-black text-foreground font-mono tracking-tight">
                  ৳{price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* In Stock / Stock Out Badge */}
            {isInStock ? (
              <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {locale === 'bn' ? 'ইন স্টক' : 'In Stock'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {locale === 'bn' ? 'স্টক আউট' : 'Stock Out'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Order Now (Primary) + Add to Cart (Secondary Icon Button) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 mt-auto">
          {isInStock ? (
            <>
              {/* Order Now (Primary Button) - Navigates directly to Product Details Page */}
              <Link
                href={`/products/${product.slug}`}
                prefetch={false}
                aria-label={locale === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                className="flex-1 bg-primary hover:bg-[#b0842e] text-white text-[11px] sm:text-xs font-bold h-9.5 min-h-[38px] sm:h-10 px-2 sm:px-3 rounded-lg sm:rounded-xl transition-all duration-200 ease-out hover:shadow-md hover:shadow-primary/20 active:scale-[0.97] active:duration-100 flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer min-w-0 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="whitespace-nowrap truncate">{locale === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
                <ArrowRight size={13} className="stroke-[2.5] shrink-0" />
              </Link>

              {/* Add to Cart (Secondary Icon Button) */}
              <button
                onClick={handleAddToCartClick}
                disabled={isAdding || cartSuccess}
                aria-label={locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                className={`w-9.5 h-9.5 min-w-[38px] min-h-[38px] sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-200 ease-out active:scale-[0.92] active:duration-100 shrink-0 cursor-pointer flex items-center justify-center will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${cartSuccess
                    ? 'bg-emerald-500 text-white border border-emerald-400 shadow-sm'
                    : isAdding
                      ? 'bg-primary/10 text-primary border border-primary/20 opacity-70 cursor-not-allowed'
                      : `bg-primary/10 dark:bg-primary/20 hover:bg-primary hover:text-white text-primary border border-primary/30 hover:shadow-md hover:shadow-primary/20 shadow-xs ${isCartBouncing ? 'animate-cart-bounce' : ''
                      }`
                  }`}
                title={locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
              >
                {cartSuccess ? (
                  <Check size={16} className="stroke-[3]" />
                ) : isAdding ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ShoppingCart size={15} className={`stroke-[2.5] transition-transform duration-200 ${isCartBouncing ? 'scale-110' : ''}`} />
                )}
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-1.5">
              {/* Disabled Order Now Button */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="flex-1 bg-muted/60 text-muted-foreground/75 text-[11px] sm:text-xs font-bold h-9.5 min-h-[38px] sm:h-10 px-2 sm:px-3 rounded-lg sm:rounded-xl border border-border/70 flex items-center justify-center gap-1 whitespace-nowrap cursor-not-allowed select-none opacity-80"
              >
                <span className="truncate">{locale === 'bn' ? 'স্টক আউট' : 'Stock Out'}</span>
              </button>

              {/* Disabled Add to Cart Button */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-9.5 h-9.5 min-w-[38px] min-h-[38px] sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-muted/40 text-muted-foreground/40 border border-border/50 flex items-center justify-center cursor-not-allowed select-none opacity-60 shrink-0"
                title={locale === 'bn' ? 'স্টক আউট' : 'Stock Out'}
                aria-label={locale === 'bn' ? 'স্টক আউট' : 'Stock Out'}
              >
                <ShoppingCart size={15} className="stroke-[2] opacity-40" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
