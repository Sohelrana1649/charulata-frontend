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
      {/* Meta Pixel Code with Protection Shield against False Purchase Events */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  // Global authorization flag: Purchase is STRICTLY forbidden unless authorized by verified order completion flow
  window.__CHARULATA_PURCHASE_AUTHORIZED__ = false;

  // Intercept sendBeacon to block unauthorized Purchase beacons to Meta
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    var origSendBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {
      try {
        var urlStr = String(url || '');
        if (urlStr.indexOf('facebook.com/tr') !== -1) {
          var isPur = urlStr.indexOf('ev=Purchase') !== -1;
          if (!isPur && data) {
            var dataStr = typeof data === 'string' ? data : (data instanceof FormData ? '' : String(data));
            if (dataStr && dataStr.indexOf('ev=Purchase') !== -1) isPur = true;
          }
          if (isPur && !window.__CHARULATA_PURCHASE_AUTHORIZED__) {
            console.warn('[Meta Tracking Shield] Blocked unauthorized sendBeacon Purchase request to Meta Pixel');
            return true;
          }
        }
      } catch (e) {}
      return origSendBeacon(url, data);
    };
  }

  // Intercept fetch to block unauthorized Purchase requests to Meta
  if (typeof window.fetch === 'function') {
    var origFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        var urlStr = typeof input === 'string' ? input : (input && input.url ? String(input.url) : '');
        if (urlStr.indexOf('facebook.com/tr') !== -1) {
          var isPur = urlStr.indexOf('ev=Purchase') !== -1;
          if (!isPur && init && init.body && typeof init.body === 'string') {
            if (init.body.indexOf('ev=Purchase') !== -1) isPur = true;
          }
          if (isPur && !window.__CHARULATA_PURCHASE_AUTHORIZED__) {
            console.warn('[Meta Tracking Shield] Blocked unauthorized fetch Purchase request to Meta Pixel');
            return Promise.resolve(new Response(null, { status: 200 }));
          }
        }
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  // Intercept XMLHttpRequest to block unauthorized Purchase requests to Meta
  if (typeof window.XMLHttpRequest === 'function') {
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__trUrl = String(url || '');
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      try {
        if (this.__trUrl && this.__trUrl.indexOf('facebook.com/tr') !== -1) {
          var isPur = this.__trUrl.indexOf('ev=Purchase') !== -1;
          if (!isPur && typeof body === 'string' && body.indexOf('ev=Purchase') !== -1) {
            isPur = true;
          }
          if (isPur && !window.__CHARULATA_PURCHASE_AUTHORIZED__) {
            console.warn('[Meta Tracking Shield] Blocked unauthorized XHR Purchase request to Meta Pixel');
            return;
          }
        }
      } catch (e) {}
      return origSend.apply(this, arguments);
    };
  }

  // Intercept HTMLImageElement .src to block unauthorized 1x1 image Purchase beacons (new Image().src)
  if (typeof HTMLImageElement !== 'undefined') {
    var imgDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (imgDescriptor && imgDescriptor.set) {
      var origImgSrcSet = imgDescriptor.set;
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: true,
        get: function() {
          return imgDescriptor.get ? imgDescriptor.get.call(this) : '';
        },
        set: function(val) {
          try {
            var urlStr = String(val || '');
            if (urlStr.indexOf('facebook.com/tr') !== -1 && urlStr.indexOf('ev=Purchase') !== -1) {
              if (!window.__CHARULATA_PURCHASE_AUTHORIZED__) {
                console.warn('[Meta Tracking Shield] Blocked unauthorized Image Purchase beacon to Meta Pixel');
                return;
              }
            }
          } catch (e) {}
          return origImgSrcSet.call(this, val);
        }
      });
    }
  }
})();

!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

// Intercept fbq method calls to prevent auto-events / Event Setup Tool from triggering Purchase on button clicks
(function() {
  var origFbq = window.fbq;
  if (!origFbq) return;

  window.fbq = function() {
    var args = Array.prototype.slice.call(arguments);
    if ((args[0] === 'track' || args[0] === 'trackCustom') && args[1] === 'Purchase') {
      if (!window.__CHARULATA_PURCHASE_AUTHORIZED__) {
        console.warn('[Meta Tracking Shield] Blocked unauthorized fbq Purchase call:', args);
        return;
      }
    }
    return origFbq.apply(this, args);
  };
  for (var key in origFbq) {
    if (Object.prototype.hasOwnProperty.call(origFbq, key)) {
      window.fbq[key] = origFbq[key];
    }
  }

  var _callMethod = window.fbq.callMethod;
  Object.defineProperty(window.fbq, 'callMethod', {
    configurable: true,
    enumerable: true,
    get: function() {
      return _callMethod;
    },
    set: function(fn) {
      _callMethod = function() {
        var args = Array.prototype.slice.call(arguments);
        if ((args[0] === 'track' || args[0] === 'trackCustom') && args[1] === 'Purchase') {
          if (!window.__CHARULATA_PURCHASE_AUTHORIZED__) {
            console.warn('[Meta Tracking Shield] Blocked unauthorized callMethod Purchase call:', args);
            return;
          }
        }
        return fn.apply(this, args);
      };
    }
  });
})();

// Explicitly disable Automatic Configuration & automatic button click detection
fbq('set', 'autoConfig', false, '${PIXEL_ID}');
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
