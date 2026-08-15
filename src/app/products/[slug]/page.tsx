import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.product || json?.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Charulata Lifestyle',
      description: 'The requested product could not be found at Charulata Lifestyle.',
    };
  }

  const categoryName = product?.category?.name || 'Ethnic Wear';
  const effectivePrice = product.salePrice || product.price;
  const title = `${product.title} - ৳${effectivePrice.toLocaleString()}`;
  const plainDesc = product.description ? product.description.replace(/<[^>]*>/g, '').trim() : '';
  const description = `Buy ${product.title} (${categoryName}) online at Charulata Lifestyle. Special Price ৳${effectivePrice}. Fast shipping & 1-Click Cash on Delivery across Bangladesh. ${plainDesc ? plainDesc.slice(0, 120) : ''}`;
  const images = product.productImages && product.productImages.length > 0 ? product.productImages : ['/logo.png'];

  return {
    title,
    description,
    keywords: [
      product.title,
      categoryName,
      'charulata lifestyle',
      'bangladesh fashion',
      'online shopping bd',
      'saree',
      'panjabi',
      'attar',
      'jewelry',
    ],
    alternates: {
      canonical: `${SITE_URL}/products/${product.slug}`,
      languages: {
        'bn-BD': `${SITE_URL}/products/${product.slug}?lang=bn`,
        'en-US': `${SITE_URL}/products/${product.slug}?lang=en`,
      },
    },
    openGraph: {
      title: `${product.title} | Charulata Lifestyle`,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      siteName: 'Charulata Lifestyle',
      locale: 'bn_BD',
      type: 'article',
      images: images.map((imgUrl: string) => ({
        url: imgUrl,
        alt: `${product.title} - চারুলতা লাইফস্টাইল`,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Charulata Lifestyle`,
      description,
      images: [images[0]],
    },
  };
}

export default async function ProductDetailPageServer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return <ProductDetailClient />;
  }

  const categoryName = product?.category?.name || 'Collection';
  const categorySlug = product?.category?.slug || 'all';
  const effectivePrice = product.salePrice || product.price;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.productImages || [],
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Charulata Lifestyle',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'BDT',
      price: effectivePrice,
      priceValidUntil: product.discountEndDate
        ? new Date(product.discountEndDate).toISOString().split('T')[0]
        : '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Charulata Lifestyle',
      },
    },
    ...(product.ratings?.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratings.average,
        reviewCount: product.ratings.count,
      },
    }),
  };

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
        name: categoryName,
        item: `${SITE_URL}/category/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailClient />
    </>
  );
}
