import type { Metadata } from 'next';
import JsonLd from '@/components/common/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  title: 'সচরাচর জিজ্ঞাসা | FAQ — Charulata Lifestyle',
  description:
    'চারুলতা লাইফস্টাইল সম্পর্কিত সকল প্রশ্নের উত্তর — ডেলিভারি, ক্যাশ অন ডেলিভারি, রিটার্ন পলিসি, অর্ডার ট্র্যাকিং এবং আরও অনেক কিছু। Frequently asked questions about shipping, COD, returns & order tracking.',
  alternates: {
    canonical: `${SITE_URL}/faq`,
    languages: {
      'bn-BD': `${SITE_URL}/faq?lang=bn`,
      'en-US': `${SITE_URL}/faq?lang=en`,
    },
  },
  openGraph: {
    title: 'সচরাচর জিজ্ঞাসা | FAQ — Charulata Lifestyle',
    description:
      'ডেলিভারি, পেমেন্ট, রিটার্ন পলিসি সম্পর্কে আপনার সকল প্রশ্নের উত্তর এখানে পাবেন।',
    url: `${SITE_URL}/faq`,
    siteName: 'Charulata Lifestyle',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle — FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সচরাচর জিজ্ঞাসা | FAQ — Charulata Lifestyle',
    description:
      'ডেলিভারি, পেমেন্ট, রিটার্ন পলিসি সম্পর্কে আপনার সকল প্রশ্নের উত্তর।',
    images: ['/logo.png'],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Google FAQPage structured data — enables FAQ Rich Results in Google Search
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does shipping take within Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We deliver within 1-2 business days inside Dhaka and 3-5 business days for the rest of Bangladesh. All orders are processed within 24 hours.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer Cash on Delivery (COD)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer Cash on Delivery (COD) across all 64 districts of Bangladesh. You can also pay via bKash, Nagad, or card payment during checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your return & exchange policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept returns and exchanges within 3 days of delivery. Products must be unused and in their original packaging. Contact our support team to initiate a return.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I track my order status?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes, you can track your order using the tracking ID sent to your email or phone. Visit our 'Track Order' page for real-time updates.",
        },
      },
      {
        '@type': 'Question',
        name: 'Do you have a physical retail flagship store?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We have an office & showroom at Shofi Complex, 1/A Outer Circular Rd, Moghbazar, Dhaka. Visit us for an in-person shopping experience.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I place an order?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Select your preferred product, size, and color, and then click "Add to Cart" or "Buy Now". Fill in your shipping details and select your payment method to successfully place your order.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there any delivery charges?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, the delivery charge inside Dhaka city is BDT 60, and outside Dhaka is BDT 120.',
        },
      },
    ],
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
        name: 'FAQ',
        item: `${SITE_URL}/faq`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
