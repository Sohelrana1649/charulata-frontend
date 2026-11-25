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

  // Meta Contact event: any click on a phone / WhatsApp / Messenger / email link anywhere on the site
  useEffect(() => {
    let lastFired = 0;
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = (anchor.getAttribute("href") || "").toLowerCase();
      let method = "";
      if (href.startsWith("tel:")) method = "phone";
      else if (href.includes("wa.me/") || href.includes("whatsapp.com")) method = "whatsapp";
      else if (href.includes("m.me/") || href.includes("messenger.com")) method = "messenger";
      else if (href.startsWith("mailto:")) method = "email";
      if (!method) return;
      const now = Date.now();
      if (now - lastFired < 2000) return; // ignore accidental double taps
      lastFired = now;
      fbEvent("track", "Contact", { contact_method: method });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

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
  // Purchase is STRICTLY forbidden unless it carries an event ID registered by the verified
  // order-success flow (trackMetaPurchase). Blocks Event Setup Tool / auto-detected Purchases.
  window.__CHARULATA_PURCHASE_EIDS__ = window.__CHARULATA_PURCHASE_EIDS__ || [];
  window.__CHARULATA_PURCHASE_AUTHORIZED__ = false;
  window.__charulataIsPurchaseAllowed = function(eid) {
    if (window.__CHARULATA_PURCHASE_AUTHORIZED__) return true;
    return !!eid && window.__CHARULATA_PURCHASE_EIDS__.indexOf(String(eid)) !== -1;
  };

  var isMetaTr = function(url) { return String(url || '').indexOf('facebook.com/tr') !== -1; };
  var readParam = function(src, name) {
    try {
      if (!src) return null;
      if (typeof src === 'string') {
        var q = src.indexOf('?') !== -1 ? src.split('?')[1] : src;
        return new URLSearchParams(q).get(name);
      }
      if (typeof FormData !== 'undefined' && src instanceof FormData) return src.get(name);
      if (typeof URLSearchParams !== 'undefined' && src instanceof URLSearchParams) return src.get(name);
    } catch (e) {}
    return null;
  };
  // true => request must be dropped
  var shouldBlock = function(url, body) {
    if (!isMetaTr(url)) return false;
    var ev = readParam(String(url), 'ev') || readParam(body, 'ev');
    if (ev !== 'Purchase') return false;
    var eid = readParam(String(url), 'eid') || readParam(body, 'eid');
    if (window.__charulataIsPurchaseAllowed(eid)) return false;
    console.warn('[Meta Tracking Shield] Blocked unauthorized Purchase request', eid || '');
    return true;
  };

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    var origSendBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) {
      try { if (shouldBlock(url, data)) return true; } catch (e) {}
      return origSendBeacon(url, data);
    };
  }

  if (typeof window.fetch === 'function') {
    var origFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        var u = typeof input === 'string' ? input : (input && input.url ? String(input.url) : '');
        if (shouldBlock(u, init && init.body)) return Promise.resolve(new Response(null, { status: 200 }));
      } catch (e) {}
      return origFetch.apply(this, arguments);
    };
  }

  if (typeof window.XMLHttpRequest === 'function') {
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__trUrl = String(url || '');
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      try { if (shouldBlock(this.__trUrl, body)) return; } catch (e) {}
      return origSend.apply(this, arguments);
    };
  }

  // 1x1 image beacons (new Image().src = 'https://www.facebook.com/tr?...')
  if (typeof HTMLImageElement !== 'undefined') {
    var imgDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (imgDesc && imgDesc.set && imgDesc.get) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: true,
        get: function() { return imgDesc.get.call(this); },
        set: function(val) {
          try { if (shouldBlock(val, null)) return; } catch (e) {}
          return imgDesc.set.call(this, val);
        }
      });
    }
  }

  // Large payloads are POSTed through a hidden form
  if (typeof HTMLFormElement !== 'undefined') {
    var origSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      try {
        if (isMetaTr(this.action)) {
          var fd = new FormData(this);
          if (shouldBlock(this.action, fd)) return;
        }
      } catch (e) {}
      return origSubmit.apply(this, arguments);
    };
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

// Guard Purchase calls WITHOUT replacing window.fbq.
// (Replacing window.fbq with a wrapper broke every event fired after fbevents.js loaded:
//  ViewContent, AddToCart, SPA PageViews, etc. were silently stuck in the stub queue.)
// fbevents.js assigns fbq.callMethod on load; we wrap it through a setter on the ORIGINAL stub.
(function() {
  var stub = window.fbq;
  if (!stub || stub.__charulataGuarded) return;
  stub.__charulataGuarded = true;
  var _callMethod = stub.callMethod;
  try {
    Object.defineProperty(stub, 'callMethod', {
      configurable: true,
      enumerable: true,
      get: function() { return _callMethod; },
      set: function(fn) {
        if (typeof fn !== 'function') { _callMethod = fn; return; }
        _callMethod = function() {
          var args = arguments;
          if ((args[0] === 'track' || args[0] === 'trackCustom') && args[1] === 'Purchase') {
            var eid = args[3] && args[3].eventID;
            if (!window.__charulataIsPurchaseAllowed(eid)) {
              console.warn('[Meta Tracking Shield] Blocked unauthorized fbq Purchase call');
              return;
            }
          }
          return fn.apply(this, args);
        };
      }
    });
  } catch (e) {}
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
