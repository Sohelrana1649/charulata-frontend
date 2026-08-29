'use client';

import React, { useState } from 'react';
import Image from '@/components/SafeImage';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  if (!pathname || !isVisible) {
    return null;
  }

  // Show WhatsApp floating widget ONLY on Landing page ('/'), Product Details page ('/products/...'), and Cart page ('/cart')
  const isLandingPage = pathname === '/';
  const isProductDetailsPage = pathname.startsWith('/products/');
  const isCartPage = pathname === '/cart';

  const shouldShow = isLandingPage || isProductDetailsPage || isCartPage;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center group/container">
      {/* Dismiss / Close (X) Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute -top-2.5 -right-2.5 z-20 h-6 w-6 rounded-full bg-slate-900/90 text-white border border-slate-700/80 flex items-center justify-center shadow-md hover:bg-rose-600 hover:border-rose-500 hover:scale-110 transition-all duration-200 cursor-pointer focus:outline-none"
        title="বন্ধ করুন"
        aria-label="Close WhatsApp floating button"
      >
        <X size={13} className="stroke-[2.5]" />
      </button>

      <a
        href={`https://wa.me/8801620556299?text=${encodeURIComponent('🌸আসসালামু আলাইকুম!🌸')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order via WhatsApp"
        className="relative group transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer block animate-bounce"
        style={{ animationDuration: '3.5s' }}
      >
        {/* Soft, Ultra-Subtle Ambient Glow Light under the button */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366]/25 opacity-35 blur-md animate-pulse pointer-events-none" />

        {/* WhatsApp Button Image */}
        <Image
          src="/auth/whatsapp.svg"
          alt="Order via WhatsApp"
          width={48}
          height={48}
          className="h-11 sm:h-12 w-11 sm:w-12 object-contain drop-shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-110"
          priority
        />
      </a>
    </div>
  );
}
