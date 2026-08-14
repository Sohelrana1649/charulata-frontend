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
          '/reset-password',
          '/verify-otp',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
