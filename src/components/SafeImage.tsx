import Image, { ImageProps } from "next/image";
import React, { useState } from "react";

// Neutral, product-agnostic placeholder (never a stock product photo, so a missing
// or broken DB image is never mistaken for a different product).
const FALLBACK_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#f1f5f9"/><g fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="100" y="150" width="100" height="80" rx="10"/><circle cx="128" cy="175" r="9"/><path d="m100 215 30-25 25 20 15-12 30 22"/></g></svg>'
)}`;

const apiURL = process.env.NEXT_PUBLIC_API_URL;
let backendBaseUrl = "http://localhost:5000";
if (apiURL) {
  try {
    const url = new URL(apiURL);
    backendBaseUrl = `${url.protocol}//${url.host}`;
  } catch (e) {
    // Ignore invalid URL
  }
}

/**
 * Normalizes and cleans image URLs for production and local environments
 */
export function cleanImageUrl(src?: string | null): string {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return FALLBACK_PLACEHOLDER;
  }
  let cleaned = src.trim();

  // 1. Handle relative upload paths (e.g. /uploads/image.jpg)
  if (cleaned.startsWith('/uploads/')) {
    cleaned = `${backendBaseUrl}${cleaned}`;
  }

  // 2. If stored in database as localhost:5000 / 127.0.0.1:5000, map to real backend URL in production
  if (backendBaseUrl !== 'http://localhost:5000') {
    if (cleaned.startsWith('http://localhost:5000') || cleaned.startsWith('http://127.0.0.1:5000')) {
      cleaned = cleaned
        .replace('http://localhost:5000', backendBaseUrl)
        .replace('http://127.0.0.1:5000', backendBaseUrl);
    }
  }

  // 3. Extract real image URL from Google Images search results if applicable
  try {
    if (cleaned.includes("google.com/imgres")) {
      const url = new URL(cleaned);
      const imgurl = url.searchParams.get("imgurl");
      if (imgurl) {
        cleaned = decodeURIComponent(imgurl);
      }
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  // 4. Auto-optimize Cloudinary image delivery
  if (cleaned.includes('res.cloudinary.com') && cleaned.includes('/upload/') && !cleaned.includes('f_auto')) {
    cleaned = cleaned.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return cleaned;
}

export function isAllowedDomain(src: string): boolean {
  if (!src) return false;
  return true; // We enabled wildcard remote patterns in next.config.ts
}

export default function SafeImage({
  src,
  alt,
  fill,
  style,
  className,
  width,
  height,
  priority,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  onLoad,
  onError,
  suppressHydrationWarning = true,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  // Track WHICH src failed so a new src (e.g. reused card/slide) is always attempted
  const [failedSrc, setFailedSrc] = useState<unknown>(null);

  const isStringSrc = typeof src === "string";
  const initialCleaned = isStringSrc ? cleanImageUrl(src) : src;
  const hasError = failedSrc !== null && failedSrc === initialCleaned;
  const currentSrc = hasError ? FALLBACK_PLACEHOLDER : initialCleaned;

  const isExternal = typeof currentSrc === 'string' && (
    currentSrc.startsWith('http://') || 
    currentSrc.startsWith('https://')
  );
  const isLocalUpload = typeof currentSrc === 'string' && currentSrc.includes('/uploads/');
  const finalUnoptimized = unoptimized !== undefined ? unoptimized : (isExternal || isLocalUpload);

  const combinedClassName = `${className || ""} image-transition ${isLoaded ? "image-loaded" : ""}`.trim();

  const handleLoad = (e: any) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleError = (e: any) => {
    if (!hasError) {
      setFailedSrc(initialCleaned);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt || "Product image"}
      fill={fill}
      style={style}
      className={combinedClassName}
      width={width}
      height={height}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={finalUnoptimized}
      onLoad={handleLoad}
      onError={handleError}
      suppressHydrationWarning={suppressHydrationWarning}
      {...props}
    />
  );
}
