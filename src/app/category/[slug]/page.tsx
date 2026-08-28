import type { Metadata } from 'next';
import { cache } from 'react';
import CategoryClientView from './CategoryClientView';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.charulatalifestyle.com';
const cleanApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
  if (url.includes('charulata-backend.onrender.com')) {
    url = url.replace('charulata-backend.onrender.com', 'charulata-database.onrender.com');
  }
  return url;
};

const API_URL = cleanApiUrl();

export const dynamicParams = true;
export const revalidate = 300; // 5 minutes ISR revalidation
export const maxDuration = 60; // Up to 60s serverless timeout

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 300, tags: ['categories'] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const categories = json?.data?.categories || json?.categories || json?.data || [];
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((c: any) => c?.slug)
      .map((c: any) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

const fetchCategoryBySlug = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 300, tags: ['categories', `category-${slug}`] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.category || json?.data || json;
  } catch {
    return null;
  }
});

const fetchCategoryProducts = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_URL}/products?category=${slug}&limit=40`, {
      next: { revalidate: 300, tags: ['products', `category-${slug}`] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const products = json?.data?.products || json?.products || json?.data || [];
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const category = await fetchCategoryBySlug(slug);

  const categoryName = category?.name || slug?.replace(/-/g, ' ') || 'Collection';
  const categoryNameBn = category?.nameBn || '';
  const title = `${categoryName} ${categoryNameBn ? `(${categoryNameBn})` : ''} Collection | Charulata Lifestyle`;
  const description = category?.description || `Shop exclusive ${categoryName} online at Charulata Lifestyle BD. Best prices, premium quality & 1-Click Cash on Delivery in Bangladesh.`;
  const image = category?.image || '/logo.png';

  return {
    title,
    description,
    keywords: [
      categoryName,
      categoryNameBn,
      'charulata lifestyle',
      'bangladeshi sarees',
      'panjabi collection',
      'sports bra bd',
      'attar perfume',
      'jewelry bangladesh',
      'online shopping bd',
    ],
    alternates: {
      canonical: `${SITE_URL}/category/${slug}`,
      languages: {
        'bn-BD': `${SITE_URL}/category/${slug}?lang=bn`,
        'en-US': `${SITE_URL}/category/${slug}?lang=en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${slug}`,
      siteName: 'Charulata Lifestyle',
      locale: 'bn_BD',
      type: 'website',
      images: [
        {
          url: image,
          alt: `${categoryName} - Charulata Lifestyle`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function CategoryPageServer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const [category, products] = await Promise.all([
    fetchCategoryBySlug(slug),
    fetchCategoryProducts(slug),
  ]);

  const categoryName = category?.name || slug?.replace(/-/g, ' ') || 'Category';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${SITE_URL}/search`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/category/${slug}`,
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${categoryName} Collection`,
    url: `${SITE_URL}/category/${slug}`,
    numberOfItems: products.length,
    itemListElement: products.map((p: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: p.title,
      url: `${SITE_URL}/products/${p.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {products.length > 0 && <JsonLd data={itemListJsonLd} />}
      <CategoryClientView 
        initialCategory={category} 
        initialProducts={products} 
        slug={slug} 
      />
    </>
  );
}
