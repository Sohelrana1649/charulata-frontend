'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from '@/components/SafeImage';
import ProductCard from '@/components/common/ProductCard';
import { ArrowLeft, ChevronRight, Package, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/store/api/userApi';
import { getGuestWishlist, toggleGuestWishlist } from '@/utils/guestWishlist';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/i18n/LanguageContext';
import { translateCategoryName } from '@/utils/categoryTranslator';

interface CategoryClientViewProps {
  initialCategory?: any;
  initialProducts?: any[];
  slug?: string;
}

export default function CategoryClientView({ 
  initialCategory, 
  initialProducts = [], 
  slug: propSlug 
}: CategoryClientViewProps) {
  const params = useParams();
  const slug = (params?.slug as string) || propSlug || initialCategory?.slug;
  const { locale, t } = useTranslation();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  const [sortOption, setSortOption] = useState<string>('newest');

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

    const isIn = wishlistArray.some((id: string) => id === productId);
    try {
      if (isIn) {
        await removeFromWishlist(productId).unwrap();
        toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success(locale === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে!' : 'Saved to wishlist!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update wishlist.');
    }
  };

  // Sort products client-side based on the selected sortOption
  const sortedProducts = useMemo(() => {
    const list = [...initialProducts];
    if (sortOption === 'price-asc') {
      return list.sort((a, b) => {
        const priceA = a.salePrice || a.price || 0;
        const priceB = b.salePrice || b.price || 0;
        return priceA - priceB;
      });
    }
    if (sortOption === 'price-desc') {
      return list.sort((a, b) => {
        const priceA = a.salePrice || a.price || 0;
        const priceB = b.salePrice || b.price || 0;
        return priceB - priceA;
      });
    }
    if (sortOption === 'popular') {
      return list.sort((a, b) => {
        const popA = a.soldCount || a.ratings?.count || 0;
        const popB = b.soldCount || b.ratings?.count || 0;
        return popB - popA;
      });
    }
    // Default 'newest'
    return list;
  }, [initialProducts, sortOption]);

  const catName = initialCategory ? translateCategoryName(initialCategory, locale) : (slug ? slug.replace(/-/g, ' ') : 'Category');

  return (
    <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full py-6 flex-1 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-none py-1">
        <Link href="/" className="hover:text-primary font-bold transition flex items-center gap-1 shrink-0">
          <span>{locale === 'bn' ? 'হোম' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        <Link href="/search" className="hover:text-primary font-medium transition shrink-0">
          <span>{locale === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}</span>
        </Link>
        <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
        <span className="font-semibold text-foreground capitalize truncate">
          {catName}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10 text-center md:text-left">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
            {locale === 'bn' ? 'প্রিমিয়াম কালেকশন' : 'Premium Collection'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white capitalize">
            {catName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {initialCategory?.description || (locale === 'bn' 
              ? `চারুলতা লাইফস্টাইলের সেরা ${catName} কালেকশন এক্সপ্লোর করুন। আকর্ষণীয় দাম ও ১-ক্লিক ক্যাশ অন ডেলিভারি।` 
              : `Explore our top-tier ${catName} collection at Charulata Lifestyle. Premium quality with 1-Click Cash on Delivery.`)}
          </p>
        </div>

        {initialCategory?.image && (
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden relative border-2 border-white/30 shadow-xl shrink-0">
            <Image
              src={initialCategory.image}
              alt={`${catName} - চারুলতা লাইফস্টাইল`}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Toolbar & Sort Controls */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 flex-wrap">
        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          {locale === 'bn' ? `মোট ${sortedProducts.length} টি পণ্য পাওয়া গেছে` : `Showing ${sortedProducts.length} products`}
        </p>

        <div className="flex items-center space-x-2">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-card border border-border text-xs font-bold rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="newest">{locale === 'bn' ? 'নতুন পণ্যসমূহ' : 'Newest Arrivals'}</option>
            <option value="price-asc">{locale === 'bn' ? 'কম দাম থেকে বেশি' : 'Price: Low to High'}</option>
            <option value="price-desc">{locale === 'bn' ? 'বেশি দাম থেকে কম' : 'Price: High to Low'}</option>
            <option value="popular">{locale === 'bn' ? 'জনপ্রিয় পণ্যসমূহ' : 'Most Popular'}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl p-8 max-w-md mx-auto">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-foreground font-serif">{locale === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Found'}</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{locale === 'bn' ? 'এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য স্টক নেই।' : 'There are currently no products available in this category.'}</p>
          <Link href="/search" className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition">
            <ArrowLeft size={14} />
            <span>{locale === 'bn' ? 'অন্যান্য পণ্য দেখুন' : 'Explore Other Products'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {sortedProducts.map((product: any) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={wishlistArray.some((id: string) => id === product._id?.toString())}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
