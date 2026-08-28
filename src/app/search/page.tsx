'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from '@/components/SafeImage';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productApi';
import ProductCard from '@/components/common/ProductCard';
import { Search, Loader2, ArrowLeft, Star, ShoppingBag, Grid, List, Heart, Eye, Share2, Check, ArrowUpDown, ChevronDown, SlidersHorizontal, X, Filter, PackageOpen, SearchX, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/store/api/userApi';
import { getGuestWishlist, toggleGuestWishlist } from '@/utils/guestWishlist';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/i18n/LanguageContext';
import { translateCategoryName } from '@/utils/categoryTranslator';

// ─── Reusable Empty State Component ───────────────────────────────────────
interface EmptyProductStateProps {
  variant: 'empty-category' | 'no-results';
  onReset?: () => void;
  onViewAll?: () => void;
  locale?: string;
}

const EmptyProductState: React.FC<EmptyProductStateProps> = ({
  variant,
  onReset,
  onViewAll,
  locale = 'bn',
}) => {
  const isCategoryEmpty = variant === 'empty-category';

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto my-8 shadow-xs animate-fadeIn flex flex-col items-center">
      {/* Visual Icon Badge */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/60 dark:bg-muted/30 border border-border/60 flex items-center justify-center mb-6 text-muted-foreground/70 shadow-inner">
        {isCategoryEmpty ? (
          <PackageOpen size={48} className="stroke-[1.5]" />
        ) : (
          <SearchX size={48} className="stroke-[1.5]" />
        )}
      </div>

      {/* Heading Text */}
      <h3 className="text-lg sm:text-xl font-extrabold text-foreground font-serif tracking-tight mb-2">
        {isCategoryEmpty
          ? (locale === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই' : 'No products in this category yet')
          : (locale === 'bn' ? 'এই ফিল্টারে কোনো পণ্য পাওয়া যায়নি' : 'No products match your filters')}
      </h3>

      {/* Subtext */}
      <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-sm mb-6 leading-relaxed">
        {isCategoryEmpty
          ? (locale === 'bn' ? 'শীঘ্রই নতুন পণ্য যুক্ত হবে' : 'New products will be added to this category soon')
          : (locale === 'bn' ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন' : 'Try adjusting or clearing your active filters to see more results')}
      </p>

      {/* Action Button */}
      {isCategoryEmpty ? (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
        >
          <span>{locale === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}</span>
          <ArrowRight size={14} className="stroke-[2.5]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
        >
          <RotateCcw size={14} className="stroke-[2.5]" />
          <span>{locale === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
        </button>
      )}
    </div>
  );
};

// ─── Skeleton Components for Search / Product Listing ──────────────────────
const ProductGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 animate-fadeIn">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col bg-card border border-border/70 rounded-2xl overflow-hidden shadow-2xs">
        <div className="aspect-square shimmer-bg" />
        <div className="p-3.5 space-y-2.5">
          <div className="h-3 shimmer-bg rounded-md w-1/3" />
          <div className="h-4 shimmer-bg rounded-md w-4/5" />
          <div className="h-3 shimmer-bg rounded-md w-1/2" />
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="h-5 shimmer-bg rounded-md w-16" />
            <div className="h-8 w-20 shimmer-bg rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="flex flex-col space-y-4 animate-fadeIn">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col sm:flex-row bg-card border border-border/70 rounded-2xl p-4 gap-5 items-center sm:items-start">
        <div className="w-full sm:w-48 aspect-[4/3] sm:aspect-square rounded-xl shimmer-bg shrink-0" />
        <div className="flex-1 space-y-3 w-full py-1">
          <div className="h-3 shimmer-bg rounded-md w-24" />
          <div className="h-5 shimmer-bg rounded-md w-2/3" />
          <div className="h-3 shimmer-bg rounded-md w-1/2" />
          <div className="h-5 shimmer-bg rounded-md w-28 pt-2" />
          <div className="flex gap-2.5 pt-2">
            <div className="h-9 w-28 shimmer-bg rounded-xl" />
            <div className="h-9 w-20 shimmer-bg rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SearchPageSkeleton = () => (
  <div className="bg-background min-h-screen pb-16">
    <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 shimmer-bg rounded-md mb-6" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block space-y-6">
          <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-4">
            <div className="h-5 w-32 shimmer-bg rounded-md" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 shimmer-bg rounded-xl" />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 space-y-6">
          <div className="bg-card border border-border/70 rounded-2xl p-4 flex justify-between items-center">
            <div className="h-5 w-40 shimmer-bg rounded-md" />
            <div className="h-9 w-32 shimmer-bg rounded-xl" />
          </div>
          <ProductGridSkeleton count={12} />
        </main>
      </div>
    </div>
  </div>
);

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t, locale } = useTranslation();
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const [guestWishlist, setGuestWishlist] = useState<string[]>([]);

  useEffect(() => {
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

  // URL params
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlColor = searchParams.get('color') || '';
  const urlPageParam = searchParams.get('page');
  const initialLoadedPage = Math.max(1, parseInt(urlPageParam || '1', 10));

  // Filter States
  const [searchText, setSearchText] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState(40000);
  const [selectedColor, setSelectedColor] = useState<string>(urlColor);
  const [sortBy, setSortBy] = useState('price-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load More Pagination State
  const [currentPage, setCurrentPage] = useState<number>(initialLoadedPage);
  const itemsPerPage = 12;
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

  // Sync state when URL updates
  useEffect(() => {
    setSearchText(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setSelectedColor(urlColor);
  }, [urlColor]);

  // URL Sync Helper (Shallow routing without adding to history stack)
  const updateUrlPage = React.useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    const target = qs ? `/search?${qs}` : '/search';
    router.replace(target, { scroll: false });
  }, [searchParams, router]);

  // Reset pagination to page 1 when any filter/search changes
  const prevFiltersRef = React.useRef({ searchText, selectedCategory, priceRange, selectedColor, sortBy });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.searchText !== searchText ||
      prev.selectedCategory !== selectedCategory ||
      prev.priceRange !== priceRange ||
      prev.selectedColor !== selectedColor ||
      prev.sortBy !== sortBy
    ) {
      prevFiltersRef.current = { searchText, selectedCategory, priceRange, selectedColor, sortBy };
      setCurrentPage(1);
      setAccumulatedProducts([]);
      updateUrlPage(1);
    }
  }, [searchText, selectedCategory, priceRange, selectedColor, sortBy, updateUrlPage]);

  // Query Backend Products (Initial batch loads all pages up to initialLoadedPage if shared URL has ?page=3)
  const isInitialBatch = currentPage === initialLoadedPage && initialLoadedPage > 1 && accumulatedProducts.length === 0;
  const fetchLimit = isInitialBatch ? initialLoadedPage * itemsPerPage : itemsPerPage;
  const fetchPage = isInitialBatch ? 1 : currentPage;

  const queryParams: Record<string, any> = {
    sort: sortBy,
    maxPrice: priceRange,
    page: fetchPage,
    limit: fetchLimit
  };

  if (searchText.trim()) {
    queryParams.search = searchText.trim();
  }
  if (selectedCategory && selectedCategory !== 'all') {
    queryParams.category = selectedCategory;
  }
  if (selectedColor) {
    queryParams.color = selectedColor;
  }

  const { data: productsResponse, isLoading, isFetching } = useGetProductsQuery(queryParams);
  const { data: categoriesResponse } = useGetCategoriesQuery({});
  const { data: allProductsResponse } = useGetProductsQuery({ limit: 500 });

  const categories = categoriesResponse?.data?.categories || categoriesResponse?.data || categoriesResponse || [];
  const allProductsList = allProductsResponse?.data?.products || allProductsResponse?.data || allProductsResponse?.products || [];

  const totalProducts = productsResponse?.total || productsResponse?.data?.total || productsResponse?.data?.products?.length || accumulatedProducts.length || 0;
  const totalPages = productsResponse?.pages || productsResponse?.data?.pages || Math.ceil(totalProducts / itemsPerPage) || 1;

  // Accumulate products for Load More
  useEffect(() => {
    if (productsResponse) {
      const incoming = productsResponse?.data?.products || productsResponse?.data || productsResponse?.products || [];
      if (Array.isArray(incoming)) {
        if (currentPage === 1 || isInitialBatch) {
          setAccumulatedProducts(incoming);
        } else {
          setAccumulatedProducts(prev => {
            const existingIds = new Set(prev.map((p: any) => p._id));
            const fresh = incoming.filter((p: any) => !existingIds.has(p._id));
            return [...prev, ...fresh];
          });
        }
      }
      setIsFetchingMore(false);
    }
  }, [productsResponse, currentPage, isInitialBatch]);

  const handleLoadMore = React.useCallback(() => {
    if (currentPage < totalPages && !isLoading && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateUrlPage(nextPage);
    }
  }, [currentPage, totalPages, isLoading, isFetchingMore, updateUrlPage]);

  // Safe helper to extract category string whether populated object or raw ID/string
  const getProductCategory = (p: any): string => {
    if (!p.category) return '';
    if (typeof p.category === 'object') {
      return p.category.slug || p.category.name || '';
    }
    return p.category;
  };

  const filteredProducts = accumulatedProducts.filter((p: any) => {
    // 1) Price range check
    const effectivePrice = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price || 0;
    if (effectivePrice > priceRange) return false;

    // 2) Color check
    if (!selectedColor) return true;
    const target = selectedColor.toLowerCase();
    const hexMap: Record<string, string[]> = {
      'magenta': ['#d946ef', 'magenta', 'pink', 'rose', 'crimson', 'red'],
      'purple': ['#a855f7', 'purple', 'violet', 'lavender', 'mauve'],
      'gold': ['#c99a3c', 'gold', 'yellow', 'golden', 'amber'],
      'white': ['#ffffff', 'white', 'cream', 'ivory'],
      'dark': ['#1e293b', 'dark', 'black', 'navy', 'blue', 'royal blue'],
      'green': ['#10b981', 'green', 'emerald', 'olive']
    };
    const keywords = hexMap[target] || [target];

    const pColors = (p.colors || []).map((c: string) => String(c).toLowerCase());
    const pVariants = (p.variants || []).map((v: any) => String(v.color || '').toLowerCase());
    const pTitle = String(p.title || '').toLowerCase();
    const pTags = (p.tags || []).map((t: string) => String(t).toLowerCase());

    return keywords.some((kw: string) => {
      const lowerKw = kw.toLowerCase();
      return (
        pColors.some((c: string) => c.includes(lowerKw)) ||
        pVariants.some((v: string) => v.includes(lowerKw)) ||
        pTitle.includes(lowerKw) ||
        pTags.some((t: string) => t.includes(lowerKw))
      );
    });
  });

  // Client-side sort for instant feedback matching effective price
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const priceA = a.salePrice && a.salePrice > 0 ? a.salePrice : a.price || 0;
    const priceB = b.salePrice && b.salePrice > 0 ? b.salePrice : b.price || 0;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  const isAnyFilterActive = Boolean(searchText.trim()) || (Boolean(selectedColor) && selectedColor.trim() !== '') || priceRange < 40000;

  const handleResetOnlyFilters = () => {
    setSearchText('');
    setSelectedColor('');
    setPriceRange(40000);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  };

  const handleViewAllProducts = () => {
    setSearchText('');
    setSelectedCategory('all');
    setSelectedColor('');
    setPriceRange(40000);
    router.push('/search');
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('all');
    setPriceRange(40000);
    setSelectedColor('');
    router.push('/search');
  };

  const handleCopyDesign = (id: string, slug: string) => {
    const link = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic list of categories from backend
  const dbCategoriesList = Array.isArray(categories) ? categories : [];

  const categoryOptions = [
    { id: 'all', label: t('search.allPieces') },
    ...dbCategoriesList.map((c: any) => ({
      id: c.slug || c._id,
      label: translateCategoryName(c, locale)
    }))
  ];

  // Compute live category count from all master products
  const getCategoryProductCount = (catId: string) => {
    if (catId === 'all') {
      return allProductsList.length || totalProducts || 0;
    }
    return allProductsList.filter((p: any) => {
      const pCat = getProductCategory(p).toLowerCase();
      const pCatId = typeof p.category === 'object' ? p.category?._id?.toString() : p.category?.toString();
      const target = catId.toLowerCase();
      return pCat === target || pCatId === catId || pCat.includes(target);
    }).length;
  };

  return (
    <div className="max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-10 flex-1 w-full bg-background text-foreground min-h-screen">

      {/* Breadcrumbs */}
      <div className="text-xs sm:text-sm text-muted-foreground mb-6 flex items-center space-x-1.5 font-semibold">
        <Link href="/" className="hover:text-primary transition-colors">{t('search.breadcrumbHome')}</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-primary transition-colors">{t('search.breadcrumbShop')}</Link>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="text-foreground capitalize font-bold">
              {selectedCategory === 'all' ? t('search.allPieces') : (t(`nav.${selectedCategory.toLowerCase()}`) || translateCategoryName(selectedCategory, locale))}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Sidebar (Refine Filters) */}
        <aside className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-extrabold text-foreground tracking-wide font-serif">{t('search.refine')}</h2>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t('search.reset')}
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground opacity-90">{t('search.searchLabel')}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('search.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/70 px-4 py-2.5 pl-10 text-xs sm:text-sm font-medium text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3 text-muted-foreground" size={16} />
            </div>
          </div>

          {/* Categories */}
          {(() => {
            const filteredCategoryOptions = categoryOptions.filter((cat) =>
              cat.label.toLowerCase().includes(categorySearchQuery.toLowerCase().trim())
            );
            const displayedCategoryOptions = showAllCategories
              ? filteredCategoryOptions
              : filteredCategoryOptions.slice(0, 6);

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground opacity-90">{t('search.category')}</label>
                  {categoryOptions.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="text-xs font-extrabold text-primary hover:underline transition cursor-pointer"
                    >
                      {showAllCategories ? 'Less -' : `View All (${categoryOptions.length - 1}) +`}
                    </button>
                  )}
                </div>

                {categoryOptions.length > 8 && showAllCategories && (
                  <input
                    type="text"
                    placeholder="Filter categories..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none mb-1"
                  />
                )}

                <div className={`space-y-1.5 ${showAllCategories && categoryOptions.length > 6 ? 'max-h-64 overflow-y-auto pr-1' : ''}`}>
                  {displayedCategoryOptions.map((cat) => {
                    const isAll = cat.id === 'all';
                    const isActive = isAll
                      ? !selectedCategory || selectedCategory.toLowerCase() === 'all'
                      : (selectedCategory || '').toLowerCase() === cat.id.toLowerCase();
                    const count = getCategoryProductCount(cat.id);

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.id === 'all') {
                            router.push('/search');
                          } else {
                            router.push(`/search?category=${encodeURIComponent(cat.id)}`);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${isActive
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs font-black'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <span className="capitalize truncate mr-2 font-serif">{cat.label}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-black shrink-0 ${isActive ? 'bg-primary text-white-force shadow-xs' : 'bg-muted text-muted-foreground'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground opacity-90">{t('search.priceRange')}</label>
              <span className="text-xs sm:text-sm font-mono font-extrabold text-primary">৳0 - ৳{priceRange.toLocaleString()}</span>
            </div>
            {(() => {
              const fillPercent = Math.min(Math.max((priceRange / 40000) * 100, 0), 100);
              return (
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--primary, #e11d48) 0%, var(--primary, #e11d48) ${fillPercent}%, rgba(209, 213, 219, 0.7) ${fillPercent}%, rgba(209, 213, 219, 0.7) 100%)`
                  }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-primary border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
                />
              );
            })()}
            <div className="flex justify-between text-xs text-muted-foreground font-bold font-mono">
              <span>৳0</span>
              <span>৳40,000</span>
            </div>
          </div>

          {/* Color filter selectors */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground opacity-90">{t('search.color')}</label>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'magenta', code: '#d946ef' },
                { name: 'purple', code: '#a855f7' },
                { name: 'gold', code: '#c99a3c' },
                { name: 'white', code: '#ffffff' },
                { name: 'dark', code: '#1e293b' },
                { name: 'green', code: '#10b981' }
              ].map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      const nextColor = selectedColor === color.name ? '' : color.name;
                      setSelectedColor(nextColor);
                      const params = new URLSearchParams(window.location.search);
                      if (nextColor) {
                        params.set('color', nextColor);
                      } else {
                        params.delete('color');
                      }
                      const newQuery = params.toString();
                      router.push(`/search${newQuery ? `?${newQuery}` : ''}`);
                    }}
                    style={{ backgroundColor: color.code }}
                    className={`h-7.5 w-7.5 rounded-full border transition-all cursor-pointer ${isSelected
                        ? 'ring-2 ring-offset-2 ring-primary scale-110 border-background shadow-md'
                        : 'border-border hover:scale-105 shadow-xs'
                      }`}
                    title={color.name}
                    aria-label={`Filter by ${color.name}`}
                  />
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Listing Section */}
        <main className="lg:col-span-9 space-y-6">

          {/* Listing Title and Luxury Sorting Controls Bar */}
          <div className="space-y-4 border-b border-border pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif capitalize">
                  {selectedCategory && selectedCategory !== 'all' ? t(`nav.${selectedCategory.toLowerCase()}`) : t('search.allPieces')}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-1">
                  {(isLoading || isFetching) && accumulatedProducts.length === 0 ? (
                    <span className="inline-block h-4 w-28 shimmer-bg rounded-md" />
                  ) : (
                    `${filteredProducts.length} ${t('search.pieces')} · ${t('search.curatedBy')}`
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Styled Sort Dropdown Selector */}
                <div className="relative flex items-center">
                  <ArrowUpDown size={15} className="absolute left-3.5 text-primary pointer-events-none z-10" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-9 pr-9 py-2 sm:py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 text-xs sm:text-sm font-extrabold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-xs cursor-pointer appearance-none"
                    aria-label="Sort products"
                  >
                    <option value="price-desc">{t('search.sortHighToLow')}</option>
                    <option value="price-asc">{t('search.sortLowToHigh')}</option>
                    <option value="newest">{t('search.sortNewest')}</option>
                    <option value="popular">{t('search.sortPopular')}</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 text-muted-foreground pointer-events-none z-10" />
                </div>

                {/* Styled Layout Togglers */}
                <div className="flex items-center border border-border rounded-xl bg-card p-1 shadow-xs space-x-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${viewMode === 'grid'
                        ? 'bg-primary text-white-force shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    aria-label="Grid view"
                    title={locale === 'bn' ? 'গ্রিড ভিউ' : 'Grid View'}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${viewMode === 'list'
                        ? 'bg-primary text-white-force shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    aria-label="List view"
                    title={locale === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {((selectedCategory && selectedCategory !== 'all') || searchText.trim() !== '' || Boolean(selectedColor) || priceRange < 40000) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                <span className="text-xs font-extrabold text-muted-foreground mr-1">
                  {locale === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
                </span>

                {selectedCategory && selectedCategory !== 'all' && (
                  <span className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                    <span>
                      {categoryOptions.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase())?.label || selectedCategory.replace(/-/g, ' ')}
                    </span>
                    <button
                      onClick={() => { setSelectedCategory('all'); router.push('/search'); }}
                      className="hover:text-foreground cursor-pointer"
                      title="Remove filter"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {searchText.trim() !== '' && (
                  <span className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                    <span>"{searchText}"</span>
                    <button onClick={() => setSearchText('')} className="hover:text-foreground cursor-pointer" title="Clear search">
                      <X size={13} />
                    </button>
                  </span>
                )}

                {Boolean(selectedColor) && selectedColor.trim() !== '' && (
                  <span className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs">
                    <span>Color: {selectedColor}</span>
                    <button
                      onClick={() => {
                        setSelectedColor('');
                        const params = new URLSearchParams(window.location.search);
                        params.delete('color');
                        router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
                      }}
                      className="hover:text-foreground cursor-pointer"
                      title="Remove color filter"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}

                {priceRange < 40000 && (
                  <span className="inline-flex items-center space-x-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold px-3 py-1 rounded-full font-mono shadow-2xs">
                    <span>&lt; ৳{priceRange.toLocaleString()}</span>
                    <button onClick={() => setPriceRange(40000)} className="hover:text-foreground cursor-pointer" title="Reset price filter">
                      <X size={13} />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs font-extrabold text-muted-foreground hover:text-destructive underline ml-2 cursor-pointer transition-colors"
                >
                  {locale === 'bn' ? 'সব ক্লিয়ার করুন' : 'Clear All'}
                </button>
              </div>
            )}
          </div>

          {(isLoading || isFetching) && accumulatedProducts.length === 0 ? (
            viewMode === 'grid' ? (
              <ProductGridSkeleton count={12} />
            ) : (
              <ProductListSkeleton count={6} />
            )
          ) : sortedProducts.length === 0 && !isLoading && !isFetching ? (
            <EmptyProductState
              variant={isAnyFilterActive ? 'no-results' : 'empty-category'}
              onReset={handleResetOnlyFilters}
              onViewAll={handleViewAllProducts}
              locale={locale}
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                  {sortedProducts.map((product: any) => {
                    const isWishlisted = wishlistArray.some((item: any) => (item._id || item.id || item)?.toString() === product._id?.toString());
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isWishlisted={isWishlisted}
                        onWishlistToggle={handleWishlistToggle}
                      />
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW LAYOUT */
                <div className="flex flex-col space-y-4">
                  {sortedProducts.map((product: any) => {
                    const price = product.price || 0;
                    const salePrice = product.salePrice;
                    const isSale = salePrice && salePrice < price;
                    const img = product.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';

                    return (
                      <div
                        key={product._id}
                        className="group flex flex-col sm:flex-row bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative p-4 gap-5 items-center sm:items-start"
                      >
                        <Link href={`/products/${product.slug}`} className="w-full sm:w-48 aspect-[4/3] sm:aspect-square overflow-hidden bg-muted relative rounded-xl shrink-0 block">
                          <Image
                            src={img}
                            alt={product.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 200px"
                            className="transition duration-500 group-hover:scale-105 object-cover"
                          />
                          {product.badge && (
                            <span className="absolute top-2 left-2 z-10 bg-primary text-white-force text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                              {product.badge}
                            </span>
                          )}
                        </Link>

                        <div className="flex-1 flex flex-col justify-between space-y-3 w-full h-full">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              <span>{getProductCategory(product) || 'Collection'}</span>
                              {product.ratings?.count > 0 && product.ratings?.average > 0 ? (
                                <div className="flex items-center space-x-1">
                                  <Star size={10} fill="currentColor" className="text-amber-400 stroke-amber-400" />
                                  <span className="text-muted-foreground font-semibold">
                                    {Number(product.ratings.average).toFixed(1)} ({product.ratings.count})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  New
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight hover:text-primary transition line-clamp-1 mt-1 font-serif">
                              <Link href={`/products/${product.slug}`}>{product.title}</Link>
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-normal">
                              {product.description ? product.description.replace(/<[^>]*>/g, '').trim() : ''}
                            </p>

                            {product.colors && (
                              <div className="flex items-center space-x-1.5 mt-2.5">
                                {product.colors.map((cCode: string, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    style={{ backgroundColor: cCode }}
                                    className="h-2.5 w-2.5 rounded-full border border-background ring-1 ring-border"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                              {isSale ? (
                                <div className="flex flex-wrap items-baseline gap-1.5">
                                  <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">৳{salePrice.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground/80 line-through font-semibold font-mono">৳{price.toLocaleString()}</span>
                                </div>
                              ) : (
                                <span className="text-base sm:text-lg font-black text-foreground font-mono tracking-tight">৳{price.toLocaleString()}</span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleWishlistToggle(product._id)}
                                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
                                title={wishlistArray.some((item: any) => (item._id || item.id || item)?.toString() === product._id?.toString()) ? "Remove from Wishlist" : "Add to Wishlist"}
                              >
                                <Heart
                                  size={16}
                                  fill={wishlistArray.some((item: any) => (item._id || item.id || item)?.toString() === product._id?.toString()) ? "#ef4444" : "none"}
                                  className={wishlistArray.some((item: any) => (item._id || item.id || item)?.toString() === product._id?.toString()) ? "stroke-[#ef4444]" : "stroke-current"}
                                />
                              </button>

                              <button
                                onClick={() => handleCopyDesign(product._id, product.slug)}
                                className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer flex items-center justify-center space-x-1"
                                title={copiedId === product._id ? (locale === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!') : (locale === 'bn' ? 'প্রোডাক্ট লিংক শেয়ার করুন' : 'Share Link')}
                                aria-label="Share Link"
                              >
                                {copiedId === product._id ? (
                                  <>
                                    <Check className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                                    <span className="text-[10px] font-bold text-emerald-500">{locale === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="h-4 w-4 text-muted-foreground hover:text-foreground stroke-[2]" />
                                    <span className="text-[10px] font-bold text-muted-foreground">{locale === 'bn' ? 'শেয়ার' : 'Share'}</span>
                                  </>
                                )}
                              </button>

                              <Link
                                href={`/products/${product.slug}`}
                                className="inline-flex items-center space-x-1.5 bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                <ShoppingBag size={14} />
                                <span>{locale === 'bn' ? 'দেখুন' : 'View'}</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Pagination Section */}
              {totalProducts > 0 && (
                <div className="w-full max-w-5xl mx-auto mt-12 pt-8 border-t border-border/50 flex flex-col items-center justify-center space-y-4">
                  {/* Subtle Supporting Progress Bar */}
                  <div className="w-full max-w-xs sm:max-w-sm space-y-1.5 text-center px-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {locale === 'bn' ? 'প্রদর্শিত হচ্ছে' : 'Showing'} {Math.min(sortedProducts.length, totalProducts)} / {totalProducts} {locale === 'bn' ? 'পণ্য' : 'products'}
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {Math.min(100, Math.round((Math.min(sortedProducts.length, totalProducts) / Math.max(totalProducts, 1)) * 100))}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/75 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, (Math.min(sortedProducts.length, totalProducts) / Math.max(totalProducts, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Primary Focus Load More Button */}
                  {currentPage < totalPages ? (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoading || isFetchingMore}
                        className="group min-w-[230px] sm:min-w-[250px] inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:transform-none"
                      >
                        {(isLoading || isFetchingMore) ? (
                          <>
                            <Loader2 size={17} className="animate-spin text-white" />
                            <span>{locale === 'bn' ? 'আরও পণ্য লোড হচ্ছে...' : 'Loading more products...'}</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={17} className="transition-transform duration-200 group-hover:translate-y-0.5 stroke-[2.5]" />
                            <span>{locale === 'bn' ? 'আরও পণ্য দেখুন' : 'Load more products'}</span>
                            <span className="inline-flex items-center justify-center bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-medium font-mono">
                              +{Math.min(itemsPerPage, Math.max(0, totalProducts - sortedProducts.length))}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 text-center">
                      <div className="inline-flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-5 py-2.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs backdrop-blur-xs">
                        <Check size={15} className="text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <span>{locale === 'bn' ? 'আপনি এই কালেকশনের সব পণ্য দেখেছেন 🎉' : 'You have viewed all products in this collection 🎉'}</span>
                      </div>
                    </div>
                  )}

                  {/* Hidden SEO Crawlable Pagination Links */}
                  <nav aria-label="Pagination Navigation" className="sr-only">
                    {currentPage > 1 && (
                      <a
                        href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(currentPage - 1) }).toString()}`}
                        rel="prev"
                      >
                        Previous Page
                      </a>
                    )}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <a
                        key={pageNum}
                        href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(pageNum) }).toString()}`}
                      >
                        Page {pageNum}
                      </a>
                    ))}
                    {currentPage < totalPages && (
                      <a
                        href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(currentPage + 1) }).toString()}`}
                        rel="next"
                      >
                        Next Page
                      </a>
                    )}
                  </nav>
                </div>
              )}
            </>
          )}
        </main>
      </div>



    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
