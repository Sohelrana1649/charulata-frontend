/**
 * On-Demand Revalidation Helper (Instant Cache Invalidation)
 *
 * Why this is needed:
 * Next.js App Router uses Incremental Static Regeneration (ISR) with time-based caching
 * (e.g. 2m or 5m windows). When an Admin Creates, Updates, or Deletes products, categories,
 * or banners, the live site would normally serve stale cached HTML until the timer expires.
 *
 * Calling triggerOnDemandRevalidation() immediately purges Vercel's edge cache and rebuilds
 * the pages on-demand so changes appear instantly on live site.
 */

const DEFAULT_SECRET = '9f09eb35ed02a96631acca50b4c3282ab25658ddcba080c1bbef9411fc7d81ee';

export interface RevalidateOptions {
  paths?: string[];
  tags?: string[];
}

export async function triggerOnDemandRevalidation(options: RevalidateOptions): Promise<void> {
  const { paths = [], tags = [] } = options;

  // Clean empty strings or falsy values
  const cleanedPaths = Array.from(new Set(paths.filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim() !== ''))));
  const cleanedTags = Array.from(new Set(tags.filter((t): t is string => Boolean(t && typeof t === 'string' && t.trim() !== ''))));

  if (cleanedPaths.length === 0 && cleanedTags.length === 0) {
    return;
  }

  const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET || DEFAULT_SECRET;

  try {
    // Non-blocking asynchronous fetch to our internal Next.js API revalidation route
    if (typeof window !== 'undefined') {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({
          secret,
          paths: cleanedPaths,
          tags: cleanedTags,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[On-Demand Revalidation Success]:', data);
          }
        })
        .catch((err) => {
          console.warn('[On-Demand Revalidation Non-blocking Fetch Warning]:', err);
        });
    }
  } catch (error) {
    // Never let revalidation errors break or block admin DB write actions
    console.warn('[On-Demand Revalidation Caught Warning]:', error);
  }
}
