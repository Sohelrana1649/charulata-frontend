import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/',
          '/checkout',
          '/cart',
          '/profile',
          '/orders',
          '/reset-password',
          '/forgot-password',
          '/verify-otp',
          '/login',
          '/register',
        ],
      },
      // Allow specific crawlers full access to public product/category/blog pages
      {
        userAgent: 'Googlebot',
        allow: [
          '/products/',
          '/category/',
          '/blog/',
          '/blog',
          '/search',
          '/about',
          '/contact',
          '/faq',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
