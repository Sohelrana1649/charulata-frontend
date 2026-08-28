import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.charulatalifestyle.com';

const getCleanApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
  if (url.includes('charulata-backend.onrender.com')) {
    url = url.replace('charulata-backend.onrender.com', 'charulata-database.onrender.com');
  }
  return url;
};

const API_URL = getCleanApiUrl();

export const dynamicParams = true;
export const revalidate = 120; // 2 minutes ISR revalidation
export const maxDuration = 60; // Up to 60s serverless timeout

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?limit=100`, {
      next: { revalidate: 120, tags: ['products'] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const products = json?.data?.products || json?.products || json?.data || [];
    if (!Array.isArray(products)) return [];
    return products
      .filter((p: any) => p?.slug)
      .map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const fetchProductBySlug = cache(async (slug: string) => {
  try {
    const cleanSlug = encodeURIComponent(decodeURIComponent(slug));
    const res = await fetch(`${API_URL}/products/${cleanSlug}`, {
      next: { revalidate: 120, tags: ['product', 'products', `product-${cleanSlug}`] },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.product || json?.data || json;
  } catch (err) {
    console.warn(`[fetchProductBySlug Warning] Could not fetch product ${slug}:`, err);
    return null;
  }
});

const fetchRelatedProducts = cache(async (categoryId: string, currentProductId?: string) => {
  if (!categoryId) return [];
  try {
    const res = await fetch(`${API_URL}/products?category=${categoryId}&limit=6`, {
      next: { revalidate: 120, tags: ['products'] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const products = Array.isArray(json?.data) ? json.data : (json?.data?.products || json?.products || []);
    if (!Array.isArray(products)) return [];
    return products.filter((p: any) => (p._id || p.id)?.toString() !== currentProductId?.toString()).slice(0, 4);
  } catch {
    return [];
  }
});

const fetchProductReviews = cache(async (productId: string) => {
  try {
    const res = await fetch(`${API_URL}/reviews/product/${productId}?limit=10&sort=-createdAt`, {
      next: { revalidate: 120, tags: ['reviews', `product-reviews-${productId}`] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const reviews = json?.data?.reviews || json?.reviews || json?.data || [];
    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }
});

const safeIsoDate = (val?: any): string | undefined => {
  if (!val) return undefined;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const rawSlug = resolvedParams?.slug;
    const slug = rawSlug ? decodeURIComponent(rawSlug) : '';
    const product = slug ? await fetchProductBySlug(slug) : null;

    if (!product) {
      return {
        title: 'Product Details | Charulata Lifestyle',
        description: 'Explore premium fashion and lifestyle products at Charulata Lifestyle.',
      };
    }

    const categoryName = product?.category?.name || (typeof product?.category === 'string' ? product.category : 'Ethnic Wear');
    const effectivePrice = Number(product?.salePrice || product?.price) || 0;
    const productTitle = product?.title || 'Product';
    const title = `${productTitle} - ৳${effectivePrice.toLocaleString()}`;
    const plainDesc = product?.description ? product.description.replace(/<[^>]*>/g, '').trim() : '';
    const description = `Buy ${productTitle} (${categoryName}) online at Charulata Lifestyle. Special Price ৳${effectivePrice}. Fast shipping & 1-Click Cash on Delivery across Bangladesh. ${plainDesc ? plainDesc.slice(0, 120) : ''}`;
    
    const images = (Array.isArray(product?.productImages) ? product.productImages : [])
      .concat(Array.isArray(product?.images) ? product.images : [])
      .concat(product?.image ? [product.image] : [])
      .filter((img: any) => typeof img === 'string' && img.trim() !== '');
    const validImages = images.length > 0 ? images : ['https://www.charulatalifestyle.com/logo.png'];

    return {
      title,
      description,
      keywords: [
        productTitle,
        categoryName,
        'charulata lifestyle',
        'চারুলতা লাইফস্টাইল',
        'bangladesh fashion',
        'online shopping bd',
        'cash on delivery',
        ...(Array.isArray(product?.tags) ? product.tags : []),
      ],
      alternates: {
        canonical: `${SITE_URL}/products/${product?.slug || slug}`,
        languages: {
          'bn-BD': `${SITE_URL}/products/${product?.slug || slug}?lang=bn`,
          'en-US': `${SITE_URL}/products/${product?.slug || slug}?lang=en`,
        },
      },
      openGraph: {
        title: `${productTitle} | Charulata Lifestyle`,
        description,
        url: `${SITE_URL}/products/${product?.slug || slug}`,
        siteName: 'Charulata Lifestyle',
        locale: 'bn_BD',
        type: 'website',
        images: validImages.map((imgUrl: string) => ({
          url: imgUrl,
          width: 1200,
          height: 1200,
          alt: `${productTitle} - চারুলতা লাইফস্টাইল`,
        })),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productTitle} | Charulata Lifestyle`,
        description,
        images: [validImages[0]],
      },
    };
  } catch (err) {
    return {
      title: 'Product Details | Charulata Lifestyle',
      description: 'Explore premium fashion and lifestyle products at Charulata Lifestyle.',
    };
  }
}

