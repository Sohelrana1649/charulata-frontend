/**
 * Shared Meta Pixel (browser) + Conversions API (server) tracking helper.
 *
 * Every browser fbq() event that is also relayed to the backend CAPI endpoint
 * MUST use the same eventId so Meta can deduplicate them.
 *
 * NOTE: Purchase is NOT relayed from the browser. The backend sends the Purchase
 * CAPI event itself when the order is created (using the `_eventId` we send in the
 * order request body). The browser only fires fbq('track', 'Purchase') with the
 * same event ID (see trackMetaPurchase).
 */

type MetaUserData = Record<string, any>;

export interface TrackMetaOptions {
  /** Reuse an existing event ID instead of generating a new one. */
  eventId?: string;
  /** Fire only the browser pixel; do not call the backend CAPI relay. */
  skipServer?: boolean;
  /** Meta test_event_code (auto-detected from URL / localStorage if omitted). */
  testEventCode?: string;
}

/** Events the backend /tracking/meta-event endpoint accepts (Purchase is server-side from the order API). */
const CAPI_RELAY_EVENTS = ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Contact', 'Search'];

const PURCHASE_FLAG_PREFIX = 'meta_purchase_tracked_';

const SKU_MAP_STORAGE_KEY = 'meta_catalog_sku_map_v1';
let skuMapCache: Record<string, string> | null = null;

const readSkuMap = (): Record<string, string> => {
  if (skuMapCache) return skuMapCache;
  skuMapCache = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(SKU_MAP_STORAGE_KEY);
      if (raw) skuMapCache = JSON.parse(raw) || {};
    } catch {
      // ignore
    }
  }
  return skuMapCache as Record<string, string>;
};

/** Registers products so product _id can be resolved to the catalog id (SKU) later. */
export const registerCatalogProducts = (products: any[]): void => {
  if (!Array.isArray(products)) return;
  const map = readSkuMap();
  let changed = false;
  for (const p of products) {
    const sku = p?.sku ? String(p.sku).trim() : '';
    const id = p?._id || p?.id;
    if (sku && id && map[String(id)] !== sku) {
      map[String(id)] = sku;
      changed = true;
    }
  }
  if (changed && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SKU_MAP_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }
};

/**
 * Loads the _id→sku map once per session. Some API payloads (e.g. /landing: flash sale, best selling,
 * new arrivals) return products WITHOUT sku, which would otherwise make content_ids fall back to _id and
 * miss the catalog (g:id = sku).
 */
export const ensureCatalogSkuMap = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    if (Object.keys(readSkuMap()).length > 0) return;
    const res = await fetch(`${getApiUrl()}/products?limit=2000`);
    if (!res.ok) return;
    const json = await res.json();
    const list = json?.data?.products || json?.products || (Array.isArray(json?.data) ? json.data : []);
    registerCatalogProducts(list);
  } catch {
    // Silent fail: tracking must never break the UI
  }
};

/**
 * Helper to ensure the Meta Catalog ID format strictly matches
 * what is exported in the XML feed / Meta Catalog and the server CAPI Purchase.
 * Meta Feed exports: String(product.sku || product._id || product.id)
 * If the object has no sku (e.g. landing-page payloads), the id is resolved to the sku via the cached map.
 */
export const getCatalogProductId = (product: any): string => {
  if (!product) return '';
  if (typeof product === 'string' || typeof product === 'number') {
    const id = String(product).trim();
    return readSkuMap()[id] || id;
  }
  const sku = product.sku ? String(product.sku).trim() : '';
  if (sku) return sku;
  const id = product._id || product.id;
  if (!id) return '';
  const idStr = String(id).trim();
  return readSkuMap()[idStr] || idStr;
};

