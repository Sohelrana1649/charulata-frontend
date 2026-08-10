'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from '@/components/SafeImage';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, UserCheck } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/store/api/userApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { addToGuestCart } from '@/utils/guestCart';
import { getGuestWishlistItems, toggleGuestWishlist } from '@/utils/guestWishlist';
import { toast } from 'react-toastify';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const router = useRouter();
  const { locale } = useTranslation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const { data: productsData } = useGetProductsQuery({ limit: 60 });
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const [guestItems, setGuestItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setGuestItems(getGuestWishlistItems());
    const handleUpdate = () => setGuestItems(getGuestWishlistItems());
    window.addEventListener('guest_wishlist_updated', handleUpdate);
    return () => window.removeEventListener('guest_wishlist_updated', handleUpdate);
  }, []);

  const allProductsList = React.useMemo(() => {
    return Array.isArray(productsData?.data?.products)
      ? productsData.data.products
      : Array.isArray(productsData?.products)
        ? productsData.products
        : Array.isArray(productsData?.data)
          ? productsData.data
          : Array.isArray(productsData)
            ? productsData
            : [];
  }, [productsData]);

  const items = React.useMemo(() => {
    if (!isAuthenticated) {
      return guestItems.map((g: any) => {
        const idStr = (g._id || g.id || g).toString();
        const matched = allProductsList.find((p: any) => (p._id || p.id)?.toString() === idStr);
        if (matched) {
          return {
            _id: matched._id || matched.id,
            title: matched.title || matched.name || 'Charulata Product',
            slug: matched.slug || idStr,
            price: Number(matched.price) || Number(g.price) || 0,
            salePrice: Number(matched.salePrice) || Number(g.salePrice) || 0,
            image: matched.productImages?.[0] || matched.image || g.image,
            rawProduct: matched
          };
        }
        return {
          _id: idStr,
          title: g.title || 'Charulata Product',
          slug: g.slug || idStr,
          price: Number(g.price) || 0,
          salePrice: Number(g.salePrice) || 0,
          image: g.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
          rawProduct: g
        };
      });
    }

    const serverProducts = Array.isArray(wishlistResponse?.data?.products)
      ? wishlistResponse.data.products
      : Array.isArray(wishlistResponse?.products)
        ? wishlistResponse.products
        : Array.isArray(wishlistResponse?.data)
          ? wishlistResponse.data
          : Array.isArray(wishlistResponse)
            ? wishlistResponse
            : [];

    return serverProducts.map((p: any) => ({
      _id: p._id || p.id,
      title: p.title || 'Product',
      slug: p.slug || p._id,
      price: Number(p.price) || 0,
      salePrice: Number(p.salePrice) || 0,
      image: p.productImages?.[0] || p.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
      rawProduct: p
    }));
  }, [isAuthenticated, wishlistResponse, guestItems, allProductsList]);

  const handleRemove = async (productId: string) => {
    if (!isAuthenticated) {
      toggleGuestWishlist(productId);
      toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
      return;
    }

    try {
      await removeFromWishlist(productId).unwrap();
      toast.info(locale === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (item: any) => {
    if (!isAuthenticated) {
      addToGuestCart(item.rawProduct || item, 1);
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
      return;
    }

    try {
      await addToCart({ product: item._id, quantity: 1 }).unwrap();
      toast.success(locale === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      items.forEach((item: any) => {
        addToGuestCart(item.rawProduct || item, 1);
      });
      toast.success(locale === 'bn' ? 'সকল পছন্দের পণ্য কার্টে যোগ করা হয়েছে!' : 'Added all wishlist items to cart!');
      onClose();
      router.push('/cart');
      return;
    }

    try {
      await Promise.all(
        items.map((item: any) => addToCart({ product: item._id, quantity: 1 }).unwrap())
      );
      toast.success(locale === 'bn' ? 'সকল পছন্দের পণ্য কার্টে যোগ করা হয়েছে!' : 'Added all wishlist items to cart!');
      onClose();
      router.push('/cart');
    } catch (err) {
      toast.error('Failed to add items to cart');
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 z-[99999]" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 h-screen z-[100000]">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col h-screen animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header (Fixed Top) */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <Heart size={18} className="fill-rose-500/20" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-foreground">
                  {locale === 'bn' ? 'পছন্দের তালিকা' : 'My Wishlist'}
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  {items.length} {locale === 'bn' ? 'টি আইটেম সেভ করা আছে' : 'saved items'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Guest Sync Alert Banner */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-b border-rose-500/20 p-3 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <UserCheck size={16} className="text-rose-500 shrink-0" />
                <p className="text-[11px] font-bold text-foreground leading-tight">
                  {locale === 'bn' ? 'ডিভাইসের মাঝে সিঙ্ক করতে সাইন ইন করুন' : 'Sign in to sync your wishlist across devices'}
                </p>
              </div>
              <Link
                href="/login?redirect=profile"
                onClick={onClose}
                className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 transition"
              >
                {locale === 'bn' ? 'সাইন ইন' : 'Sign In'}
              </Link>
            </div>
          )}

          {/* Wishlist Items List (Scrollable Content Area) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar scrollbar-none">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Heart size={30} className="stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-foreground">
                    {locale === 'bn' ? 'আপনার উইশলিস্ট ফাঁকা' : 'Your Wishlist is Empty'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    {locale === 'bn' 
                      ? 'পছন্দের পণ্যগুলো উইশলিস্টে সেভ করে রাখুন এবং যেকোনো সময় সহজে অর্ডার করুন।' 
                      : 'Explore products and save your favorite items here for quick ordering anytime.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{locale === 'bn' ? 'পণ্যসমূহ দেখুন' : 'Explore Products'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              items.map((item: any) => {
                const regPrice = Number(item?.price) || 0;
                const salePrice = Number(item?.salePrice) || 0;
                const hasDiscount = salePrice > 0 && regPrice > 0 && salePrice < regPrice;
                const finalPrice = hasDiscount ? salePrice : regPrice;

                return (
                  <div 
                    key={item._id} 
                    className="flex items-center space-x-3.5 p-3 rounded-2xl bg-muted/40 border border-border/60 hover:border-primary/30 transition group relative"
                  >
                    {/* Item Thumbnail Image */}
                    <Link 
                      href={`/products/${item.slug || item._id}`} 
                      onClick={onClose}
                      className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-card border border-border"
                    >
                      <Image 
                        src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'} 
                        alt={item.title || 'Product'} 
                        fill 
                        sizes="80px" 
                        className="object-cover group-hover:scale-105 transition-transform" 
                      />
                    </Link>

                    {/* Item Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link 
                        href={`/products/${item.slug || item._id}`} 
                        onClick={onClose}
                        className="font-bold text-xs text-foreground hover:text-primary transition line-clamp-1 block"
                      >
                        {item.title || 'Charulata Product'}
                      </Link>

                      <div className="flex items-baseline space-x-1.5 font-mono text-xs">
                        <span className="font-black text-rose-600">
                          BDT {finalPrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            BDT {regPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-white transition shadow-xs cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item._id)}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer (Fixed Bottom) */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/20 space-y-2 shrink-0">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>{locale === 'bn' ? 'সকল পছন্দের পণ্য কার্টে যোগ করুন' : 'Add All Wishlist Items to Cart'}</span>
              </button>
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2 border border-border"
              >
                <span>{locale === 'bn' ? 'কার্ট পেজে যান' : 'Go to Cart Page'}</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
