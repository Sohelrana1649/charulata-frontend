import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 w-full py-4 sm:py-8 flex-1 space-y-8 sm:space-y-12 min-h-[85vh] animate-fadeIn">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2 py-1">
        <div className="h-4 w-16 shimmer-bg rounded-md" />
        <div className="h-4 w-3 shimmer-bg rounded-md" />
        <div className="h-4 w-24 shimmer-bg rounded-md" />
        <div className="h-4 w-3 shimmer-bg rounded-md" />
        <div className="h-4 w-36 shimmer-bg rounded-md" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left Column: Gallery Skeleton */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5 max-w-md mx-auto lg:max-w-none w-full">
          {/* Main Large Image Preview */}
          <div className="aspect-square sm:aspect-[4/5] max-h-[500px] sm:max-h-[550px] w-full rounded-2xl sm:rounded-3xl shimmer-bg border border-border/60" />
          
          {/* Thumbnails Row */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 sm:h-20 w-16 sm:w-20 rounded-xl shimmer-bg shrink-0 border border-border/40" />
            ))}
          </div>
        </div>

        {/* Right Column: Product Info Skeleton */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6">
          {/* Badge & Category */}
          <div className="space-y-2">
            <div className="h-4 w-28 shimmer-bg rounded-full" />
            <div className="h-8 sm:h-10 w-4/5 shimmer-bg rounded-xl" />
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center space-x-3">
            <div className="h-5 w-32 shimmer-bg rounded-lg" />
            <div className="h-5 w-24 shimmer-bg rounded-lg" />
          </div>

          {/* Price Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-baseline space-x-3">
              <div className="h-9 w-36 shimmer-bg rounded-xl" />
              <div className="h-6 w-24 shimmer-bg rounded-lg" />
            </div>
            <div className="h-4 w-48 shimmer-bg rounded-md" />
          </div>

          {/* Attribute Options / Sizes */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-20 shimmer-bg rounded-md" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-16 rounded-xl shimmer-bg" />
              ))}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-12 sm:h-14 w-full sm:w-36 rounded-2xl shimmer-bg" />
              <div className="h-12 sm:h-14 flex-1 rounded-2xl shimmer-bg" />
              <div className="h-12 sm:h-14 flex-1 rounded-2xl shimmer-bg" />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer-bg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
