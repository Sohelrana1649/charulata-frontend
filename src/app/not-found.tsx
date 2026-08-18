'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-6">
          <h1 className="text-[10rem] sm:text-[12rem] font-heading font-extrabold leading-none tracking-tighter bg-gradient-to-br from-primary via-primary/60 to-primary/20 bg-clip-text text-transparent select-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          পেজটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          দুঃখিত, আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে, মুছে ফেলা হয়েছে, অথবা কখনো ছিল না।
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            হোমপেজে যান
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm border border-border hover:bg-muted hover:scale-[1.02] transition-all duration-200"
          >
            <Search className="w-4 h-4" />
            প্রোডাক্ট খুঁজুন
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            জনপ্রিয় পেজগুলো
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { href: '/', label: 'হোম', icon: Home },
              { href: '/search', label: 'সার্চ', icon: Search },
              { href: '/orders/track', label: 'অর্ডার ট্র্যাক', icon: ShoppingBag },
              { href: '/contact', label: 'যোগাযোগ', icon: ArrowLeft },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors duration-150"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
