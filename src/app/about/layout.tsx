import type { Metadata } from 'next';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে | About Us — Charulata Lifestyle',
  description:
    'চারুলতা লাইফস্টাইল — বাংলাদেশের বিশ্বস্ত প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড। আমাদের মিশন, ভিশন এবং কেন হাজারো কাস্টমার আমাদের বিশ্বাস করেন তা জানুন। Learn about Charulata Lifestyle — Bangladesh\'s trusted premium fashion & lifestyle brand.',
  alternates: {
    canonical: `${SITE_URL}/about`,
    languages: {
      'bn-BD': `${SITE_URL}/about?lang=bn`,
      'en-US': `${SITE_URL}/about?lang=en`,
    },
  },
  openGraph: {
    title: 'আমাদের সম্পর্কে | About Charulata Lifestyle',
    description:
      'বাংলাদেশের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড — চারুলতা লাইফস্টাইল। Shop sarees, panjabi, jewelry, attar & perfume with Cash on Delivery.',
    url: `${SITE_URL}/about`,
    siteName: 'Charulata Lifestyle',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle — About Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'আমাদের সম্পর্কে | About Charulata Lifestyle',
    description:
      'বাংলাদেশের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড — চারুলতা লাইফস্টাইল।',
    images: ['/logo.png'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Charulata Lifestyle',
    description:
      'চারুলতা লাইফস্টাইল — বাংলাদেশের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড।',
    url: `${SITE_URL}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Charulata Lifestyle',
      url: SITE_URL,
    },
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
        name: 'About Us',
        item: `${SITE_URL}/about`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
