'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('[Charulata Error]', error);
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-lg w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-8 w-24 h-24 rounded-2xl bg-destructive/10 dark:bg-destructive/15 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive" strokeWidth={1.5} />
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          কিছু একটা সমস্যা হয়েছে!
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          দুঃখিত, একটি অপ্রত্যাশিত সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন, অথবা হোমপেজে ফিরে যান।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            আবার চেষ্টা করুন
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm border border-border hover:bg-muted hover:scale-[1.02] transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            হোমপেজে যান
          </Link>
        </div>

        {/* Error digest for debugging */}
        {error?.digest && (
          <p className="mt-8 text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
