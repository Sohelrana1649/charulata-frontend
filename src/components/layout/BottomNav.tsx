'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useGetCartQuery } from '@/store/api/cartApi';
import { getGuestCart } from '@/utils/guestCart';
import { useGetWishlistQuery } from '@/store/api/userApi';
import { getGuestWishlist } from '@/utils/guestWishlist';
import { useTranslation } from '@/i18n/LanguageContext';
import Image from '@/components/SafeImage';
import { getFallbackAvatarUrl } from '@/utils/avatarHelper';

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cart Count
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [guestCartCount, setGuestCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      const updateCount = () => {
        const items = getGuestCart();
        const count = items.reduce((acc, i) => acc + i.quantity, 0);
        setGuestCartCount(count);
      };
      updateCount();
      window.addEventListener('guest_cart_updated', updateCount);
      return () => window.removeEventListener('guest_cart_updated', updateCount);
    }
  }, [isAuthenticated]);

  const cartObj = cartData?.data?.cart || cartData?.cart || cartData?.data || cartData;
  const cartItemsCount = mounted
    ? (isAuthenticated
        ? (cartObj?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0)
        : guestCartCount)
    : 0;

  // Wishlist Count
  const { data: wishlistResponse } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const wishlistArray = Array.isArray(wishlistResponse?.data?.products)
    ? wishlistResponse.data.products
    : Array.isArray(wishlistResponse?.products)
      ? wishlistResponse.products
      : Array.isArray(wishlistResponse?.data)
        ? wishlistResponse.data
        : Array.isArray(wishlistResponse)
          ? wishlistResponse
          : [];
  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
    setGuestWishlist(getGuestWishlist());
    const handleUpdate = () => setGuestWishlist(getGuestWishlist());
    window.addEventListener('guest_wishlist_updated', handleUpdate);
    return () => window.removeEventListener('guest_wishlist_updated', handleUpdate);
  }, []);

  const wishlistCount = mounted
    ? (isAuthenticated ? wishlistArray.length : guestWishlist.length)
    : 0;

  // Listen to mobile menu state changes from Header
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    const handleMenuState = (e: any) => {
      if (typeof e.detail?.isOpen === 'boolean') {
        setIsMobileMenuOpen(e.detail.isOpen);
      }
    };
    const handleWishlistState = (e: any) => {
      if (typeof e.detail?.isOpen === 'boolean') {
        setIsWishlistOpen(e.detail.isOpen);
      }
    };

    window.addEventListener('mobile_menu_state_changed', handleMenuState);
    window.addEventListener('wishlist_drawer_state_changed', handleWishlistState);
    return () => {
      window.removeEventListener('mobile_menu_state_changed', handleMenuState);
      window.removeEventListener('wishlist_drawer_state_changed', handleWishlistState);
    };
  }, []);

  // When pathname changes, close mobile menu state representation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsWishlistOpen(false);
  }, [pathname]);

  // Do not render on admin dashboard or checkout page to avoid overlapping controls
  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  if (!pathname || isAdminPage || isCheckoutPage) {
    return null;
  }

  // Active state determinations
  const isHomeActive = pathname === '/' && !isMobileMenuOpen && !isWishlistOpen;
  const isCategoriesActive = isMobileMenuOpen || (pathname === '/search' && Boolean(currentCategory));
  const isCartActive = pathname === '/cart' && !isMobileMenuOpen && !isWishlistOpen;
  const isWishlistActive = isWishlistOpen;
  const isAccountActive =
    (mounted && isAuthenticated
      ? pathname.startsWith('/profile')
      : (pathname === '/login' || pathname === '/register')) &&
    !isMobileMenuOpen &&
    !isWishlistOpen;

  const handleToggleCategories = () => {
    window.dispatchEvent(new CustomEvent('toggle_mobile_menu'));
  };

  const handleOpenWishlist = () => {
    window.dispatchEvent(new CustomEvent('open_wishlist_drawer'));
  };

  const labels = {
    home: locale === 'bn' ? 'হোম' : 'Home',
    categories: locale === 'bn' ? 'ক্যাটাগরি' : 'Categories',
    cart: locale === 'bn' ? 'কার্ট' : 'Cart',
    wishlist: locale === 'bn' ? 'ইচ্ছেতালিকা' : 'Wishlist',
    account: locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account',
  };

  return (
    <>
    {/* In-flow spacer: reserves room so the fixed bar never covers the last content/footer */}
    <div aria-hidden="true" className="md:hidden shrink-0 h-[calc(4.5rem+env(safe-area-inset-bottom,0px))]" />
    <nav
      aria-label="Mobile Bottom Navigation"
      suppressHydrationWarning
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-15 max-w-lg mx-auto items-stretch px-1">
        {/* 1. HOME */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg transition-colors ${
            isHomeActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={labels.home}
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Home
              size={20}
              className={`transition-transform duration-200 ${
                isHomeActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
          </div>
          <span
            className={`text-[10px] sm:text-[11px] tracking-tight leading-none mt-1 transition-all max-w-full truncate px-0.5 ${
              isHomeActive ? 'font-black' : 'font-semibold'
            }`}
          >
            {labels.home}
          </span>
          {isHomeActive && (
            <span className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-in fade-in zoom-in-50" />
          )}
        </Link>

        {/* 2. CATEGORIES */}
        <button
          type="button"
          onClick={handleToggleCategories}
          className={`flex flex-col items-center justify-center py-1 text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg transition-colors ${
            isCategoriesActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={labels.categories}
          aria-expanded={isMobileMenuOpen}
        >
          <div className="relative flex items-center justify-center">
            <LayoutGrid
              size={20}
              className={`transition-transform duration-200 ${
                isCategoriesActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
          </div>
          <span
            className={`text-[10px] sm:text-[11px] tracking-tight leading-none mt-1 transition-all max-w-full truncate px-0.5 ${
              isCategoriesActive ? 'font-black' : 'font-semibold'
            }`}
          >
            {labels.categories}
          </span>
          {isCategoriesActive && (
            <span className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-in fade-in zoom-in-50" />
          )}
        </button>

        {/* 3. CART */}
        <Link
          href="/cart"
          id="mobile-bottom-nav-cart"
          className={`flex flex-col items-center justify-center py-1 text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg transition-colors ${
            isCartActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={cartItemsCount > 0 ? `${labels.cart} (${cartItemsCount})` : labels.cart}
          aria-current={isCartActive ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingCart
              size={20}
              className={`transition-transform duration-200 ${
                isCartActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
            {mounted && cartItemsCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-white text-[9px] font-black ring-2 ring-card shadow-xs leading-none select-none"
                style={{ color: '#ffffff' }}
              >
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-[11px] tracking-tight leading-none mt-1 transition-all max-w-full truncate px-0.5 ${
              isCartActive ? 'font-black' : 'font-semibold'
            }`}
          >
            {labels.cart}
          </span>
          {isCartActive && (
            <span className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-in fade-in zoom-in-50" />
          )}
        </Link>

        {/* 4. WISHLIST */}
        <button
          type="button"
          onClick={handleOpenWishlist}
          className={`flex flex-col items-center justify-center py-1 text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg transition-colors ${
            isWishlistActive ? 'text-rose-600' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={wishlistCount > 0 ? `${labels.wishlist} (${wishlistCount})` : labels.wishlist}
        >
          <div className="relative flex items-center justify-center">
            <Heart
              size={20}
              className={`transition-transform duration-200 ${
                isWishlistActive
                  ? 'text-rose-600 fill-rose-500/30 stroke-[2.5] scale-110'
                  : 'stroke-[1.8] group-hover:scale-105'
              }`}
            />
            {mounted && wishlistCount > 0 && (
              <span
                className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black ring-2 ring-card shadow-xs leading-none select-none"
                style={{ color: '#ffffff' }}
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-[11px] tracking-tight leading-none mt-1 transition-all max-w-full truncate px-0.5 ${
              isWishlistActive ? 'font-black text-rose-600' : 'font-semibold'
            }`}
          >
            {labels.wishlist}
          </span>
          {isWishlistActive && (
            <span className="w-1 h-1 bg-rose-600 rounded-full mt-0.5 animate-in fade-in zoom-in-50" />
          )}
        </button>

        {/* 5. ACCOUNT */}
        <Link
          href={mounted && isAuthenticated ? '/profile' : '/login'}
          suppressHydrationWarning
          className={`flex flex-col items-center justify-center py-1 text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-lg transition-colors ${
            isAccountActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={labels.account}
          aria-current={isAccountActive ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            {mounted && isAuthenticated && user ? (
              <div
                className={`w-5 h-5 rounded-full overflow-hidden border transition-all ${
                  isAccountActive ? 'border-primary ring-1 ring-primary/40' : 'border-border'
                }`}
              >
                <Image
                  src={getFallbackAvatarUrl(user)}
                  alt={user.name || 'Account'}
                  width={20}
                  height={20}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <User
                size={20}
                className={`transition-transform duration-200 ${
                  isAccountActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8] group-hover:scale-105'
                }`}
              />
            )}
          </div>
          <span
            className={`text-[10px] sm:text-[11px] tracking-tight leading-none mt-1 transition-all max-w-full truncate px-0.5 ${
              isAccountActive ? 'font-black' : 'font-semibold'
            }`}
          >
            {labels.account}
          </span>
          {isAccountActive && (
            <span className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-in fade-in zoom-in-50" />
          )}
        </Link>
      </div>
    </nav>
    </>
  );
}
