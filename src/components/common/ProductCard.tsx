'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from '@/components/SafeImage';
import { Heart, Star, ShoppingCart, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { addToGuestCart } from '@/utils/guestCart';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'react-toastify';
import { triggerFlyToCartAnimation } from '@/utils/cartAnimation';

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

  const price = Number(product?.price) || 0;
  const salePrice = Number(product?.salePrice) || 0;
  const isDiscountExpired = product?.discountEndDate && new Date() > new Date(product.discountEndDate);
  const isSale = !isDiscountExpired && salePrice > 0 && price > 0 && salePrice < price;
  const discountPercent = isSale ? Math.floor(((price - salePrice) / price) * 100) : 0;
  const img = product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';

  // Individual Product Flash Sale Time Remaining Helper
  const getProductTimeLeftText = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const productTimeLeftText = isSale ? getProductTimeLeftText(product?.discountEndDate) : null;

  const hasVariantsOrAttributes = 
    (product?.attributes && product.attributes.length > 0) ||
    (product?.colors && product.colors.length > 0) ||
    (product?.sizes && product.sizes.length > 0);

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    if (!isAuthenticated) {
      addToGuestCart(product, 1);
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
      return;
    }

    try {
      await addToCart({
        product: product._id,
        quantity: 1
      }).unwrap();
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
    } catch (err: any) {
      router.push(`/products/${product.slug}`);
    }
  };

  const handleOrderNowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariantsOrAttributes) {
      router.push(`/products/${product.slug}`);
      return;
    }

    if (!isAuthenticated) {
      addToGuestCart(product, 1);
      router.push('/checkout');
      return;
    }

    try {
      await addToCart({
        product: product._id,
        quantity: 1
      }).unwrap();
      router.push('/checkout');
    } catch (err: any) {
      router.push(`/products/${product.slug}`);
    }
  };

  return (
    <div className="group flex flex-col bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative h-full">
      {/* Discount Badge */}
      {isSale && discountPercent > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-rose-600 text-white font-mono font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
          -{discountPercent}%
        </span>
      )}
      {product?.badge && !isSale && (
        <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
          {product.badge}
        </span>
      )}

      {/* Wishlist Button - Pure Clean Glassmorphism & Soft Rose Active State */}
      {onWishlistToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border ${
            isWishlisted 
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-rose-100' 
              : 'bg-white/90 hover:bg-white border-black/10 text-gray-700 hover:text-rose-600'
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Toggle Wishlist"
        >
          <Heart 
            size={16} 
            fill={isWishlisted ? "#e11d48" : "none"} 
            className={`transition-all duration-200 ${isWishlisted ? "stroke-[#e11d48] text-rose-600 scale-110" : "stroke-gray-700 hover:stroke-rose-600"}`} 
          />
        </button>
      )}

      {/* Product Image - Aspect Square with Direct Details Page Link */}
      <Link href={`/products/${product.slug}`} prefetch={false} className="aspect-square overflow-hidden bg-muted relative block group/img cursor-pointer">
        <Image 
          src={img} 
          alt={`${product?.title || 'Product'} - চারুলতা লাইফস্টাইল (Charulata Lifestyle)`} 
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="transition duration-500 group-hover:scale-105 object-cover" 
        />

        {/* Individual Product Flash Sale Time Remaining Badge */}
        {productTimeLeftText && (
          <span className="absolute bottom-2 left-2 z-10 bg-black/80 text-amber-300 backdrop-blur-md text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-400/30 shadow-xs">
            <Clock size={11} className="text-amber-400 animate-pulse shrink-0" />
            <span>{productTimeLeftText}</span>
          </span>
        )}

        {/* Image Overlay - View Details Button */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-3 z-10">
          <span className="flex items-center space-x-1.5 bg-white/95 text-[#0B0F19] text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-xl scale-90 group-hover:scale-100 transition-all duration-300 border border-white/20">
            <span>{locale === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
            <ArrowRight size={13} className="stroke-[3]" />
          </span>
        </div>
      </Link>

      {/* Body Info & Actions */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5 flex-1 flex flex-col">
          {/* Daraz & Amazon Style Clamped Title with Reserved 2-Line Height */}
          <h3 
            className="text-xs sm:text-[13px] font-semibold leading-[1.35] text-foreground hover:text-primary transition-colors line-clamp-2 h-[2.7em] overflow-hidden"
            title={product?.title || product?.name || 'Product'}
          >
            <Link href={`/products/${product.slug}`} prefetch={false} className="hover:underline block">
              {product?.title || product?.name || 'Product'}
            </Link>
          </h3>
          
          {/* Dynamic DB Rating Bar (Shows filled stars only for rated products, empty stars for unrated) */}
          <div className="flex items-center space-x-1.5 pt-0.5 min-h-[24px]">
            {product.ratings?.count > 0 && product.ratings?.average > 0 ? (
              <>
                <div className="flex items-center space-x-[1.5px]">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const avgRating = Number(product.ratings.average);
                    const isStarFilled = starIdx <= Math.round(avgRating);
                    return (
                      <Star
                        key={starIdx}
                        size={14}
                        fill={isStarFilled ? 'currentColor' : 'none'}
                        className={isStarFilled ? 'text-amber-400 stroke-amber-400' : 'text-amber-400/30 stroke-amber-400/40'}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-black text-foreground/90 font-mono ml-1">
                  {Number(product.ratings.average).toFixed(1)}
                </span>
                <span className="text-[11px] text-muted-foreground font-extrabold">
                  ({product.ratings.count})
                </span>
              </>
            ) : (
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-[1.5px]">
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <Star
                      key={starIdx}
                      size={14}
                      fill="none"
                      className="text-amber-400/30 stroke-amber-400/40"
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground/60 font-semibold ml-1">
                  (0)
                </span>
              </div>
            )}
          </div>

          {/* Pricing Section with High-Contrast Luxury Theme Match */}
          <div className="flex flex-wrap items-baseline gap-1.5 pt-1 min-h-[1.75rem]">
            {isSale ? (
              <>
                <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                  ৳{salePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-muted-foreground/80 line-through decoration-rose-500/50 font-semibold font-mono">
                  ৳{price.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md font-mono">
                  -{discountPercent}%
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-black text-foreground font-mono tracking-tight">
                ৳{price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Order Now (Primary) + Add to Cart (Secondary Icon Button) */}
        <div className="flex items-center space-x-1.5 pt-2 border-t border-border/60 mt-auto">
          {/* Order Now (Primary Button) */}
          <button
            onClick={handleOrderNowClick}
            className="flex-1 bg-primary hover:bg-[#b0842e] text-white text-[11px] sm:text-xs md:text-[13px] font-bold h-9 sm:h-10 px-2 sm:px-3 rounded-xl transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md hover:shadow-primary/25 active:scale-[0.96] active:duration-150 flex items-center justify-center space-x-1 whitespace-nowrap cursor-pointer min-w-0 will-change-transform"
          >
            <span className="whitespace-nowrap truncate">{locale === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
            <ArrowRight size={13} className="stroke-[2.5] shrink-0" />
          </button>

          {/* Add to Cart (Secondary Icon Button) */}
          <button
            onClick={handleAddToCartClick}
            disabled={isAdding}
            className={`w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] bg-primary/10 dark:bg-primary/20 hover:bg-primary hover:text-white text-primary border border-primary/30 rounded-xl transition-all duration-200 ease-out hover:scale-[1.05] hover:shadow-md hover:shadow-primary/20 active:scale-[0.92] active:duration-150 shrink-0 cursor-pointer shadow-xs flex items-center justify-center font-bold will-change-transform ${
              isCartBouncing ? 'animate-cart-bounce' : ''
            }`}
            title={locale === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
            aria-label="Add to Cart"
          >
            <ShoppingCart size={16} className={`stroke-[2.5] transition-transform duration-200 ${isCartBouncing ? 'scale-110' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
