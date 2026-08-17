import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-backend.onrender.com/api/v1';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanDescription(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
}

function formatImageUrl(img: string): string {
  if (!img) return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  const base = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${base}${path}`;
}

export async function GET() {
  let products: any[] = [];

  try {
    const res = await fetch(`${API_URL}/products?limit=2000`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      products = json?.data?.products || json?.products || json?.data || [];
    }
  } catch (error) {
    console.error('Meta product feed fetch error:', error);
  }

  const itemsXml = products
    .filter((product: any) => product && (product._id || product.id) && product.title)
    .map((product: any) => {
      const productId = String(product._id || product.id);
      const title = product.title || product.name || 'Product';
      const descRaw = cleanDescription(product.description || product.shortDescription || title);
      const desc = descRaw || title;
      const slug = product.slug || productId;
      const productLink = `${SITE_URL}/products/${slug}`;

      const mainImageRaw = product.productImages?.[0] || product.images?.[0] || product.image || '';
      const imageLink = formatImageUrl(mainImageRaw);

      const priceNum = Number(product.price) || 0;
      const salePriceNum = Number(product.salePrice) || 0;
      const isDiscountExpired = product.discountEndDate && new Date() > new Date(product.discountEndDate);
      const hasSale = !isDiscountExpired && salePriceNum > 0 && priceNum > 0 && salePriceNum < priceNum;

      const regularPriceStr = `${priceNum > 0 ? priceNum : salePriceNum} BDT`;
      const salePriceStr = hasSale ? `${salePriceNum} BDT` : '';

      const stockQty = Number(product.stockQuantity);
      const isInStock = (isNaN(stockQty) || stockQty > 0) && product.status !== 'inactive';
      const availability = isInStock ? 'in stock' : 'out of stock';

      const brandName = product.brand || 'Charulata Lifestyle';

      return `    <item>
      <g:id>${escapeXml(productId)}</g:id>
      <g:title><![CDATA[${title}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand><![CDATA[${brandName}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${regularPriceStr}</g:price>${hasSale ? `\n      <g:sale_price>${salePriceStr}</g:sale_price>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charulata Lifestyle Product Catalog Feed</title>
    <link>${SITE_URL}</link>
    <description>Meta / Facebook Commerce Manager Product Catalog Data Feed for Charulata Lifestyle</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