/** crypto.randomUUID() with a safe fallback. */
export const generateEventId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to fallback
  }
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 8)}`;
};

/** Helper to get cookie value by name (e.g. _fbp, _fbc) */
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
};

export const getFbp = (): string | undefined => getCookie('_fbp');

/** Reads the _fbc cookie; if missing but the URL carries fbclid, builds fb.1.<timestamp>.<fbclid>. */
export const getFbc = (): string | undefined => {
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;
  if (typeof window === 'undefined') return undefined;
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  } catch {
    // ignore
  }
  return undefined;
};

/** Returns the active Meta test_event_code (URL param is persisted to localStorage). */
export const getMetaTestEventCode = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const urlCode = new URLSearchParams(window.location.search).get('test_event_code');
    if (urlCode) {
      localStorage.setItem('meta_test_event_code', urlCode);
      return urlCode;
    }
    return localStorage.getItem('meta_test_event_code') || undefined;
  } catch {
    return undefined;
  }
};

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'https://api.charulatalifestyle.com/api/v1';

/**
 * POSTs an event to the backend CAPI relay using the GIVEN eventId.
 * Never generates its own ID (that would break deduplication).
 */
export const sendServerMetaEvent = (
  eventName: string,
  eventId: string,
  customData?: any,
  userData?: MetaUserData,
  testEventCode?: string
): void => {
  if (typeof window === 'undefined' || !eventId) return;
  try {
    const payload = {
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      customData,
      userData: { fbp: getFbp(), fbc: getFbc(), ...(userData || {}) },
      testEventCode: testEventCode || getMetaTestEventCode(),
    };

    fetch(`${getApiUrl()}/tracking/meta-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent fail: tracking must never break the UI
  }
};

/**
 * Fires a Meta event in the browser (fbq) and the server (CAPI relay) with ONE shared eventId.
 * Client-only; safe to call anywhere. Returns the eventId used (or '' when run on the server).
 */
export const trackMetaEvent = (
  eventName: string,
  customData?: any,
  userData?: MetaUserData,
  options?: TrackMetaOptions
): string => {
  if (typeof window === 'undefined') return '';

  const eventId = options?.eventId || generateEventId();
  try {
    // 1. Browser pixel, with explicit eventID for deduplication
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', eventName, customData, { eventID: eventId });
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[Meta Pixel Log] track: ${eventName}`, customData || '', { eventID: eventId });
    }

    // 2. Server CAPI relay with the SAME eventId (never for Purchase: the order API sends it)
    if (!options?.skipServer && CAPI_RELAY_EVENTS.includes(eventName)) {
      sendServerMetaEvent(eventName, eventId, customData, userData, options?.testEventCode);
    }
  } catch {
    // Silent fail: tracking must never break the UI
  }
  return eventId;
};

/** Like trackMetaEvent, but for trackCustom events (browser only; no CAPI relay). */
export const trackMetaCustomEvent = (eventName: string, customData?: any, eventId?: string): string => {
  if (typeof window === 'undefined') return '';
  const id = eventId || generateEventId();
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') fbq('trackCustom', eventName, customData, { eventID: id });
  } catch {
    // ignore
  }
  return id;
};

/**
 * Fires the browser Purchase pixel EXACTLY ONCE per order (guarded by a localStorage flag keyed by
 * order id) using the event ID the server used (`response.metaEventId`, falling back to the `_eventId`
 * we sent). Does NOT call the backend relay: the server already sent the Purchase CAPI event.
 * Returns true if the event was fired, false if it was skipped as a duplicate.
 */
export const trackMetaPurchase = (orderKey: string, eventId: string, customData: any): boolean => {
  if (typeof window === 'undefined' || !eventId) return false;
  const flagKey = `${PURCHASE_FLAG_PREFIX}${orderKey || eventId}`;
  try {
    if (localStorage.getItem(flagKey)) return false;
    localStorage.setItem(flagKey, '1');
  } catch {
    // storage unavailable: still fire once for this call
  }
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', customData, { eventID: eventId });
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Pixel Log] track: Purchase', customData || '', { eventID: eventId });
    }
  } catch {
    // Silent fail: tracking must never break the UI
  }
  return true;
};
