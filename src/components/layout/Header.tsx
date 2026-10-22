'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { useGetCartQuery } from '@/store/api/cartApi';
import { getGuestCart } from '@/utils/guestCart';
import { getGuestWishlist } from '@/utils/guestWishlist';
import { useGetWishlistQuery } from '@/store/api/userApi';
import WishlistDrawer from '@/components/common/WishlistDrawer';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productApi';
import { useGetSettingsQuery } from '@/store/api/settingsApi';
import { useTranslation } from '@/i18n/LanguageContext';
import { getUserAvatarUrl, getFallbackAvatarUrl } from '@/utils/avatarHelper';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  History, 
  ChevronDown,
  ChevronRight,
  Heart,
  Sun,
  Moon,
  Languages,
  Loader2,
  Sparkles,
  TrendingUp,
  Tag,
  LayoutGrid,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Layers,
  ArrowUpRight,
  PhoneCall
} from 'lucide-react';
import { translateCategoryName } from '@/utils/categoryTranslator';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category') || '';
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, locale, setLocale } = useTranslation();
  
  const { data: settingsData } = useGetSettingsQuery();
  const navbarLogo = settingsData?.data?.navbarLogo || '/logo.png';
  
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [guestCartCount, setGuestCartCount] = useState(0);
  const [isCartShake, setIsCartShake] = useState(false);

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
  const cartItemsCount = isAuthenticated
    ? (cartObj?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0)
    : guestCartCount;

  const prevCartCountRef = useRef(cartItemsCount);

  useEffect(() => {
    if (cartItemsCount !== prevCartCountRef.current) {
      prevCartCountRef.current = cartItemsCount;
      setIsCartShake(true);
      const timer = setTimeout(() => setIsCartShake(false), 450);
      return () => clearTimeout(timer);
    }
  }, [cartItemsCount]);

  useEffect(() => {
    const triggerShake = () => {
      setIsCartShake(true);
      const timer = setTimeout(() => setIsCartShake(false), 450);
      return () => clearTimeout(timer);
    };
    window.addEventListener('cart_icon_bounce', triggerShake);
    return () => window.removeEventListener('cart_icon_bounce', triggerShake);
  }, []);

  const { data: wishlistResponse } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

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

  const wishlistCount = isAuthenticated ? wishlistArray.length : guestWishlist.length;

  // Responsive: how many parent categories fit in the desktop nav strip (rest go into "More...")
  const [visibleNavCount, setVisibleNavCount] = useState(6);
  useEffect(() => {
    const computeCount = () => {
      const w = window.innerWidth;
      if (w < 1100) setVisibleNavCount(2);
      else if (w < 1280) setVisibleNavCount(3);
      else if (w < 1440) setVisibleNavCount(4);
      else if (w < 1600) setVisibleNavCount(5);
      else setVisibleNavCount(6);
    };
    computeCount();
    window.addEventListener('resize', computeCount);
    return () => window.removeEventListener('resize', computeCount);
  }, []);

  // Dynamic Backend Categories Fetching for Navigation
  const { data: categoriesData } = useGetCategoriesQuery({});
  const categoriesList = React.useMemo(() => {
    return Array.isArray(categoriesData?.data?.categories)
      ? categoriesData.data.categories
      : Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : Array.isArray(categoriesData?.categories)
          ? categoriesData.categories
          : Array.isArray(categoriesData)
            ? categoriesData
            : [];
  }, [categoriesData]);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [openMobileCategories, setOpenMobileCategories] = useState<Record<string, boolean>>({});
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const allCategoriesRef = useRef<HTMLDivElement>(null);

  const toggleMobileCategory = (key: string) => {
    setOpenMobileCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (allCategoriesRef.current && !allCategoriesRef.current.contains(event.target as Node)) {
        setIsAllCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Automatically close mobile menu drawer on route or search change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Sync state with mobile bottom navigation and global triggers
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('mobile_menu_state_changed', { detail: { isOpen: isMobileMenuOpen } })
    );
  }, [isMobileMenuOpen]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('wishlist_drawer_state_changed', { detail: { isOpen: isWishlistDrawerOpen } })
    );
  }, [isWishlistDrawerOpen]);

  useEffect(() => {
    const handleOpenWishlist = () => setIsWishlistDrawerOpen(true);
    const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
    const handleOpenMobileMenu = () => setIsMobileMenuOpen(true);
    const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

    window.addEventListener('open_wishlist_drawer', handleOpenWishlist);
    window.addEventListener('toggle_mobile_menu', handleToggleMobileMenu);
    window.addEventListener('open_mobile_menu', handleOpenMobileMenu);
    window.addEventListener('close_mobile_menu', handleCloseMobileMenu);

    return () => {
      window.removeEventListener('open_wishlist_drawer', handleOpenWishlist);
      window.removeEventListener('toggle_mobile_menu', handleToggleMobileMenu);
      window.removeEventListener('open_mobile_menu', handleOpenMobileMenu);
      window.removeEventListener('close_mobile_menu', handleCloseMobileMenu);
    };
  }, []);

  const desktopSearchRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setHighlightedSuggestionIndex(-1);
  }, [debouncedSearch]);

  const { data: suggestionsData, isFetching: isSearchingSuggestions } = useGetProductsQuery(
    { search: debouncedSearch, limit: 6 },
    { skip: !debouncedSearch || debouncedSearch.length < 1 }
  );

  const suggestions = Array.isArray(suggestionsData?.data?.products)
    ? suggestionsData.data.products
    : Array.isArray(suggestionsData?.products)
      ? suggestionsData.products
      : Array.isArray(suggestionsData?.data)
        ? suggestionsData.data
        : Array.isArray(suggestionsData)
          ? suggestionsData
          : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        (desktopSearchRef.current && desktopSearchRef.current.contains(e.target as Node)) ||
        (mobileSearchRef.current && mobileSearchRef.current.contains(e.target as Node))
      ) {
        return;
      }
      setIsSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      return;
    }
    if (!isSearchFocused) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedSuggestionIndex >= 0 && highlightedSuggestionIndex < suggestions.length) {
        e.preventDefault();
        const selectedProduct = suggestions[highlightedSuggestionIndex];
        setIsSearchFocused(false);
        router.push(`/products/${selectedProduct.slug}`);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    const activeTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(activeTheme);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    try {
      const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return (
        <>
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <mark key={i} className="bg-primary/20 text-primary font-bold px-0.5 rounded">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </>
      );
    } catch {
      return text;
    }
  };

  const renderSearchSuggestions = () => {
    if (!isSearchFocused) return null;

    // Show Popular Searches when input is focused but empty
    if (!debouncedSearch || debouncedSearch.length < 1) {
      const popularTags = categoriesList.slice(0, 8).map((cat: any) => ({
        label: translateCategoryName(cat, locale),
        query: cat.slug || cat.name
      }));

      return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-card/98 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-muted-foreground mb-3 uppercase tracking-wider">
            <TrendingUp size={16} className="text-primary animate-pulse" />
            <span>{locale === 'bn' ? 'জনপ্রিয় ক্যাটাগরি সার্চ' : 'Popular Searches'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag: any) => (
              <button
                key={tag.query}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchQuery(tag.label);
                  setIsSearchFocused(false);
                  router.push(`/search?q=${encodeURIComponent(tag.query)}`);
                }}
                className="px-3 py-1.5 rounded-xl bg-muted/80 hover:bg-primary hover:text-white text-foreground text-xs sm:text-sm font-bold transition-all border border-border/70 flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-2xs group"
              >
                <Sparkles size={13} className="text-primary group-hover:text-white" />
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-card/98 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {isSearchingSuggestions ? (
          <div className="p-5 flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-bold text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={18} />
            <span>{locale === 'bn' ? 'পণ্য খোঁজা হচ্ছে...' : 'Searching products...'}</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="divide-y divide-border/60">
            <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
              <span>{locale === 'bn' ? 'পণ্য পরামর্শ' : 'Product Suggestions'}</span>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-extrabold">
                {suggestions.length} {locale === 'bn' ? 'টি পাওয়া গেছে' : 'found'}
              </span>
            </div>
            
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40" role="listbox">
              {suggestions.map((product: any, idx: number) => {
                const img = product.productImages?.[0] || product.image || '';
                const price = Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price) ? product.salePrice : product.price;
                const isHighlighted = idx === highlightedSuggestionIndex;
                
                return (
                  <button
                    key={product._id || product.slug}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setHighlightedSuggestionIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsSearchFocused(false);
                      router.push(`/products/${product.slug}`);
                    }}
                    className={`w-full px-4 py-3 flex items-center space-x-3.5 text-left transition-colors group cursor-pointer ${
                      isHighlighted ? 'bg-primary/15' : 'hover:bg-primary/10'
                    }`}
                  >
                    <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden border border-border shrink-0 bg-muted shadow-xs">
                      {img ? (
                        <Image 
                          src={img} 
                          alt={`${product.title}`} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <Tag size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-extrabold truncate font-serif leading-tight transition-colors ${
                        isHighlighted ? 'text-primary' : 'text-foreground group-hover:text-primary'
                      }`}>
                        {highlightMatch(product.title, debouncedSearch)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate font-medium mt-0.5">
                        {product.category?.name || product.category || 'Lifestyle'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-primary font-mono">৳{price}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsSearchFocused(false);
                router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`);
              }}
              className="w-full px-4 py-3 bg-muted/70 hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm font-extrabold text-foreground flex items-center justify-between cursor-pointer border-t border-border"
            >
              <span>{locale === 'bn' ? `"${debouncedSearch}" এর সমস্ত ফলাফল দেখুন` : `See all results for "${debouncedSearch}"`}</span>
              <Search size={15} />
            </button>
          </div>
        ) : (
          <div className="p-5 text-center">
            <p className="text-xs sm:text-sm font-bold text-muted-foreground">
              {locale === 'bn' ? `"${debouncedSearch}" নামে কোনো পণ্য পাওয়া যায়নি` : `No products found for "${debouncedSearch}"`}
            </p>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsSearchFocused(false);
                router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`);
              }}
              className="mt-2 text-xs sm:text-sm font-extrabold text-primary hover:underline cursor-pointer"
            >
              {locale === 'bn' ? 'শপ পেজে খুঁজুন →' : 'Search on shop page →'}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Group Categories into Parents (Level 0) and Subcategories (Level 1)
  const { parentCategories, topParentCategories, moreParentCategories } = React.useMemo(() => {
    if (!Array.isArray(categoriesList) || categoriesList.length === 0) {
      return { parentCategories: [], topParentCategories: [], moreParentCategories: [] };
    }

    const parents: any[] = [];
    const subs: any[] = [];

    categoriesList.forEach((cat: any) => {
      if (cat.level === 0 || !cat.parentCategory) {
        parents.push(cat);
      } else {
        subs.push(cat);
      }
    });

    // Sort parents by order: 1, then name: 1
    parents.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || ''));

    // Sort subs by order: 1, then name: 1
    subs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || ''));

    // Group subcategories by parent identifier (parent ID and slug)
    const subMap: Record<string, any[]> = {};
    subs.forEach((sub: any) => {
      const parentId = typeof sub.parentCategory === 'object' && sub.parentCategory !== null
        ? String(sub.parentCategory._id || sub.parentCategory.slug || '')
        : String(sub.parentCategory || '');

      const parentSlug = typeof sub.parentCategory === 'object' && sub.parentCategory !== null
        ? String(sub.parentCategory.slug || '')
        : '';

      if (parentId) {
        if (!subMap[parentId]) subMap[parentId] = [];
        subMap[parentId].push(sub);
      }
      if (parentSlug && parentSlug !== parentId) {
        if (!subMap[parentSlug]) subMap[parentSlug] = [];
        subMap[parentSlug].push(sub);
      }
    });

    const enrichedParents = parents.map((parent) => {
      const idKey = String(parent._id || '');
      const slugKey = String(parent.slug || '');
      const childSubs = subMap[idKey] || subMap[slugKey] || [];
      return {
        ...parent,
        displayName: translateCategoryName(parent, locale),
        subcategories: childSubs.map((s) => ({
          ...s,
          displayName: translateCategoryName(s, locale)
        }))
      };
    });

    // Top Parent Categories on Navbar Strip (responsive count)
    const topParents = enrichedParents.slice(0, visibleNavCount);
    // Remaining Parent Categories in "More..." Dropdown
    const moreParents = enrichedParents.slice(visibleNavCount);

    return {
      parentCategories: enrichedParents,
      topParentCategories: topParents,
      moreParentCategories: moreParents
    };
  }, [categoriesList, locale, visibleNavCount]);

  // Check if a category (or any of its subcategories) is currently active in search
  const isCategoryActive = React.useCallback((item: any) => {
    if (pathname !== '/search' || !currentCategory) return false;
    const cur = currentCategory.toLowerCase();
    if ((item.slug || '').toLowerCase() === cur || (item.name || '').toLowerCase() === cur) return true;
    if (Array.isArray(item.subcategories)) {
      return item.subcategories.some(
        (sub: any) => (sub.slug || '').toLowerCase() === cur || (sub.name || '').toLowerCase() === cur
      );
    }
    return false;
  }, [pathname, currentCategory]);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage) return null;

  if (isCheckoutPage) {
    return (
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md text-foreground border-b border-border shadow-2xs">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-10 sm:h-14 w-auto flex items-center justify-center shrink-0" suppressHydrationWarning>
              <Image 
                src={navbarLogo} 
                alt="Charulata Lifestyle Logo" 
                width={160}
                height={48}
                priority
                suppressHydrationWarning
                className="h-10 sm:h-14 w-auto max-w-[140px] sm:max-w-[190px] object-contain"
              />
            </div>
          </Link>

          {/* Center Security Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs h-9" suppressHydrationWarning>
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <Lock size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span suppressHydrationWarning>{locale === 'bn' ? '১০০% নিরাপদ চেকআউট' : '100% Secure Checkout'}</span>
          </div>

          {/* Right Actions: Theme & Language (Height Matched h-11) */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              suppressHydrationWarning
              className={`h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-2xs focus-visible:outline-2 focus-visible:outline-primary ${
                theme === 'dark'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                  : 'bg-muted/80 hover:bg-muted text-foreground/80 hover:text-primary border-border/80'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={t('header.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} className="text-foreground/80" />
              )}
            </button>

            {/* Language Toggle */}
            <div className="flex items-center bg-muted/80 dark:bg-muted/60 border border-border/80 p-1 rounded-xl shrink-0 h-11 min-h-[44px] shadow-2xs group/lang" suppressHydrationWarning>
              <div className="pl-2 pr-1.5 text-primary flex items-center justify-center">
                <Languages size={16} className="text-primary group-hover/lang:rotate-12 transition-transform duration-300" />
              </div>
              <button
                onClick={() => setLocale('en')}
                suppressHydrationWarning
                className={`h-9 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus-visible:outline-2 focus-visible:outline-primary cursor-pointer min-w-[36px] ${
                  locale === 'en'
                    ? 'bg-primary text-white shadow-xs scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Switch to English"
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLocale('bn')}
                suppressHydrationWarning
                className={`h-9 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus-visible:outline-2 focus-visible:outline-primary cursor-pointer min-w-[36px] ${
                  locale === 'bn'
                    ? 'bg-primary text-white shadow-xs scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="বাংলা ভার্সন"
                aria-label="বাংলা ভার্সনে পরিবর্তন করুন"
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[100] w-full bg-card/95 backdrop-blur-md text-foreground border-b border-border/80 shadow-xs">
      {/* FIRST TOPBAR: Logo, Search, Actions */}
      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-3 sm:px-6 lg:px-8 xl:px-12 w-full flex h-14 sm:h-16 lg:h-20 items-center justify-between gap-1.5 sm:gap-4 lg:gap-6">
        
        {/* Left: Hamburger Icon (Mobile) & Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-9.5 h-9.5 min-w-[38px] min-h-[38px] sm:w-11 sm:h-11 flex items-center justify-center bg-primary text-white rounded-xl hover:opacity-90 transition-all focus-visible:outline-2 focus-visible:outline-primary cursor-pointer shadow-xs active:scale-95 shrink-0"
            aria-label={isMobileMenuOpen ? (locale === 'bn' ? 'মেনু বন্ধ করুন' : 'Close navigation menu') : (locale === 'bn' ? 'মেনু খুলুন' : 'Open navigation menu')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>

          <Link href="/" onClick={handleHomeClick} className="flex items-center shrink-0">
            <div className="relative h-9 sm:h-12 lg:h-14 w-auto flex items-center justify-center shrink-0 pl-0.5" suppressHydrationWarning>
              <Image 
                src={navbarLogo} 
                alt="Charulata Lifestyle Logo" 
                width={160}
                height={48}
                priority
                suppressHydrationWarning
                className="h-8.5 sm:h-11 lg:h-14 w-auto max-w-[100px] min-[390px]:max-w-[125px] sm:max-w-[160px] lg:max-w-[190px] object-contain hover:opacity-95 transition-opacity"
              />
            </div>
          </Link>
        </div>

        {/* Center: Search Field (Desktop) */}
        <div ref={desktopSearchRef} className="hidden lg:flex flex-1 min-w-0 max-w-xl xl:max-w-2xl mx-4 xl:mx-8 relative">
          <form onSubmit={handleSearch} role="search" className="relative flex items-center w-full shadow-2xs">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 text-muted-foreground pointer-events-none" size={18} />
              <input
                type="text"
                name="headerSearch"
                role="combobox"
                aria-expanded={isSearchFocused && (suggestions.length > 0 || !debouncedSearch)}
                aria-autocomplete="list"
                aria-label={t('header.searchPlaceholder')}
                autoComplete="off"
                spellCheck={false}
                data-form-type="other"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                suppressHydrationWarning
                className="w-full h-11 rounded-l-xl border border-border border-r-0 bg-muted/80 px-4 pl-11 pr-8 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/75 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all tracking-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1.5 transition-colors cursor-pointer"
                  aria-label={locale === 'bn' ? 'সার্চ মুছুন' : 'Clear search'}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button 
              type="submit" 
              suppressHydrationWarning
              aria-label={t('header.search')}
              className="bg-primary hover:bg-primary/90 text-white px-5 sm:px-6 h-11 rounded-r-xl border border-primary text-sm sm:text-base font-bold transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5 active:scale-98"
            >
              <Search size={16} className="text-white" />
              <span suppressHydrationWarning>{t('header.search')}</span>
            </button>
          </form>
          {renderSearchSuggestions()}
        </div>

        {/* Right: Actions (Hidden on mobile to eliminate duplicate shortcuts; BottomNav handles mobile navigation) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">

          {/* Desktop Theme Toggle (Laptop & Desktop) */}
          <button 
            onClick={toggleTheme}
            suppressHydrationWarning
            className={`hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary border shadow-2xs ${
              theme === 'dark'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                : 'bg-muted/80 hover:bg-muted text-foreground/80 hover:text-primary border-border/80'
            }`}
            aria-label={t('header.toggleTheme')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-foreground/80" />
            )}
          </button>

          {/* Desktop Language Toggle Pill (Laptop & Desktop) */}
          <div className="hidden lg:flex items-center bg-muted/80 dark:bg-muted/60 border border-border/80 p-1 rounded-xl shrink-0 h-11 min-h-[44px] shadow-2xs group/lang" suppressHydrationWarning>
            <div className="pl-2 pr-1.5 text-primary flex items-center justify-center">
              <Languages size={16} className="text-primary group-hover/lang:rotate-12 transition-transform duration-300" />
            </div>
            <button
              onClick={() => setLocale('en')}
              suppressHydrationWarning
              className={`h-9 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus-visible:outline-2 focus-visible:outline-primary cursor-pointer min-w-[36px] ${
                locale === 'en'
                  ? 'bg-primary text-white shadow-xs scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Switch to English"
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLocale('bn')}
              suppressHydrationWarning
              className={`h-9 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus-visible:outline-2 focus-visible:outline-primary cursor-pointer min-w-[36px] ${
                locale === 'bn'
                  ? 'bg-primary text-white shadow-xs scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="বাংলা ভার্সন"
              aria-label="বাংলা ভার্সনে পরিবর্তন করুন"
            >
              বাংলা
            </button>
          </div>

          {/* Wishlist (Love Icon - Opens Quick Wishlist Drawer) */}
          <button 
            type="button"
            onClick={() => setIsWishlistDrawerOpen(true)} 
            suppressHydrationWarning
            className={`w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all relative border shadow-2xs cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-primary ${
              wishlistCount > 0
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 ring-1 ring-rose-500/20 hover:bg-rose-500/20'
                : 'bg-muted/80 hover:bg-muted text-foreground/80 hover:text-rose-500 border-border/80'
            }`} 
            aria-label={wishlistCount > 0 ? `${t('header.wishlist')} (${wishlistCount})` : t('header.wishlist')}
            title={locale === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
          >
            <div className="relative flex items-center justify-center">
              <Heart size={20} className={`w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2] ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500/30' : 'text-foreground/80'}`} />
              {mounted && wishlistCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-600 !text-white text-[10px] font-black ring-2 ring-background shadow-xs leading-none select-none"
                  style={{ color: '#ffffff' }}
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </div>
          </button>

          {/* Cart (Shop Icon - Clear visual indicator when active) */}
          <Link 
            href="/cart"
            id="header-cart-icon"
            data-cart-icon
            suppressHydrationWarning
            className={`w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all relative border shadow-2xs cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-primary ${
              cartItemsCount > 0
                ? 'bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/20 hover:bg-primary/20'
                : 'bg-muted/80 hover:bg-muted text-foreground/80 hover:text-primary border-border/80'
            }`} 
            aria-label={cartItemsCount > 0 ? `${t('header.cart')} (${cartItemsCount} ${locale === 'bn' ? 'টি পণ্য' : 'items'})` : t('header.cart')}
            title={cartItemsCount > 0 ? `${cartItemsCount} ${locale === 'bn' ? 'টি পণ্য কার্টে আছে' : 'items in cart'}` : t('header.cart')}
          >
            <div className={`relative flex items-center justify-center ${isCartShake ? 'animate-header-cart-shake' : ''}`}>
              <ShoppingCart size={20} className={`w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2] ${cartItemsCount > 0 ? 'text-primary fill-primary/30' : 'text-foreground/80 group-hover:text-primary'}`} />
              {cartItemsCount > 0 && (
                <span 
                  className={`absolute -top-2 -right-2 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-primary !text-white text-[10px] font-black ring-2 ring-background shadow-xs leading-none select-none transition-transform duration-200 ${
                    isCartShake ? 'scale-125' : ''
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </div>
          </Link>

          {/* Profile / Auth Dropdown */}
          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all border border-amber-500/25 shadow-2xs cursor-pointer focus-visible:outline-2 focus-visible:outline-primary p-0.5 overflow-hidden"
                aria-label={t('header.myProfile')}
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-full h-full rounded-[10px] overflow-hidden relative flex items-center justify-center bg-primary/10 shrink-0">
                  <Image 
                    src={getFallbackAvatarUrl(user)} 
                    alt={user?.name || 'User Avatar'} 
                    fill
                    className="object-cover"
                  />
                </div>
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-60 origin-top-right rounded-2xl border border-border bg-card p-1.5 shadow-2xl focus:outline-none z-50 animate-in fade-in">
                    
                    {/* User Info Header */}
                    <div className="border-b border-border px-3.5 py-3 bg-muted/40 rounded-xl mb-1">
                      <p className="font-extrabold text-foreground font-serif text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{user?.email}</p>
                      {user?.role && ['super_admin', 'admin', 'staff'].includes(user.role) && (
                        <span className="inline-block mt-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                          {user.role}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center space-x-2.5 px-3.5 py-2.5 text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      <User size={15} className="text-muted-foreground" />
                      <span>{t('header.myProfile')}</span>
                    </Link>

                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center space-x-2.5 px-3.5 py-2.5 text-left text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors"
                    >
                      <History size={15} className="text-muted-foreground" />
                      <span>{t('header.myOrders')}</span>
                    </Link>

                    {['super_admin', 'admin', 'staff'].includes(user?.role || '') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex w-full items-center space-x-2.5 px-3.5 py-2.5 text-left text-xs font-extrabold text-primary hover:bg-primary/10 rounded-xl transition-colors border-t border-border mt-1 pt-2.5"
                      >
                        <LayoutDashboard size={15} />
                        <span>{t('header.adminDashboard')}</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2.5 px-3.5 py-2.5 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border-t border-border mt-1 pt-2.5 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>{t('header.logOut')}</span>
                    </button>

                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop Sign In button */}
              <Link
                href="/login"
                suppressHydrationWarning
                className="flex items-center space-x-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-primary/90 transition shadow-xs whitespace-nowrap h-11 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <User size={18} />
                <span suppressHydrationWarning>{t('header.signIn')}</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* MOBILE SEARCH BAR: Full-width accessible search input for mobile devices */}
      <div ref={mobileSearchRef} className="block lg:hidden px-3 sm:px-6 py-2 border-t border-border/40 bg-card relative shadow-2xs">
        <form onSubmit={handleSearch} role="search" className="relative flex items-center w-full gap-2">
          <div className="relative flex-1 flex items-center min-w-0">
            <Search className="absolute left-3 text-muted-foreground pointer-events-none" size={17} />
            <input
              type="text"
              name="mobileSearch"
              role="combobox"
              aria-expanded={isSearchFocused && (suggestions.length > 0 || !debouncedSearch)}
              aria-autocomplete="list"
              aria-label={t('header.searchPlaceholder')}
              autoComplete="off"
              spellCheck={false}
              data-form-type="other"
              placeholder={locale === 'bn' ? 'পণ্য খুঁজুন (যেমন: শাড়ি, পাঞ্জাবি)...' : 'Search products (e.g. Sarees, Panjabi)...'}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              suppressHydrationWarning
              className="w-full h-10.5 rounded-xl border border-border bg-muted/70 px-3 pl-9.5 pr-8 text-sm font-medium text-foreground placeholder:text-muted-foreground/75 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-2xs min-h-[42px] tracking-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-2 text-muted-foreground hover:text-foreground p-1.5 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                aria-label={locale === 'bn' ? 'সার্চ মুছুন' : 'Clear search'}
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            suppressHydrationWarning
            aria-label={t('header.search')}
            className="h-10.5 px-3 min-[380px]:px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 min-h-[42px] flex items-center justify-center gap-1.5"
          >
            <Search size={15} className="text-white" />
            <span className="hidden min-[380px]:inline" suppressHydrationWarning>{locale === 'bn' ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </form>
        {renderSearchSuggestions()}
      </div>

      {/* SECOND TOPBAR: Full-bleed Amazon/Daraz Style Primary Colored Navigation Bar */}
      {!isCheckoutPage && (
        <div className="w-full bg-primary text-white shadow-xs border-t border-primary/20 hidden lg:block">
          <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-12 w-full flex items-center h-10.5 gap-4">
            
            {/* Amazon-Style All Categories Mega Dropdown Trigger */}
            <div ref={allCategoriesRef} className="relative group shrink-0 h-full flex items-center">
              <button
                type="button"
                onClick={() => setIsAllCategoriesOpen(prev => !prev)}
                aria-expanded={isAllCategoriesOpen}
                aria-haspopup="true"
                className="flex items-center space-x-1.5 py-1.5 px-2 rounded-lg hover:bg-white/10 text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
              >
                <LayoutGrid size={16} className="text-white" />
                <span>{locale === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                <ChevronDown size={14} className={`text-white transition-transform duration-200 ${isAllCategoriesOpen ? 'rotate-180' : 'group-hover:rotate-180'}`} />
              </button>

              {/* Premium Flyout Mega Dropdown */}
              <div className={`absolute top-full left-0 pt-1 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${isAllCategoriesOpen ? 'block' : 'hidden group-hover:block group-focus-within:block'}`}>
                <div className="w-full bg-card dark:bg-card text-foreground border border-border/80 rounded-xl shadow-2xl overflow-visible">
                  <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border/60 rounded-t-xl">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{locale === 'bn' ? 'সকল বিভাগ' : 'All Departments'}</span>
                    <Sparkles size={13} className="text-primary" />
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30 no-scrollbar rounded-b-xl" suppressHydrationWarning>
                    <Link
                      href="/search"
                      onClick={() => setIsAllCategoriesOpen(false)}
                      className="px-4 py-2.5 bg-primary/5 hover:bg-primary hover:text-white text-primary font-bold text-xs flex items-center justify-between transition-colors group/all"
                    >
                      <span>{locale === 'bn' ? 'সকল পণ্য দেখুন' : 'View All Shop Products'}</span>
                      <ChevronRight size={14} className="group-hover/all:translate-x-1 transition-transform" />
                    </Link>

                    {mounted && parentCategories.length > 0 ? (
                      parentCategories.map((parent: any) => {
                        const hasSubs = parent.subcategories && parent.subcategories.length > 0;
                        return (
                          <div key={parent._id || parent.slug} className="relative group/parent">
                            <Link
                              href={`/search?category=${encodeURIComponent(parent.slug || parent.name)}`}
                              onClick={() => setIsAllCategoriesOpen(false)}
                              className="px-4 py-2.5 hover:bg-muted text-foreground hover:text-primary font-semibold text-xs flex items-center justify-between transition-colors"
                            >
                              <span className="truncate">{parent.displayName}</span>
                              {hasSubs ? (
                                <div className="flex items-center space-x-1 text-muted-foreground group-hover/parent:text-primary">
                                  <span className="text-[10px] font-medium opacity-60">({parent.subcategories.length})</span>
                                  <ChevronRight size={13} />
                                </div>
                              ) : (
                                <ChevronRight size={13} className="text-muted-foreground opacity-40" />
                              )}
                            </Link>

                            {/* Subcategory Flyout to Right on Hover/Focus */}
                            {hasSubs && (
                              <div className="absolute top-0 left-full pl-1.5 w-60 hidden group-hover/parent:block group-focus-within/parent:block z-50">
                                <div className="bg-card dark:bg-card text-foreground border border-border/80 rounded-xl shadow-2xl overflow-hidden py-1.5 divide-y divide-border/20">
                                  <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between bg-muted/40">
                                    <span className="truncate">{parent.displayName}</span>
                                    <span className="text-[10px] text-primary font-bold shrink-0">{parent.subcategories.length} {locale === 'bn' ? 'টি' : 'Items'}</span>
                                  </div>
                                  <div className="py-1 max-h-72 overflow-y-auto no-scrollbar">
                                    {parent.subcategories.map((sub: any) => (
                                      <Link
                                        key={sub._id || sub.slug}
                                        href={`/search?category=${encodeURIComponent(sub.slug || sub.name)}`}
                                        onClick={() => setIsAllCategoriesOpen(false)}
                                        className="px-4 py-2 hover:bg-muted text-foreground hover:text-primary font-medium text-xs flex items-center justify-between transition-colors group/subitem"
                                      >
                                        <span className="truncate group-hover/subitem:translate-x-0.5 transition-transform">{sub.displayName}</span>
                                        <ChevronRight size={12} className="text-muted-foreground opacity-50 group-hover/subitem:opacity-100 group-hover/subitem:text-primary shrink-0" />
                                      </Link>
                                    ))}
                                  </div>
                                  <div className="p-1.5 bg-muted/30">
                                    <Link
                                      href={`/search?category=${encodeURIComponent(parent.slug || parent.name)}`}
                                      onClick={() => setIsAllCategoriesOpen(false)}
                                      className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary text-[11px] font-bold flex items-center justify-between transition-all"
                                    >
                                      <span>{locale === 'bn' ? `সকল ${parent.displayName}` : `All ${parent.displayName}`}</span>
                                      <ChevronRight size={12} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : !mounted ? (
                      <div className="p-3 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-6 bg-muted/60 animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        {locale === 'bn' ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'No categories found'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-4 w-px bg-white/20 shrink-0" />

            {/* Dynamic Categories Navbar Strip */}
            <nav aria-label="Categories navigation" className="!bg-transparent !border-0 flex items-center gap-x-3 lg:gap-x-4 xl:gap-x-6 text-xs xl:text-sm font-extrabold flex-1 overflow-visible flex-nowrap tracking-wide" suppressHydrationWarning>
              {/* Home Link */}
              <Link
                href="/"
                onClick={handleHomeClick}
                className={`transition-colors py-1.5 px-2 rounded-lg hover:bg-white/10 shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white ${
                  pathname === '/' ? 'bg-white/20 text-white font-black' : 'text-white/95'
                }`}
              >
                {t('nav.home')}
              </Link>

              {/* Top Parent Categories with Subcategory Dropdowns */}
              {mounted && topParentCategories.map((item: any) => {
                const isActive = isCategoryActive(item);
                const hasSubs = item.subcategories && item.subcategories.length > 0;

                return (
                  <div key={item.slug || item._id} className="relative group shrink-0 h-full flex items-center">
                    <Link
                      href={`/search?category=${encodeURIComponent(item.slug || item.name)}`}
                      className={`transition-colors py-1.5 px-2 rounded-lg hover:bg-white/10 shrink-0 whitespace-nowrap flex items-center space-x-1 focus-visible:outline-2 focus-visible:outline-white ${
                        isActive ? 'bg-white/20 text-white font-black' : 'text-white/95'
                      }`}
                    >
                      <span>{item.displayName}</span>
                      {hasSubs && (
                        <ChevronDown size={13} className="text-white/80 group-hover:rotate-180 transition-transform duration-200" />
                      )}
                    </Link>

                    {/* Dropdown for child subcategories */}
                    {hasSubs && (
                      <div className="absolute top-full left-0 pt-1.5 w-60 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="w-full bg-card dark:bg-card text-foreground border border-border/80 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-border/20">
                          <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between bg-muted/40">
                            <span className="truncate">{item.displayName}</span>
                            <span className="text-[10px] text-primary font-bold shrink-0">{item.subcategories.length} {locale === 'bn' ? 'টি ক্যাটাগরি' : 'Items'}</span>
                          </div>
                          <div className="py-1">
                            {item.subcategories.map((sub: any) => {
                              const isSubActive = pathname === '/search' && currentCategory.toLowerCase() === (sub.slug || '').toLowerCase();
                              return (
                                <Link
                                  key={sub._id || sub.slug}
                                  href={`/search?category=${encodeURIComponent(sub.slug || sub.name)}`}
                                  className={`px-4 py-2 hover:bg-muted text-xs font-semibold flex items-center justify-between transition-colors group/sub ${
                                    isSubActive ? 'text-primary font-black bg-primary/10' : 'text-foreground hover:text-primary'
                                  }`}
                                >
                                  <span className="group-hover/sub:translate-x-1 transition-transform truncate">
                                    {sub.displayName}
                                  </span>
                                  <ChevronRight size={13} className="text-muted-foreground/50 group-hover/sub:text-primary group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                          <div className="p-1.5 bg-muted/30">
                            <Link
                              href={`/search?category=${encodeURIComponent(item.slug || item.name)}`}
                              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary text-[11px] font-bold flex items-center justify-between transition-all"
                            >
                              <span>{locale === 'bn' ? `সকল ${item.displayName} দেখুন` : `View All ${item.displayName}`}</span>
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* "More..." Dropdown for extra parent categories */}
              {mounted && moreParentCategories.length > 0 && (
                <div ref={moreDropdownRef} className="relative group/more shrink-0 h-full flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen(prev => !prev)}
                    aria-expanded={isMoreOpen}
                    aria-haspopup="true"
                    className="flex items-center space-x-1 py-1.5 px-2 rounded-lg hover:bg-white/10 text-white/95 font-extrabold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span>{locale === 'bn' ? 'আরও...' : 'More...'}</span>
                    <ChevronDown size={14} className={`text-white transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : 'group-hover/more:rotate-180'}`} />
                  </button>

                  <div className={`absolute top-full right-0 pt-1.5 w-60 z-[100] transition-all duration-200 ${isMoreOpen ? 'block' : 'hidden group-hover/more:block group-focus-within/more:block'}`}>
                    <div className="bg-card dark:bg-card text-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-80 overflow-y-auto no-scrollbar divide-y divide-border/30">
                      {moreParentCategories.map((item: any) => (
                        <Link
                          key={item.slug || item._id}
                          href={`/search?category=${encodeURIComponent(item.slug || item.name)}`}
                          onClick={() => setIsMoreOpen(false)}
                          className="px-4 py-2.5 hover:bg-muted text-foreground hover:text-primary font-semibold text-xs flex items-center justify-between transition-colors group/sub"
                        >
                          <span className="group-hover/sub:translate-x-0.5 transition-transform truncate">{item.displayName}</span>
                          <ChevronRight size={13} className="text-muted-foreground group-hover/sub:text-primary opacity-50 group-hover/sub:opacity-100 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admin Panel Link (Strictly role-protected) */}
              {mounted && isAuthenticated && ['super_admin', 'admin', 'staff'].includes(user?.role || '') && (
                <Link
                  href="/admin"
                  className={`transition-colors py-1.5 px-2 rounded-lg hover:bg-white/10 flex items-center space-x-1.5 shrink-0 whitespace-nowrap ml-auto focus-visible:outline-2 focus-visible:outline-white ${
                    pathname.startsWith('/admin') ? 'bg-white/20 text-white font-black' : 'text-white/95'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 sm:px-6 py-4 lg:hidden space-y-4 shadow-lg animate-fadeIn max-h-[85vh] overflow-y-auto no-scrollbar">
          <div className="flex flex-col space-y-1 w-full">
            {/* Home */}
            <Link
              href="/"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleHomeClick(e);
              }}
              className={`py-3 min-h-[44px] text-base font-extrabold border-b border-border/60 transition-colors flex items-center justify-between ${
                pathname === '/' ? 'text-primary font-black' : 'text-foreground hover:text-primary'
              }`}
            >
              <span>{t('nav.home')}</span>
            </Link>

            {/* Shop (All Products) */}
            <Link
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-3 min-h-[44px] text-base font-extrabold border-b border-border/60 transition-colors flex items-center justify-between ${
                pathname === '/search' && !currentCategory ? 'text-primary font-black' : 'text-foreground hover:text-primary'
              }`}
            >
              <span>{t('nav.shop')}</span>
              <ChevronRight size={16} className="text-muted-foreground/60" />
            </Link>

            {/* Categories Header */}
            <div className="pt-3 pb-1 flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/40" suppressHydrationWarning>
              <div className="flex items-center space-x-1.5">
                <LayoutGrid size={14} className="text-primary" />
                <span>{locale === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}</span>
              </div>
              {mounted && (
                <span className="text-[11px] font-bold text-primary">{parentCategories.length} {locale === 'bn' ? 'টি বিভাগ' : 'Depts'}</span>
              )}
            </div>

            {/* Parent Categories with Accordions */}
            {mounted && parentCategories.map((parent: any) => {
              const parentKey = parent.slug || parent._id;
              const hasSubs = parent.subcategories && parent.subcategories.length > 0;
              const isOpen = !!openMobileCategories[parentKey];
              const isParentActive = isCategoryActive(parent);

              if (!hasSubs) {
                return (
                  <Link
                    key={parentKey}
                    href={`/search?category=${encodeURIComponent(parent.slug || parent.name)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`py-3 min-h-[44px] text-sm sm:text-base font-bold border-b border-border/40 transition-colors flex items-center justify-between ${
                      isParentActive ? 'text-primary font-black' : 'text-foreground hover:text-primary'
                    }`}
                  >
                    <span>{parent.displayName}</span>
                    <ChevronRight size={16} className="text-muted-foreground/60" />
                  </Link>
                );
              }

              return (
                <div key={parentKey} className="border-b border-border/40">
                  <div className="flex items-center justify-between min-h-[44px]">
                    <Link
                      href={`/search?category=${encodeURIComponent(parent.slug || parent.name)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`py-2.5 text-sm sm:text-base font-bold transition-colors flex-1 truncate ${
                        isParentActive ? 'text-primary font-black' : 'text-foreground hover:text-primary'
                      }`}
                    >
                      <span>{parent.displayName}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleMobileCategory(parentKey)}
                      className="p-2.5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                      aria-label={`Toggle ${parent.displayName} subcategories`}
                    >
                      <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="pb-2.5 pl-3 pr-1 space-y-1 bg-muted/20 rounded-lg mb-2 pt-1 border border-border/30 animate-in fade-in duration-150">
                      <Link
                        href={`/search?category=${encodeURIComponent(parent.slug || parent.name)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 px-2.5 text-xs font-bold text-primary flex items-center justify-between hover:bg-primary/10 rounded-md transition-colors"
                      >
                        <span>{locale === 'bn' ? `সকল ${parent.displayName} পণ্য দেখুন` : `View All ${parent.displayName}`}</span>
                        <ChevronRight size={13} />
                      </Link>
                      {parent.subcategories.map((sub: any) => {
                        const isSubActive = pathname === '/search' && currentCategory.toLowerCase() === (sub.slug || '').toLowerCase();
                        return (
                          <Link
                            key={sub._id || sub.slug}
                            href={`/search?category=${encodeURIComponent(sub.slug || sub.name)}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`py-1.5 px-2.5 text-xs font-semibold rounded-md flex items-center justify-between transition-colors ${
                              isSubActive ? 'bg-primary text-white font-bold' : 'text-foreground/90 hover:bg-muted hover:text-primary'
                            }`}
                          >
                            <span className="truncate">{sub.displayName}</span>
                            <ChevronRight size={12} className={isSubActive ? 'text-white' : 'text-muted-foreground/50'} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Admin Panel Link */}
            {mounted && isAuthenticated && ['super_admin', 'admin', 'staff'].includes(user?.role || '') && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 min-h-[44px] text-base sm:text-lg font-extrabold text-[#c99a3c] border-b border-border/60 flex items-center space-x-2"
              >
                <LayoutDashboard size={18} />
                <span>{t('nav.dashboard')}</span>
              </Link>
            )}
          </div>

          <div className="pt-2">
            {mounted && isAuthenticated ? (
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-3 flex items-center space-x-3">
                  {user?.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt={user.name} 
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover border border-secondary/25"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">{locale === 'bn' ? 'লগইন করেছেন' : 'Logged in as'}</p>
                    <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center space-x-2 py-2.5 min-h-[44px] text-sm text-foreground/80 hover:text-foreground font-semibold"
                >
                  <User size={18} className="text-muted-foreground" />
                  <span>{t('header.myProfile')}</span>
                </Link>
                <Link
                  href="/profile?tab=orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center space-x-2 py-2.5 min-h-[44px] text-sm text-foreground/80 hover:text-foreground font-semibold"
                >
                  <History size={18} className="text-muted-foreground" />
                  <span>{t('header.myOrders')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 py-2.5 min-h-[44px] text-sm text-red-500 font-bold"
                >
                  <LogOut size={18} />
                  <span>{t('header.logOut')}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary py-3 min-h-[44px] text-sm font-bold text-white hover:opacity-90 shadow-sm"
              >
                <User size={16} />
                <span>{t('header.signIn')}</span>
              </Link>
            )}
          </div>
          
          {/* Drawer Quick Controls: Theme Toggle & Language Switcher */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex-1 h-11 min-h-[44px] px-3.5 rounded-xl border flex items-center justify-center space-x-2 text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                theme === 'dark'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                  : 'bg-muted/90 hover:bg-muted text-foreground/80 hover:text-primary border-border'
              }`}
              aria-label={t('header.toggleTheme')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} className="text-amber-400" />
                  <span>{locale === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-foreground/80" />
                  <span>{locale === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                </>
              )}
            </button>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-card/90 dark:bg-muted/60 border border-border/90 p-1 rounded-xl shrink-0 h-10 min-h-[40px] shadow-2xs group/lang">
              <div className="pl-2 pr-1 text-primary flex items-center justify-center">
                <Languages size={15} className="text-primary group-hover/lang:rotate-12 transition-transform duration-300" />
              </div>
              <button
                onClick={() => setLocale('en')}
                className={`h-8 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus:outline-none cursor-pointer min-w-[34px] ${
                  locale === 'en'
                    ? 'bg-primary text-white shadow-xs scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLocale('bn')}
                className={`h-8 px-2.5 flex items-center justify-center rounded-lg text-xs font-black transition-all focus:outline-none cursor-pointer min-w-[34px] ${
                  locale === 'bn'
                    ? 'bg-primary text-white shadow-xs scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="বাংলা ভার্সন"
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Slide-Over Drawer Component */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
      />
    </header>
  );
}
