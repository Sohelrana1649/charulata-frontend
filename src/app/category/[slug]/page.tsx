import type { Metadata } from 'next';
import CategoryClientView from './CategoryClientView';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchCategoryBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/categories/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.category || json?.data || json;
  } catch {
    return null;
  }
}

async function fetchCategoryProducts(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products?category=${slug}&limit=20`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.products || json?.products || json?.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const category = await fetchCategoryBySlug(slug);

  const categoryName = category?.name || slug.replace(/-/g, ' ');
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
  const category = await fetchCategoryBySlug(slug);
  const products = await fetchCategoryProducts(slug);

  const categoryName = category?.name || slug.replace(/-/g, ' ');

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
      <CategoryClientView initialCategory={category} />
    </>
  );
}
