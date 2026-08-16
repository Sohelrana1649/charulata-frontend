import type { Metadata } from 'next';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  title: 'প্রোডাক্ট খুঁজুন | Search Products — Charulata Lifestyle',
  description:
    'চারুলতা লাইফস্টাইলের সমস্ত প্রোডাক্ট খুঁজুন — শাড়ি, পাঞ্জাবি, স্পোর্টস ব্রা, আতর ও পারফিউম, জুয়েলারি এবং আরও অনেক কিছু। Search & filter products by category, price, and rating at Charulata Lifestyle.',
  alternates: {
    canonical: `${SITE_URL}/search`,
    languages: {
      'bn-BD': `${SITE_URL}/search?lang=bn`,
      'en-US': `${SITE_URL}/search?lang=en`,
    },
  },
  openGraph: {
    title: 'প্রোডাক্ট খুঁজুন | Search — Charulata Lifestyle',
    description:
      'শাড়ি, পাঞ্জাবি, স্পোর্টস ব্রা, আতর ও পারফিউম, জুয়েলারি — ক্যাটাগরি, মূল্য ও রেটিং দিয়ে ফিল্টার করুন।',
    url: `${SITE_URL}/search`,
    siteName: 'Charulata Lifestyle',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle — Search Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'প্রোডাক্ট খুঁজুন | Search — Charulata Lifestyle',
    description:
      'শাড়ি, পাঞ্জাবি, স্পোর্টস ব্রা, আতর, জুয়েলারি — ক্যাটাগরি ও মূল্য দিয়ে ফিল্টার করুন।',
    images: ['/logo.png'],
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        name: 'Search Products',
        item: `${SITE_URL}/search`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
