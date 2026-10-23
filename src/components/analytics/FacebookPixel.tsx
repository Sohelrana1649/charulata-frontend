'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '1064564773292846';

/**
 * Helper to ensure the Meta Catalog ID format strictly matches
 * what is exported in the XML feed / Meta Catalog.
 * Meta Feed exports: String(product.sku || product._id || product.id)
 */
export const getCatalogProductId = (product: any): string => {
  if (!product) return '';
  if (typeof product === 'string' || typeof product === 'number') return String(product).trim();
  const sku = product.sku ? String(product.sku).trim() : '';
  if (sku) return sku;
  const id = product._id || product.id;
  return id ? String(id).trim() : '';
};

/**
 * Helper to get cookie value by name (e.g. _fbp, _fbc)
 */
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
};

export const getFbp = (): string | undefined => getCookie('_fbp');
export const getFbc = (): string | undefined => getCookie('_fbc');

/**
 * Generate a unique event ID for deduplication between Browser Pixel & Server CAPI
 */
export const generateMetaEventId = (prefix: string = 'evt'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Tracks standard and custom events in Meta Pixel.
 * Safe to call from anywhere in client components.
 * Supports passing eventID for proper deduplication with Meta Conversions API (CAPI).
 */
export const fbEvent = (
  action: 'track' | 'trackCustom',
  name: string,
  options?: any,
  eventParams?: { eventID?: string }
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (eventParams?.eventID) {
      (window as any).fbq(action, name, options, { eventID: eventParams.eventID });
    } else {
      (window as any).fbq(action, name, options);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Meta Pixel Log] ${action}: ${name}`, options || '', eventParams || '');
    }
  }
};

function PixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  // Track PageView on client-side route changes only.
  // The initial PageView is fired by the base pixel code below.
  useEffect(() => {
    if (!PIXEL_ID) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fbEvent('track', 'PageView');
  }, [pathname, searchParams]);

  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
    </>
  );
}

export default function FacebookPixel() {
  // Wrap in Suspense to avoid de-optimizing the build due to searchParams reading
  return (
    <Suspense fallback={null}>
      <PixelTrackerInner />
    </Suspense>
  );
}
