'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ProductErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product detail page runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5 text-rose-500 shadow-sm">
        <AlertTriangle size={32} className="stroke-[2]" />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-foreground font-serif tracking-tight mb-2">
        পণ্যটি লোড করতে সাময়িক সমস্যা হয়েছে
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        ইন্টারনেট সংযোগ বা সার্ভার রেসপন্সের কারণে পেজটি লোড হতে পারেনি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
      </p>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw size={15} />
          <span>আবার চেষ্টা করুন</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
        >
          <Home size={15} />
          <span>হোমে যান</span>
        </Link>
      </div>
    </div>
  );
}
