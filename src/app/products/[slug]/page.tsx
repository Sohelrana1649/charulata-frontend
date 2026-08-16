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

async function fetchProductReviews(productId: string) {
  try {
    const res = await fetch(`${API_URL}/reviews/product/${productId}?limit=5&sort=-createdAt`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const reviews = json?.data?.reviews || json?.reviews || json?.data || [];
    return Array.isArray(reviews) ? reviews : [];
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
      'চারুলতা লাইফস্টাইল',
      'bangladesh fashion',
      'online shopping bd',
      'cash on delivery',
      ...(product.tags || []),
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
      type: 'website',
      images: images.map((imgUrl: string) => ({
        url: imgUrl,
        width: 1200,
        height: 1200,
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
  const plainDesc = product.description ? product.description.replace(/<[^>]*>/g, '').trim() : '';

  // Fetch latest reviews server-side for JSON-LD schema
  const reviews = product._id ? await fetchProductReviews(product._id) : [];

  const productJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.productImages || [],
    description: plainDesc || product.title,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Charulata Lifestyle',
    },
    category: categoryName,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'BDT',
      price: effectivePrice,
      priceValidUntil: product.discountEndDate
        ? new Date(product.discountEndDate).toISOString().split('T')[0]
        : '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stockQuantity > 0
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
  if (product.salePrice && product.price > product.salePrice) {
    productJsonLd.offers.highPrice = product.price;
  }

  // Add AggregateRating if product has reviews
  if (product.ratings?.count > 0) {
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
      .filter((r: any) => r.comment && r.rating)
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
        datePublished: r.createdAt
          ? new Date(r.createdAt).toISOString().split('T')[0]
          : undefined,
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