export default async function ProductDetailPageServer({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
  const product = slug ? await fetchProductBySlug(slug) : null;

  // Gracefully fallback to client-side hydration if server SSR fetch is cold or missing
  if (!product) {
    return (
      <ProductDetailClient 
        slug={slug}
        initialProduct={null}
        initialRelatedProducts={[]}
        initialReviews={[]}
      />
    );
  }

  const categoryName = product?.category?.name || (typeof product?.category === 'string' ? product.category : 'Collection');
  const categorySlug = product?.category?.slug || 'all';
  const categoryId = product?.category?._id || product?.category;
  const effectivePrice = Number(product?.salePrice || product?.price) || 0;
  const plainDesc = product?.description ? product.description.replace(/<[^>]*>/g, '').trim() : '';

  // Fetch related products and reviews server-side for ISR pre-rendering
  let relatedProducts: any[] = [];
  let reviews: any[] = [];
  try {
    [relatedProducts, reviews] = await Promise.all([
      categoryId ? fetchRelatedProducts(categoryId, product._id) : Promise.resolve([]),
      product._id ? fetchProductReviews(product._id) : Promise.resolve([]),
    ]);
  } catch {
    // Graceful fallback if related items fail
  }

  const productImages = (Array.isArray(product?.productImages) ? product.productImages : [])
    .concat(Array.isArray(product?.images) ? product.images : [])
    .concat(product?.image ? [product.image] : [])
    .filter((img: any) => typeof img === 'string' && img.trim() !== '');

  const productJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.title || 'Product',
    image: productImages.length > 0 ? productImages : ['https://www.charulatalifestyle.com/logo.png'],
    description: plainDesc || product?.title || 'Product',
    sku: product?.sku || product?._id,
    mpn: product?.sku || product?._id,
    brand: {
      '@type': 'Brand',
      name: 'Charulata Lifestyle',
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product?.slug || slug}`,
      priceCurrency: 'BDT',
      price: effectivePrice,
      priceValidUntil: safeIsoDate(product?.discountEndDate) || '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (Number(product?.stockQuantity) || 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Charulata Lifestyle',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '60',
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 3,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  // Add highPrice for sale items
  if (product?.salePrice && product?.price > product?.salePrice) {
    productJsonLd.offers.highPrice = product.price;
  }

  // Add AggregateRating if product has reviews
  if (product?.ratings?.count > 0 && product?.ratings?.average > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratings.average,
      reviewCount: product.ratings.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add individual Review items for rich snippet (up to 5 latest)
  if (reviews.length > 0) {
    productJsonLd.review = reviews
      .filter((r: any) => r && r.comment && r.rating)
      .slice(0, 5)
      .map((r: any) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          '@type': 'Person',
          name: r.customer?.name || r.name || 'Customer',
        },
        reviewBody: r.comment,
        datePublished: safeIsoDate(r.createdAt),
      }));
  }

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
        name: product?.title || 'Product',
        item: `${SITE_URL}/products/${product?.slug || slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailClient 
        slug={slug}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
        initialReviews={reviews}
      />
    </>
  );
}
