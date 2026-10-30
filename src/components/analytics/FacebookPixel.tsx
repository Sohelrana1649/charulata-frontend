"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { trackMetaEvent, trackMetaCustomEvent, ensureCatalogSkuMap } from "@/utils/metaTracking";

export const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "1064564773292846";

// Shared helpers live in src/utils/metaTracking.ts; re-exported here for backward compatibility.
export {
  getCatalogProductId,
  getCookie,
  getFbp,
  getFbc,
  generateEventId,
  sendServerMetaEvent,
  trackMetaEvent,
  trackMetaPurchase,
} from "@/utils/metaTracking";

/**
 * Tracks standard and custom events in Meta Pixel (Browser) AND Conversions API (Server).
 * Ensures identical eventID is sent to both for seamless deduplication by Meta.
 * Thin wrapper around trackMetaEvent (src/utils/metaTracking.ts).
 */
export const fbEvent = (
  action: "track" | "trackCustom",
  name: string,
  options?: any,
  eventParams?: { eventID?: string; testEventCode?: string; skipServer?: boolean }
) => {
  if (action === "trackCustom") {
    trackMetaCustomEvent(name, options, eventParams?.eventID);
    return;
  }
  // Note: Purchase is dispatched by the order placement API directly on the server to prevent duplicates
  trackMetaEvent(name, options, undefined, {
    eventId: eventParams?.eventID,
    skipServer: eventParams?.skipServer,
    testEventCode: eventParams?.testEventCode,
  });
};

function PixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  // Warm the product _id -> sku map so content_ids always match the catalog (g:id = sku)
  useEffect(() => {
    ensureCatalogSkuMap();
  }, []);

  // Capture test_event_code parameter if present in query string
  useEffect(() => {
    if (typeof window !== "undefined" && searchParams) {
      const code = searchParams.get("test_event_code");
      if (code) {
        localStorage.setItem("meta_test_event_code", code);
      }
    }
  }, [searchParams]);

  // Track PageView on client-side route changes only.
  // The initial PageView is fired by the base pixel code below.
  useEffect(() => {
    if (!PIXEL_ID) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fbEvent("track", "PageView");
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
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
    </>
  );
}

export default function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <PixelTrackerInner />
    </Suspense>
  );
}
