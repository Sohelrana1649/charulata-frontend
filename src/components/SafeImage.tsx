import Image, { ImageProps } from "next/image";
import React, { useState } from "react";

const ALLOWED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "images.unsplash.com",
  "plus.unsplash.com",
  "res.cloudinary.com",
];

const apiURL = process.env.NEXT_PUBLIC_API_URL;
let apiHostname: string | null = null;
if (apiURL) {
  try {
    apiHostname = new URL(apiURL).hostname;
  } catch (e) {
    // Ignore invalid URL
  }
}

/**
 * Extracts the real image URL from Google Images search results if applicable,
 * otherwise returns the original URL.
 */
export function cleanImageUrl(src: string): string {
  if (!src) return src;
  let cleaned = src;
  try {
    if (src.includes("google.com/imgres")) {
      const url = new URL(src);
      const imgurl = url.searchParams.get("imgurl");
      if (imgurl) {
        cleaned = decodeURIComponent(imgurl);
      }
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  // Support local network / mobile browser testing by replacing localhost with actual host
  if (typeof window !== 'undefined' && cleaned.includes('localhost')) {
    cleaned = cleaned.replace('localhost', window.location.hostname);
  }

  // Auto-optimize Cloudinary image delivery (WebP/AVIF format & smart compression without downscaling resolution)
  if (typeof cleaned === 'string' && cleaned.includes('res.cloudinary.com') && cleaned.includes('/upload/') && !cleaned.includes('f_auto')) {
    cleaned = cleaned.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return cleaned;
}

export function isAllowedDomain(src: string): boolean {
  if (!src) return false;
  // If it's a relative path or local import, Next.js handles it without validation
  if (
    src.startsWith("/") ||
    src.startsWith("./") ||
    src.startsWith("../") ||
    !src.includes("://")
  ) {
    return true;
  }
  try {
    const url = new URL(src);
    const hostname = url.hostname;
    if (ALLOWED_DOMAINS.includes(hostname) || hostname === apiHostname) {
      return true;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return false;
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
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const isStringSrc = typeof src === "string";
  const cleanedSrc = isStringSrc ? cleanImageUrl(src) : src;
  const allowed = !isStringSrc || isAllowedDomain(cleanedSrc as string);

  const isLocalUpload = typeof cleanedSrc === 'string' && cleanedSrc.includes('/uploads/');
  const finalUnoptimized = unoptimized || isLocalUpload;

  const combinedClassName = `${className || ""} image-transition ${isLoaded ? "image-loaded" : ""}`.trim();

  const handleLoad = (e: any) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  if (allowed) {
    return (
      <Image
        src={cleanedSrc}
        alt={alt}
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
        {...props}
      />
    );
  }

  // Fallback to standard img tag if not allowed in next.config.ts remotePatterns
  const fillStyle: React.CSSProperties = fill
    ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: "cover",
      }
    : {};

  const combinedStyle = { ...fillStyle, ...style };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cleanedSrc as string}
      alt={alt}
      style={combinedStyle}
      className={combinedClassName}
      width={width}
      height={height}
      onLoad={handleLoad}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
}
