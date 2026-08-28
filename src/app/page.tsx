import type { Metadata } from 'next';
import HomeClientView from './HomeClientView';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';

export const revalidate = 300; // 5 minutes ISR revalidation

async function fetchLandingData() {
  try {
    const res = await fetch(`${API_URL}/landing`, {
      next: { revalidate: 300, tags: ['landing', 'banners', 'categories', 'products', 'campaigns'] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
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
