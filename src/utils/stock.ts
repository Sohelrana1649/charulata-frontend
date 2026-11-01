/**
 * Universal Stock Status Helper for Charulata Lifestyle
 *
 * Single Source of Truth for stock calculation across:
 * - ProductCard (Homepage, Sliders, Category grids, Search, Related products)
 * - Product Details Page (ProductDetailClient)
 * - Cart validation & Checkout (cart/page, checkout)
 * - Meta Pixel & Schema.org JSON-LD structured data
 */

export interface StockStatus {
  isInStock: boolean;
  stockQuantity: number;
  hasVariants: boolean;
  hasVariantStock: boolean;
  statusTextEn: string;
  statusTextBn: string;
}

export function getStockStatus(product: any, selectedVariant?: any): StockStatus {
  if (!product || typeof product !== 'object') {
    return {
      isInStock: false,
      stockQuantity: 0,
      hasVariants: false,
      hasVariantStock: false,
      statusTextEn: 'Out of Stock',
      statusTextBn: 'স্টক শেষ',
    };
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const hasVariantStock = hasVariants
    ? product.variants.some((v: any) => (Number(v?.stockQuantity) || 0) > 0)
    : false;

  const productLevelStock = product.stockQuantity !== undefined && product.stockQuantity !== null
    ? Number(product.stockQuantity)
    : (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0);

  // If a specific variant is selected (e.g. in ProductDetailClient)
  if (selectedVariant && typeof selectedVariant === 'object') {
    const rawVariantStock = selectedVariant.stockQuantity !== undefined && selectedVariant.stockQuantity !== null
      ? Number(selectedVariant.stockQuantity)
      : (selectedVariant.stock !== undefined && selectedVariant.stock !== null ? Number(selectedVariant.stock) : null);

    // If variants have individual stock tracked across the product (>0 on at least one variant):
    // use that specific variant's stock.
    // If variants do NOT track individual stock (all variants have 0 / unset stock),
    // fallback gracefully to product-level stock (e.g. product.stockQuantity = 100).
    const effectiveStock = hasVariantStock
      ? (rawVariantStock !== null ? Math.max(0, rawVariantStock) : 0)
      : Math.max(0, productLevelStock);

    let isInStock = effectiveStock > 0;

    // Explicit flags override
    if (
      product.isActive === false ||
      product.isOutOfStock === true ||
      selectedVariant.isActive === false ||
      selectedVariant.isOutOfStock === true
    ) {
      isInStock = false;
    }

    return {
      isInStock,
      stockQuantity: effectiveStock,
      hasVariants: true,
      hasVariantStock,
      statusTextEn: isInStock ? 'In Stock' : 'Out of Stock',
      statusTextBn: isInStock ? 'ইন স্টক' : 'স্টক শেষ',
    };
  }

  // At product level (ProductCard, Listings, Sliders, Related Products):
  let effectiveStock = 0;
  let isInStock = false;

  if (hasVariants) {
    // If variants exist, total stock is the sum of variant stocks
    const totalVariantStock = product.variants.reduce(
      (sum: number, v: any) => sum + Math.max(0, Number(v?.stockQuantity) || 0),
      0
    );
    effectiveStock = Math.max(productLevelStock, totalVariantStock);
    isInStock = hasVariantStock || productLevelStock > 0;
  } else {
    // No variants: must have stockQuantity > 0
    effectiveStock = Math.max(0, productLevelStock);
    isInStock = effectiveStock > 0;
  }

  // Explicit flags override
  if (product.isActive === false || product.isOutOfStock === true) {
    isInStock = false;
  }

  return {
    isInStock,
    stockQuantity: effectiveStock,
    hasVariants,
    hasVariantStock,
    statusTextEn: isInStock ? 'In Stock' : 'Out of Stock',
    statusTextBn: isInStock ? 'ইন স্টক' : 'স্টক শেষ',
  };
}
