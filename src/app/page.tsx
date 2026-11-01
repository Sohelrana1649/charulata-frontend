import type { Metadata } from 'next';
import HomeClientView from './HomeClientView';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const cleanApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.charulatalifestyle.com/api/v1';
};

const API_URL = cleanApiUrl();

export const revalidate = 300; // 5 minutes ISR revalidation

async function fetchLandingData() {
  try {
    const [landingRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/landing`, {
        next: { revalidate: 60, tags: ['landing', 'banners', 'categories', 'products', 'campaigns'] },
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${API_URL}/products?limit=100`, {
        next: { revalidate: 60, tags: ['products'] },
        signal: AbortSignal.timeout(6000),
      }).catch(() => null),
    ]);

    if (!landingRes.ok) return null;
    const json = await landingRes.json();
    const landingData = json?.data || json;

    if (landingData && productsRes && productsRes.ok) {
      try {
        const prodJson = await productsRes.json();
        const allProductsList = Array.isArray(prodJson?.products)
          ? prodJson.products
          : (Array.isArray(prodJson?.data?.products) ? prodJson.data.products : (Array.isArray(prodJson?.data) ? prodJson.data : []));
        const stockMap = new Map<string, any>();
        for (const p of allProductsList) {
          if (p._id) stockMap.set(String(p._id), p);
          if (p.sku) stockMap.set(String(p.sku), p);
        }

        const hydrateProductList = (list: any[]) => {
          if (!Array.isArray(list)) return list;
          return list.map((item) => {
            const match = stockMap.get(String(item._id)) || stockMap.get(String(item.sku));
            if (match) {
              return {
                ...item,
                stockQuantity: match.stockQuantity !== undefined ? match.stockQuantity : item.stockQuantity,
                variants: Array.isArray(match.variants) ? match.variants : item.variants,
                isActive: match.isActive !== undefined ? match.isActive : item.isActive,
                isOutOfStock: match.isOutOfStock !== undefined ? match.isOutOfStock : item.isOutOfStock,
              };
            }
            return item;
          });
        };

        if (landingData.bestSelling) landingData.bestSelling = hydrateProductList(landingData.bestSelling);
        if (landingData.newArrivals) landingData.newArrivals = hydrateProductList(landingData.newArrivals);
        if (landingData.flashSale) landingData.flashSale = hydrateProductList(landingData.flashSale);
        if (landingData.allProducts) landingData.allProducts = hydrateProductList(landingData.allProducts);
      } catch (err) {
        console.warn('[Landing Data Hydration Warning]:', err);
      }
    }

    return landingData;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const landingData = await fetchLandingData();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Charulata Lifestyle',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+8801620556299',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['bn', 'en'],
    },
    sameAs: [
      'https://www.facebook.com/charulatalifestyle',
      'https://www.instagram.com/charulatalifestyle',
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Charulata Lifestyle',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <HomeClientView initialData={landingData} />
    </>
  );
}
