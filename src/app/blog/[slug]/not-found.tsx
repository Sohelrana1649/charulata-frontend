'use client';

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, Search, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function BlogNotFound() {
  const { locale } = useTranslation();

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-6">
          <h1 className="text-[9rem] sm:text-[11rem] font-serif font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-primary/60 to-primary/20 bg-clip-text text-transparent select-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>

        {/* Message */}
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>{locale === 'bn' ? 'আর্টিকেল পাওয়া যায়নি' : 'Article Not Found'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-black text-foreground mb-3">
          {locale === 'bn' ? 'ব্লগটি খুঁজে পাওয়া যায়নি' : 'Article Not Found'}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
          {locale === 'bn' 
            ? 'দুঃখিত, আপনি যে আর্টিকেলটি খুঁজছেন সেটি এখনো প্রকাশিত হয়নি, সরানো হয়েছে বা লিঙ্কটি ভুল।'
            : 'The article you are looking for does not exist, is in draft, or may have been removed.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            <span>{locale === 'bn' ? 'সকল ব্লগ দেখুন' : 'Browse All Articles'}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-extrabold text-xs sm:text-sm border border-border hover:bg-muted hover:scale-[1.02] transition-all duration-200 shadow-2xs"
          >
            <Home className="w-4 h-4" />
            <span>{locale === 'bn' ? 'হোমপেজে যান' : 'Go to Homepage'}</span>
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="mt-12 pt-8 border-t border-border/70">
          <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-4">
            {locale === 'bn' ? 'জনপ্রিয় ক্যাটাগরিগুলো' : 'Popular Categories'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { href: '/blog?category=Saree%20%26%20Traditional', labelEn: 'Saree & Traditional', labelBn: 'শাড়ি ও ঐতিহ্য' },
              { href: '/blog?category=Panjabi%20%26%20Men', labelEn: 'Panjabi & Men', labelBn: 'পাঞ্জাবি ও পুরুষ' },
              { href: '/blog?category=Jewelry%20%26%20Accessories', labelEn: 'Jewelry', labelBn: 'জুয়েলারি' },
              { href: '/blog?category=Styling%20Tips', labelEn: 'Styling Tips', labelBn: 'স্টাইলিং টিপস' },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/60 transition-colors"
              >
                {locale === 'bn' ? cat.labelBn : cat.labelEn}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
