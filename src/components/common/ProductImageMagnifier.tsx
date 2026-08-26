'use client';

import React, { useState, useRef, useCallback, MouseEvent } from 'react';
import SafeImage from '@/components/SafeImage';
import {
  Maximize2,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Video,
  Play
} from 'lucide-react';

interface ProductImageMagnifierProps {
  src: string;
  alt: string;
  zoomLevel?: number;
  isSale?: boolean;
  discountPercent?: number;
  stockQuantity?: number;
  galleryImages?: string[];
  activeImageIndex?: number;
  onPrevImage?: (e?: React.MouseEvent) => void;
  onNextImage?: (e?: React.MouseEvent) => void;
  onOpenLightbox?: () => void;
  hasVideo?: boolean;
  onOpenVideo?: () => void;
  locale?: string;
}

export default function ProductImageMagnifier({
  src,
  alt,
  zoomLevel = 2.5,
  isSale = false,
  discountPercent = 0,
  stockQuantity = 0,
  galleryImages = [],
  activeImageIndex = 0,
  onPrevImage,
  onNextImage,
  onOpenLightbox,
  hasVideo = false,
  onOpenVideo,
  locale = 'bn',
}: ProductImageMagnifierProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse coordinate calculation (Only active on desktop hover)
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();

    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setMousePosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // On Mobile: Tap opens Fullscreen Lightbox directly
  // On Desktop: Click opens Lightbox
  const handleContainerClick = () => {
    if (onOpenLightbox) {
      onOpenLightbox();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
      className="aspect-square sm:aspect-[4/5] max-h-[500px] sm:max-h-[550px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border/80 shadow-xs relative group cursor-pointer sm:cursor-crosshair select-none"
    >
      {/* ─── BASE IMAGE LAYER (Next.js Responsive Image with Desktop Hover Zoom) ─── */}
      <div
        className="absolute inset-0 w-full h-full sm:transition-transform sm:duration-200 sm:ease-out will-change-transform"
        style={{
          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
          transform: isHovered ? `scale(${zoomLevel})` : 'scale(1)',
        }}
      >
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority
          quality={95}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 650px"
          className="object-cover object-center"
        />
      </div>

      {/* ─── DESKTOP LENS RETICLE (Subtle indicator following cursor) ─── */}
      {isHovered && (
        <div
          className="pointer-events-none absolute hidden sm:block w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/70 bg-white/10 backdrop-contrast-125 shadow-2xl transition-opacity duration-150"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary/90 ring-2 ring-white/90 animate-ping" />
          </div>
        </div>
      )}

      {/* ─── TOP LEFT: SALE & STOCK BADGES ─── */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
        {isSale && discountPercent > 0 && (
          <span className="bg-rose-600 text-white font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shadow-md">
            -{discountPercent}% OFF
          </span>
        )}
        {stockQuantity <= 5 && stockQuantity > 0 && (
          <span className="bg-amber-500 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
            Only {stockQuantity} Left!
          </span>
        )}
      </div>

      {/* ─── TOP RIGHT: ZOOM BADGE & GALLERY COUNTER ─── */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1.5 z-20 pointer-events-none">
        {/* Desktop Zoom Badge */}
        {isHovered && (
          <span className="hidden sm:flex bg-primary/90 backdrop-blur-md text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20 shadow-md animate-fadeIn items-center gap-1">
            <ZoomIn size={11} />
            {zoomLevel}x ZOOM
          </span>
        )}
        {/* Gallery Image Counter */}
        {galleryImages.length > 1 && (
          <div className="bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
            {activeImageIndex >= 0 ? activeImageIndex + 1 : 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* ─── NEXT / PREV NAVIGATION ARROWS OVERLAY ─── */}
      {galleryImages.length > 1 && onPrevImage && onNextImage && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrevImage(e);
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-20 cursor-pointer active:scale-95 border border-white/20 opacity-80 hover:opacity-100"
            aria-label="Previous angle photo"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNextImage(e);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-2 sm:p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-20 cursor-pointer active:scale-95 border border-white/20 opacity-80 hover:opacity-100"
            aria-label="Next angle photo"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* ─── BOTTOM ACTIONS BAR (Clean & Minimalist) ─── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none gap-2">
        {/* Left Side: Video Demo Button or Mobile Tap Hint */}
        <div className="flex items-center gap-2">
          {hasVideo && onOpenVideo ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenVideo();
              }}
              className="pointer-events-auto bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-3.5 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-black transition flex items-center gap-1.5 cursor-pointer shadow-md border border-white/20 active:scale-95"
            >
              <Video size={13} className="fill-white text-white shrink-0" />
              <span>{locale === 'bn' ? 'ভিডিও ডেমো দেখুন' : 'Watch Video Demo'}</span>
            </button>
          ) : (
            <div className="hidden sm:flex bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-semibold px-2.5 py-1 rounded-xl border border-white/10 items-center gap-1">
              <ZoomIn size={11} className="text-amber-400" />
              <span>{locale === 'bn' ? 'হোভার করে জুম দেখুন' : 'Hover to Zoom'}</span>
            </div>
          )}

          {/* Mobile Tap Hint */}
          <div className="sm:hidden bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1">
            <Maximize2 size={10} className="text-primary" />
            <span>{locale === 'bn' ? 'ট্যাপে ফুলস্ক্রিন দেখুন' : 'Tap for Fullscreen'}</span>
          </div>
        </div>

        {/* Right Side: Fullscreen Lightbox Button */}
        {onOpenLightbox && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox();
            }}
            className="pointer-events-auto bg-black/70 hover:bg-primary text-white p-2 rounded-xl backdrop-blur-md text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer shadow-md border border-white/20 active:scale-95"
            title={locale === 'bn' ? 'ফুলস্ক্রিন গ্যালারি খুলুন' : 'Open Fullscreen Gallery'}
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
