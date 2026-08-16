import type { Metadata } from 'next';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  title: 'যোগাযোগ করুন | Contact Us — Charulata Lifestyle',
  description:
    'চারুলতা লাইফস্টাইলে যোগাযোগ করুন। অর্ডার, ডেলিভারি বা প্রোডাক্ট সম্পর্কে জিজ্ঞাসা? আমাদের কাস্টমার সার্ভিস টিম সর্বদা আপনার পাশে। Contact Charulata Lifestyle for orders, delivery, or product inquiries.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: {
      'bn-BD': `${SITE_URL}/contact?lang=bn`,
      'en-US': `${SITE_URL}/contact?lang=en`,
    },
  },
  openGraph: {
    title: 'যোগাযোগ করুন | Contact Charulata Lifestyle',
    description:
      'অর্ডার, ডেলিভারি বা প্রোডাক্ট সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন। ফোন: +8801620556299',
    url: `${SITE_URL}/contact`,
    siteName: 'Charulata Lifestyle',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle — Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'যোগাযোগ করুন | Contact Charulata Lifestyle',
    description:
      'অর্ডার, ডেলিভারি বা প্রোডাক্ট সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন।',
    images: ['/logo.png'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Charulata Lifestyle',
    description: 'Get in touch with Charulata Lifestyle customer service.',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Charulata Lifestyle',
      url: SITE_URL,
      telephone: '+8801620556299',
      email: 'charulatalifestyle@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'BD',
        addressLocality: 'Dhaka',
      },
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
        name: 'Contact',
        item: `${SITE_URL}/contact`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={contactJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
