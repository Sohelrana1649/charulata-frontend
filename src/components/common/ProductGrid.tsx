'use client';

import React from 'react';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: any[];
  wishlistArray?: any[];
  onWishlistToggle?: (id: string) => void;
  columns?: 4 | 5;
}

const GRID_CLASSES: Record<4 | 5, string> = {
  4: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4',
  // 5 per row on desktop; on the 3-col tablet layout hide the 10th card so rows stay full (3×3)
  5: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4 sm:max-lg:[&>*:nth-child(n+10)]:hidden',
};

export default function ProductGrid({ products, wishlistArray = [], onWishlistToggle, columns = 4 }: ProductGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className={GRID_CLASSES[columns]}>
      {products.map((product) => {
        const isWishlisted = wishlistArray.some(
          (item: any) => (item._id || item.id || item)?.toString() === product._id?.toString()
        );

        return (
          <div key={product._id} className="flex flex-col">
            <ProductCard
              product={product}
              isWishlisted={isWishlisted}
              onWishlistToggle={onWishlistToggle}
            />
          </div>
        );
      })}
    </div>
  );
}
