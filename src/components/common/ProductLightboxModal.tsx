'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from '@/components/SafeImage';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle?: string;
  locale?: string;
}

// ─── Cloudinary Responsive URL Optimizer ──────────────────────────────────
const getOptimizedImageUrl = (url: string, width = 1200): string => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // If not already transformed, inject responsive auto-format, quality, and max width
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      return url.replace('/image/upload/', `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`);
    }
  }
  return url;
};

export default function ProductLightboxModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  productTitle = 'Product Image',
  locale = 'bn',
}: ProductLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Touch gesture state tracking
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPointersDistanceRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef<number>(0);
  const isPinchActiveRef = useRef<boolean>(false);
  const pinchCooldownRef = useRef<number>(0);

  // Reset zoom & pan when image changes or modal opens
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
    isPinchActiveRef.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex, resetZoom]);

  // ─── Android Hardware Back Button & Browser History Trap ──────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Push dummy history entry so back button closes modal first
    window.history.pushState({ isLightboxOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.isLightboxOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  const handlePrev = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    resetZoom();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length, resetZoom]);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.75, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.75, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, resetZoom]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  // Double-tap to zoom on mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      initialPointersDistanceRef.current = null;
      if (isPinchActiveRef.current) {
        isPinchActiveRef.current = false;
        pinchCooldownRef.current = Date.now(); // 400ms cooldown to prevent accidental swipe
      }
    }

    // Double tap detection (only when not pinching)
    if (!isPinchActiveRef.current && Date.now() - pinchCooldownRef.current > 400) {
      const now = Date.now();
      const timeDiff = now - lastTapRef.current;
      if (timeDiff < 300 && timeDiff > 0) {
        if (zoomScale > 1) {
          resetZoom();
        } else {
          setZoomScale(2.5);
        }
      }
      lastTapRef.current = now;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      if (zoomScale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      isPinchActiveRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPointersDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 1. Pan zoomed image (Single finger, Zoom > 1)
    if (e.touches.length === 1 && zoomScale > 1 && isDragging && !isPinchActiveRef.current) {
      const newX = e.touches[0].clientX - dragStartRef.current.x;
      const newY = e.touches[0].clientY - dragStartRef.current.y;
      const maxOffset = (zoomScale - 1) * 260;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    } 
    // 2. Swipe detection for next/prev (Single finger, STRICTLY at 1x zoom, and NOT during pinch cooldown)
    else if (
      e.touches.length === 1 &&
      zoomScale === 1 &&
      !isPinchActiveRef.current &&
      Date.now() - pinchCooldownRef.current > 400
    ) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      // Ensure gesture is predominantly horizontal
      if (
        Math.abs(deltaX) > 60 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
        Date.now() - touchStartRef.current.time < 350
      ) {
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
        touchStartRef.current = { x: 0, y: 0, time: 0 };
      }
    } 
    // 3. Pinch to zoom (Two fingers)
    else if (e.touches.length === 2 && initialPointersDistanceRef.current) {
      isPinchActiveRef.current = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const factor = currentDistance / initialPointersDistanceRef.current;
      setZoomScale((prev) => Math.max(1, Math.min(4, Number((prev * (factor > 1 ? 1.04 : 0.96)).toFixed(2)))));
      initialPointersDistanceRef.current = currentDistance;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fadeIn">
      {/* ─── TOP HEADER BAR ─── */}
      <div className="flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/90 to-transparent z-50 text-white">
        <div className="flex items-center space-x-3">
          <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs sm:text-sm font-semibold truncate max-w-[180px] sm:max-w-md text-slate-200 hidden sm:inline">
            {productTitle}
          </span>
        </div>

        {/* Zoom Controls & Close Button */}
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 space-x-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-mono font-bold px-1 text-amber-400 min-w-[40px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 4}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            {zoomScale > 1 && (
              <button
                type="button"
                onClick={resetZoom}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          {/* Touch-Friendly Close Button (44x44px minimum target) */}
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white transition cursor-pointer shadow-lg active:scale-95 border border-white/20 flex items-center justify-center shrink-0"
            title="Close Lightbox (Back)"
            aria-label="Close Lightbox"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ─── MAIN IMAGE DISPLAY AREA WITH GESTURES ─── */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden w-full h-full px-2 sm:px-12 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/70 hover:bg-primary text-white border border-white/20 backdrop-blur-md transition-all shadow-xl cursor-pointer active:scale-95 flex items-center justify-center"
            title="Previous Angle"
            aria-label="Previous angle photo"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Zoomable Image Container */}
        <div
          className={`relative max-w-full max-h-[75vh] w-full h-full flex items-center justify-center transition-transform ${
            isDragging || isPinchActiveRef.current ? 'duration-0' : 'duration-200 ease-out'
          }`}
          style={{
            transform: `scale(${zoomScale}) translate(${position.x / zoomScale}px, ${position.y / zoomScale}px)`,
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={() => {
            if (zoomScale === 1) {
              setZoomScale(2.5);
            } else {
              resetZoom();
            }
          }}
        >
          <Image
            src={getOptimizedImageUrl(currentImage, 1200)}
            alt={`${productTitle} - Fullscreen View`}
            fill
            unoptimized={true}
            className="object-contain pointer-events-none drop-shadow-2xl"
            priority
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-black/70 hover:bg-primary text-white border border-white/20 backdrop-blur-md transition-all shadow-xl cursor-pointer active:scale-95 flex items-center justify-center"
            title="Next Angle"
            aria-label="Next angle photo"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* ─── BOTTOM THUMBNAIL STRIP & MOBILE INSTRUCTIONS ─── */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-black/90 to-transparent z-50 flex flex-col items-center gap-2">
        {/* Mobile Interaction Hint */}
        <p className="text-[11px] text-slate-400 font-medium text-center">
          {locale === 'bn' 
            ? '💡 ডাবল ট্যাপ বা পিঞ্চ করে জুম করুন | সোয়াইপ করে অন্য ছবি দেখুন' 
            : '💡 Double tap or pinch to zoom | Swipe to change photo'}
        </p>

        {/* Thumbnails Row with Lazy Loading & Optimized Dimensions */}
        {images.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-full px-2 scrollbar-none no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  resetZoom();
                  setCurrentIndex(idx);
                }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer relative ${
                  currentIndex === idx
                    ? 'border-primary ring-2 ring-primary/60 scale-105 shadow-lg'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <Image 
                  src={getOptimizedImageUrl(img, 150)} 
                  alt={`Thumbnail ${idx + 1}`} 
                  fill 
                  className="object-cover" 
                  unoptimized={true}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
