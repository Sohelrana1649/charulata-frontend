import React from 'react';

export default function Loading() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 bg-background">
      {/* Animated Brand Spinner */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>

      {/* Skeleton Content Preview */}
      <div className="w-full max-w-5xl space-y-8">
        {/* Title Skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-muted/70 animate-pulse" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Image Skeleton */}
              <div className="aspect-[3/4] bg-muted animate-pulse" />
              {/* Content Skeleton */}
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted/70 animate-pulse" />
                <div className="h-5 w-1/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
