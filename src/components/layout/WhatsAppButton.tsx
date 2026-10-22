'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Do not render on admin dashboard or checkout page
  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  if (!pathname || isAdminPage || isCheckoutPage) {
    return null;
  }

  const phoneHref = 'tel:01620556299';
  const whatsappHref = `https://wa.me/8801620556299?text=${encodeURIComponent('🌸 আসসালামু আলাইকুম! চারুলতা লাইফস্টাইল থেকে পণ্য অর্ডার করতে চাচ্ছি।')}`;
  const messengerHref = 'https://m.me/charulatalifestyle';

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6 z-[45] flex flex-col items-center select-none"
    >
      {/* Expandable Speed-Dial Action Buttons (Revealed when Open) */}
      <div
        className={`flex flex-col items-center space-y-3 mb-3 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {/* 1. WhatsApp Button (Green) */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact via WhatsApp"
          onClick={() => setIsOpen(false)}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* WhatsApp Logo SVG */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>

        {/* 2. Messenger Button (Blue) */}
        <a
          href={messengerHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact via Facebook Messenger"
          onClick={() => setIsOpen(false)}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#0084FF] hover:bg-[#0074e0] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Messenger Logo SVG */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.516 3.736 7.187v3.555l3.414-1.874c.905.251 1.862.39 2.85.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.443l-2.648-2.824-5.167 2.824 5.684-6.035 2.713 2.824 5.102-2.824-5.684 6.035z" />
          </svg>
        </a>

        {/* 3. Phone Call Button (Dark Brown / Maroon) */}
        <a
          href={phoneHref}
          aria-label="Direct Phone Call"
          onClick={() => setIsOpen(false)}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#4A2828] hover:bg-[#381c1c] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Phone Handset SVG */}
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </a>
      </div>

      {/* Main Trigger Floating Button (Toggles between Chat Bubble and Golden-Rimmed Close Button) */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'যোগাযোগ অপশন বন্ধ করুন' : 'যোগাযোগ করুন'}
        className={`group relative w-12 h-12 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-white !text-white transition-all duration-300 cursor-pointer shadow-2xl active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37] ${
          isOpen
            ? 'bg-[#BE123C] ring-4 ring-[#D4AF37] ring-offset-2 ring-offset-background rotate-90 scale-105'
            : 'bg-[#BE123C] hover:bg-[#9F1239] hover:scale-110 shadow-rose-900/40'
        }`}
      >
        {/* Active / Online Live Indicator Dot (Green Ping Badge) */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 z-30 flex h-3.5 w-3.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs" />
          </span>
        )}

        {/* Active Ambient Ripple Glow when closed */}
        {!isOpen && (
          <>
            <span
              className="absolute -inset-1 rounded-full bg-[#BE123C]/50 animate-ping opacity-35 pointer-events-none"
              style={{ animationDuration: '3s' }}
            />
            <span className="absolute -inset-1.5 rounded-full bg-[#BE123C]/35 blur-md animate-pulse pointer-events-none" />
          </>
        )}

        {isOpen ? (
          /* Pure White Close (X) Icon */
          <svg
            className="w-7 h-7 relative z-10 transition-transform duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#ffffff', stroke: '#ffffff' }}
          >
            <path d="M18 6 6 18" stroke="#FFFFFF" />
            <path d="M6 6 18 18" stroke="#FFFFFF" />
          </svg>
        ) : (
          /* Solid White Chat Bubble Icon with Active Message Dots */
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-white relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
          >
            {/* Solid Pure White Rounded Chat Bubble */}
            <path
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 3 Active Typing / Message Dots in brand crimson */}
            <circle cx="8.5" cy="11.5" r="1.3" fill="#BE123C" />
            <circle cx="12" cy="11.5" r="1.3" fill="#BE123C" />
            <circle cx="15.5" cy="11.5" r="1.3" fill="#BE123C" />
          </svg>
        )}
      </button>
    </div>
  );
}
