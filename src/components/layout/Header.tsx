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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const desktopSearchRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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
      const popularTags = categoriesList.map((cat: any) => ({
        label: translateCategoryName(cat, locale),
        query: cat.slug || cat.name
      }));

      return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-card/98 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-muted-foreground mb-3 uppercase tracking-wider">
            <TrendingUp size={16} className="text-primary animate-pulse" />
            <span>{locale === 'bn' ? 'জনপ্রিয় ক্যাটাগরি সার্চ' : 'Popular Searches'}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
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
                className="px-3.5 py-2 rounded-xl bg-muted hover:bg-primary hover:text-white text-foreground text-xs sm:text-sm font-bold transition-all border border-border flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-xs"
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
      <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-card/98 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {isSearchingSuggestions ? (
          <div className="p-5 flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-bold text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={18} />
            <span>{locale === 'bn' ? 'পণ্য খোঁজা হচ্ছে...' : 'Searching products...'}</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="divide-y divide-border/60">
            <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
              <span>{locale === 'bn' ? 'পণ্য পরামর্শ' : 'Product Suggestions'}</span>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-extrabold">{suggestions.length} {locale === 'bn' ? 'টি পাওয়া গেছে' : 'found'}</span>
            </div>
            
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {suggestions.map((product: any) => {
                const img = product.productImages?.[0] || product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100';
                const price = Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price) ? product.salePrice : product.price;
                
                return (
                  <button
                    key={product._id || product.slug}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsSearchFocused(false);
                      router.push(`/products/${product.slug}`);
                    }}
                    className="w-full px-4 py-3 flex items-center space-x-3.5 text-left hover:bg-primary/10 transition-colors group cursor-pointer"
                  >
                    <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden border border-border shrink-0 bg-muted shadow-sm">
                      <Image 
                        src={img} 
                        alt={product.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold text-foreground truncate group-hover:text-primary transition-colors font-serif leading-tight">
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
              className="w-full px-4 py-3 bg-muted/80 hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm font-extrabold text-foreground flex items-center justify-between cursor-pointer border-t border-border"
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

  const sortedCategories = React.useMemo(() => {
    if (!Array.isArray(categoriesList)) return [];

    // Priority keywords for main navbar display (Women's Fashion, Men's Fashion, Sarees, Panjabi, Kurtis)
    const priorityKeywords = [
      'women', 'men', 'saree', 'sharee', 'panjabi', 'kurti', 'shirt', 'shart', 'tshirt', 't-shirt',
      'jewelry', 'beauty', 'gadget', 'আতর', 'ব্যাগ'
    ];

    const getPriority = (cat: any) => {
      const nameLower = (cat.name || '').toLowerCase();
      const slugLower = (cat.slug || '').toLowerCase();
      const nameBnLower = (cat.nameBn || '').toLowerCase();

      for (let i = 0; i < priorityKeywords.length; i++) {
        const kw = priorityKeywords[i];
        if (nameLower.includes(kw) || slugLower.includes(kw) || nameBnLower.includes(kw)) {
          return i;
        }
      }
      return 999;
    };

    return [...categoriesList].sort((a: any, b: any) => getPriority(a) - getPriority(b));
  }, [categoriesList]);

  const topCategories = React.useMemo(() => {
    // Show top 5 core departments for a spacious, luxury, non-cluttered navbar strip
    return sortedCategories.slice(0, 5).map((cat: any) => ({
      name: translateCategoryName(cat, locale),
      key: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      href: `/search?category=${encodeURIComponent(cat.slug || cat.name)}`
    }));
  }, [sortedCategories, locale]);

  const moreCategories = React.useMemo(() => {
    // All other categories in clean "More..." dropdown
    return sortedCategories.slice(5).map((cat: any) => ({
      name: translateCategoryName(cat, locale),
      key: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      href: `/search?category=${encodeURIComponent(cat.slug || cat.name)}`
    }));
  }, [sortedCategories, locale]);

  const menuItems = React.useMemo(() => {
    const baseItems = [
      { name: t('nav.home'), key: 'home', href: '/' },
      { name: t('nav.shop'), key: 'shop', href: '/search' },
    ];
    return [...baseItems, ...topCategories];
  }, [topCategories, t]);

  const mobileMenuItems = React.useMemo(() => {
    const baseItems = [
      { name: t('nav.home'), key: 'home', href: '/' },
      { name: t('nav.shop'), key: 'shop', href: '/search' },
    ];
    const allCats = categoriesList.map((cat: any) => ({
      name: translateCategoryName(cat, locale),
      key: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
      href: `/search?category=${encodeURIComponent(cat.slug || cat.name)}`
    }));
    return [...baseItems, ...allCats];
  }, [categoriesList, t, locale]);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage) return null;

  if (isCheckoutPage) {
    return (
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md text-foreground border-b border-border shadow-2xs">
        <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-10 sm:h-14 w-auto flex items-center justify-center shrink-0">
              <Image 
                src={navbarLogo} 
                alt="Charulata Lifestyle Logo" 
                width={160}
                height={48}
                priority
                className="h-10 sm:h-14 w-auto max-w-[140px] sm:max-w-[190px] object-contain"
              />
            </div>
          </Link>

          {/* Center Security Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs h-9">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <Lock size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{locale === 'bn' ? '১০০% নিরাপদ চেকআউট' : '100% Secure Checkout'}</span>
          </div>

          {/* Right Actions: Theme & Language (Height Matched h-10) */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`h-10 w-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all cursor-pointer border shadow-2xs ${
                theme === 'dark'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                  : 'bg-muted/90 hover:bg-muted text-foreground/80 hover:text-primary border-border'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={19} className="text-amber-400" />
              ) : (
                <Moon size={19} className="text-foreground/80" />
              )}
            </button>

            {/* Language Toggle */}
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
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[100] w-full bg-card/95 backdrop-blur-md text-foreground border-b border-border/80 shadow-xs">
      {/* FIRST TOPBAR: Logo, Search, Actions */}
      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Hamburger Icon (Mobile) & Logo */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-primary text-white rounded-xl hover:opacity-90 transition-all focus:outline-none cursor-pointer shadow-xs active:scale-95 shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} className="text-white w-6 h-6" /> : <Menu size={24} className="text-white w-6 h-6" />}
          </button>

          <Link href="/" onClick={handleHomeClick} className="flex items-center shrink-0">
            <div className="relative h-10 sm:h-14 w-auto flex items-center justify-center shrink-0 pl-0.5">
              <Image 
                src={navbarLogo} 
                alt="Charulata Lifestyle Logo" 
                width={160}
                height={48}
                priority
                className="h-10 sm:h-14 w-auto max-w-[130px] sm:max-w-[190px] object-contain hover:opacity-95 transition-opacity"
              />
            </div>
          </Link>
        </div>

        {/* Center: Search Field (Desktop) */}
        <div ref={desktopSearchRef} className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8 relative">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 text-muted-foreground pointer-events-none" size={18} />
              <input
                type="text"
                name="headerSearch"
                autoComplete="off"
                spellCheck={false}
                data-form-type="other"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full rounded-l-xl border border-border border-r-0 bg-muted/90 px-4 py-2.5 pl-11 pr-8 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/75 focus:border-primary focus:bg-background focus:outline-none transition-all tracking-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground p-1.5 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-r-xl border border-primary text-sm sm:text-base font-bold transition-all cursor-pointer shadow-xs"
            >
              {t('header.search')}
            </button>
          </form>
          {renderSearchSuggestions()}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Desktop Theme Toggle (Laptop & Desktop) */}
          <button 
            onClick={toggleTheme}
            className={`hidden md:flex w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl transition-all cursor-pointer focus:outline-none border shadow-2xs ${
              theme === 'dark'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                : 'bg-muted/90 hover:bg-muted text-foreground/80 hover:text-primary border-border'
            }`}
            aria-label={t('header.toggleTheme')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={22} className="text-amber-400" />
            ) : (
              <Moon size={22} className="text-foreground/80" />
            )}
          </button>

          {/* Desktop Language Toggle Pill (Laptop & Desktop) */}
          <div className="hidden md:flex items-center bg-card/90 dark:bg-muted/60 border border-border/90 p-1 rounded-xl shrink-0 h-10 min-h-[40px] shadow-2xs group/lang">
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

          {/* Wishlist (Love Icon - Opens Quick Wishlist Drawer) */}
          <button 
            type="button"
            onClick={() => setIsWishlistDrawerOpen(true)} 
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all relative border border-rose-500/20 shadow-2xs cursor-pointer active:scale-95" 
            aria-label={t('header.wishlist')}
            title={locale === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
          >
            <div className="relative flex items-center justify-center">
              <Heart size={22} className="w-5.5 h-5.5 text-rose-500 fill-rose-500/25 stroke-[2.25]" />
              {mounted && wishlistCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 !text-white text-[11px] font-black ring-2 ring-background shadow-xs leading-none select-none"
                  style={{ color: '#ffffff' }}
                >
                  {wishlistCount}
                </span>
              )}
            </div>
          </button>

          {/* Cart (Shop Icon) */}
          <Link 
            href="/cart"
            id="header-cart-icon"
            data-cart-icon
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all relative border border-primary/20 shadow-2xs cursor-pointer active:scale-95" 
            aria-label={t('header.cart')}
          >
            <div className={`relative flex items-center justify-center ${isCartShake ? 'animate-header-cart-shake' : ''}`}>
              <ShoppingCart size={22} className="w-5.5 h-5.5 text-primary fill-primary/25 stroke-[2.25]" />
              {cartItemsCount > 0 && (
                <span 
                  className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary !text-white text-[11px] font-black ring-2 ring-background shadow-xs leading-none select-none transition-transform duration-200 ${
                    isCartShake ? 'scale-125' : ''
                  }`}
                  style={{ color: '#ffffff' }}
                >
                  {cartItemsCount}
                </span>
              )}
            </div>
          </Link>

          {/* Profile / Auth Dropdown */}
          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all border border-amber-500/20 shadow-2xs cursor-pointer focus:outline-none p-0.5 overflow-hidden"
                aria-label={t('header.myProfile')}
              >
                <div className="w-full h-full rounded-[10px] overflow-hidden relative flex items-center justify-center bg-primary/10 shrink-0">
                  {user?.profileImage ? (
                    <Image 
                      src={user.profileImage} 
                      alt={user.name || 'User'} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 font-serif">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
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
                className="hidden sm:flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white hover:opacity-90 transition shadow-md whitespace-nowrap min-h-[44px]"
              >
                <User size={16} />
                <span>{t('header.signIn')}</span>
              </Link>
              {/* Mobile Sign In icon */}
              <Link
                href="/login"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center sm:hidden bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all border border-amber-500/20 shadow-2xs"
                aria-label={t('header.signIn')}
              >
                <User size={22} className="w-5.5 h-5.5 text-amber-600 dark:text-amber-400 fill-amber-500/25 stroke-[2.25]" />
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* MOBILE SEARCH BAR: Full-width modern search input for mobile devices */}
      <div ref={mobileSearchRef} className="block md:hidden px-3.5 pb-2.5 pt-1.5 border-t border-border/40 bg-card relative shadow-xs">
        <form onSubmit={handleSearch} className="relative flex items-center w-full">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 text-muted-foreground pointer-events-none" size={17} />
            <input
              type="text"
              name="mobileSearch"
              autoComplete="off"
              spellCheck={false}
              data-form-type="other"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full rounded-xl border border-border bg-muted/90 px-3.5 py-2.5 pl-10 pr-8 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/75 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-2xs min-h-[44px] tracking-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-2 text-muted-foreground hover:text-foreground p-2 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className="ml-2 inline-flex items-center space-x-1.5 bg-primary hover:opacity-90 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 min-h-[44px]"
          >
            <Search size={14} className="text-white" />
            <span>{locale === 'bn' ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </form>
        {renderSearchSuggestions()}
      </div>

      {/* SECOND TOPBAR: Amazon-Style Primary Colored Navigation Bar (Hidden on Checkout Page for Distraction-Free UX) */}
      {!isCheckoutPage && (
        <div className="w-full bg-transparent hidden md:block pt-2 pb-1">
          <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full">
            <div className="w-full bg-primary text-white shadow-md rounded-[2px] px-4 sm:px-5 flex items-center h-11 border border-primary/20 gap-3">
              
              {/* Amazon-Style All Categories Mega Dropdown Trigger */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  className="flex items-center space-x-1.5 py-2 border-b-2 border-transparent text-white-force hover-gold font-extrabold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap"
                >
                  <LayoutGrid size={15} className="text-white-force group-hover:text-[#c99a3c]" />
                  <span>{locale === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                  <ChevronDown size={14} className="text-white-force group-hover:text-[#c99a3c] group-hover:rotate-180 transition-transform duration-200" />
                </button>

                {/* Premium Site-Matching Dropdown Overlay with Zero-Gap Hover Bridge */}
                <div className="absolute top-full left-0 pt-1 w-64 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="w-full bg-card/98 dark:bg-card/98 backdrop-blur-xl text-foreground border border-border/80 rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between border-b border-border/60">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{locale === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                      <Sparkles size={13} className="text-primary" />
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/30 no-scrollbar">
                      <Link
                        href="/search"
                        className="px-4 py-2.5 bg-primary/5 hover:bg-primary hover:text-white text-primary font-bold text-xs flex items-center justify-between transition-colors group/all"
                      >
                        <span>{locale === 'bn' ? 'সকল পণ্য দেখুন' : 'View All Shop Products'}</span>
                        <ChevronRight size={14} className="group-hover/all:translate-x-1 transition-transform" />
                      </Link>

                      {categoriesList.length > 0 ? (
                        categoriesList.map((cat: any) => (
                          <Link
                            key={cat._id || cat.slug}
                            href={`/search?category=${encodeURIComponent(cat.slug || cat.name)}`}
                            className="px-4 py-2.5 hover:bg-muted text-foreground hover:text-primary font-semibold text-xs flex items-center justify-between transition-colors group/item"
                          >
                            <span className="group-hover/item:translate-x-0.5 transition-transform truncate">{translateCategoryName(cat, locale)}</span>
                            <ChevronRight size={13} className="text-muted-foreground group-hover/item:text-primary opacity-50 group-hover/item:opacity-100 transition-all shrink-0" />
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                          {locale === 'bn' ? 'কোন ক্যাটাগরি পাওয়া যায়নি' : 'No categories found'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Categories Navbar Strip */}
              <div className="flex items-center space-x-7 sm:space-x-8 lg:space-x-9 text-xs sm:text-sm font-extrabold w-full overflow-visible flex-nowrap tracking-wide">
                {menuItems.map((item) => {
                  let isActive = false;
                  if (item.key === 'home') {
                    isActive = pathname === '/';
                  } else if (item.key === 'shop') {
                    isActive = pathname === '/search' && !currentCategory;
                  } else {
                    isActive = pathname === '/search' && currentCategory.toLowerCase() === item.key.toLowerCase();
                  }
                  
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={(e) => {
                        if (item.key === 'home') {
                          handleHomeClick(e);
                        }
                      }}
                      className={`transition-colors py-2 border-b-2 hover-gold shrink-0 whitespace-nowrap ${
                        isActive ? 'text-active-gold border-b-2 font-black' : 'border-transparent text-white-force'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* "More..." Dropdown for extra categories */}
                {moreCategories.length > 0 && (
                  <div ref={moreDropdownRef} className="relative group/more shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMoreOpen(prev => !prev)}
                      className="flex items-center space-x-1 py-2 text-white-force hover-gold font-extrabold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <span>{locale === 'bn' ? 'আরও...' : 'More...'}</span>
                      <ChevronDown size={14} className={`text-white-force group-hover/more:text-[#c99a3c] transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-[#c99a3c]' : 'group-hover/more:rotate-180'}`} />
                    </button>

                    <div className={`absolute top-full right-0 pt-2 w-56 z-[100] transition-all duration-200 ${isMoreOpen ? 'block' : 'hidden group-hover/more:block'}`}>
                      <div className="bg-card dark:bg-card text-foreground border border-border/80 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-80 overflow-y-auto no-scrollbar divide-y divide-border/30">
                        {moreCategories.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setIsMoreOpen(false)}
                            className="px-4 py-2.5 hover:bg-muted text-foreground hover:text-primary font-semibold text-xs flex items-center justify-between transition-colors group/sub"
                          >
                            <span className="group-hover/sub:translate-x-0.5 transition-transform truncate">{item.name}</span>
                            <ChevronRight size={13} className="text-muted-foreground group-hover/sub:text-primary opacity-50 group-hover/sub:opacity-100 transition-all shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Admin Panel */}
                {mounted && isAuthenticated && ['super_admin', 'admin', 'staff'].includes(user?.role || '') && (
                  <Link
                    href="/admin"
                    className={`transition-colors py-2 border-b-2 hover-gold flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
                      pathname.startsWith('/admin') ? 'text-active-gold border-b-2 font-black' : 'border-transparent text-white-force'
                    }`}
                  >
                    <LayoutDashboard size={15} />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-card px-5 py-4 md:hidden space-y-4 shadow-lg animate-fadeIn">
          <div className="flex flex-col space-y-1 w-full">
            {mobileMenuItems.map((item) => {
              let isActive = false;
              if (item.key === 'home') {
                isActive = pathname === '/';
              } else if (item.key === 'shop') {
                isActive = pathname === '/search' && !currentCategory;
              } else {
                isActive = pathname === '/search' && currentCategory.toLowerCase() === item.key.toLowerCase();
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (item.key === 'home') {
                      handleHomeClick(e);
                    }
                  }}
                  className={`py-3 min-h-[44px] text-base sm:text-lg font-extrabold border-b border-border/60 transition-colors flex items-center justify-between ${
                    isActive ? 'text-primary font-black' : 'text-foreground hover:text-primary'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
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
