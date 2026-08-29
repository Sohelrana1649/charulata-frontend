import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Poppins, Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import ThemeScript from '@/components/ThemeScript';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import JsonLd from '@/components/common/JsonLd';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-bengali',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Charulata Lifestyle | Premium Bangladeshi Fashion & Lifestyle Store',
    template: '%s | Charulata Lifestyle',
  },
  description: 'চারুলতা লাইফস্টাইল - বাংলাদেশের প্রিমিয়াম ফ্যাশন ব্র্যান্ড। শাড়ি, পাঞ্জাবি, জুয়েলারি ও পারফিউম। ক্যাশ অন ডেলিভারি সারা বাংলাদেশে।',
  keywords: [
    'charulata lifestyle',
    'charulata bd',
    'চারুলতা লাইফস্টাইল',
    'bangladeshi fashion store',
    'sarees bangladesh',
    'শাড়ি অনলাইন শপিং',
    'panjabi for men',
    'পাঞ্জাবি',
    'sports bra bangladesh',
    'attar perfume bd',
    'আতর ও পারফিউম',
    'jewelry bangladesh',
    'জুয়েলারি',
    'ethnic wear bangladesh',
    'online shopping bd',
    'cash on delivery fashion bd',
  ],
  authors: [{ name: 'Charulata Lifestyle', url: SITE_URL }],
  creator: 'Charulata Lifestyle',
  publisher: 'Charulata Lifestyle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'bn-BD': `${SITE_URL}?lang=bn`,
      'en-US': `${SITE_URL}?lang=en`,
    },
  },
  openGraph: {
    title: 'Charulata Lifestyle | Premium Bangladeshi Fashion & Lifestyle Store',
    description: 'Shop premium sarees, panjabi, sports bra, attar & perfume, jewelry at Charulata Lifestyle. Fast shipping & Cash on Delivery across Bangladesh.',
    url: SITE_URL,
    siteName: 'Charulata Lifestyle',
    locale: 'bn_BD',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Charulata Lifestyle - Premium Bangladeshi Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Charulata Lifestyle | Premium Bangladeshi Fashion & Lifestyle Store',
    description: 'Shop premium sarees, panjabi, sports bra, attar & perfume, jewelry at Charulata Lifestyle. Fast shipping & Cash on Delivery across Bangladesh.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    google: 'HWanxdrZoxXBJQpbpNHjpZW5OqIUqJT4knccBvSGESY',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Charulata Lifestyle',
    altName: 'চারুলতা লাইফস্টাইল',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+8801620556299',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
    sameAs: [
      'https://www.facebook.com/charulatalifestyle',
      'https://www.instagram.com/charulatalifestyle',
    ],
  };

  // WebSite schema with SearchAction — enables Google Sitelinks Searchbox
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Charulata Lifestyle',
    alternateName: 'চারুলতা লাইফস্টাইল',
    url: SITE_URL,
    inLanguage: ['bn-BD', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // OnlineStore schema — Google Merchant / E-commerce rich results
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Charulata Lifestyle',
    alternateName: 'চারুলতা লাইফস্টাইল',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description: 'বাংলাদেশের প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল ব্র্যান্ড। Shop sarees, panjabi, sports bra, attar, perfume, jewelry & lifestyle products.',
    telephone: '+8801620556299',
    email: 'charulatalifestyle@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shofi Complex, 1/A Outer Circular Rd',
      addressLocality: 'Moghbazar, Dhaka',
      addressRegion: 'Dhaka',
      postalCode: '1217',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.7465,
      longitude: 90.4040,
    },
    priceRange: '৳৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash, bKash, Nagad, Card',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '21:00',
    },
    sameAs: [
      'https://www.facebook.com/charulatalifestyle',
      'https://www.instagram.com/charulatalifestyle',
    ],
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${notoSansBengali.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={storeJsonLd} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-800 font-sans" suppressHydrationWarning>
        <Providers>
          <FacebookPixel />
          <GoogleAnalytics />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
