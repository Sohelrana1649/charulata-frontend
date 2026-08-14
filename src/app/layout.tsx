import type { Metadata } from 'next';
import { Poppins, Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import ThemeScript from '@/components/ThemeScript';
import FacebookPixel from '@/components/analytics/FacebookPixel';
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

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Charulata Lifestyle | Premium Bangladeshi Fashion & Lifestyle Store',
    template: '%s | Charulata Lifestyle',
  },
  description: 'চারুলতা লাইফস্টাইল - বাংলাদেশের প্রিমিয়াম ফ্যাশন ব্র্যান্ড। Shop exclusive sarees, panjabi, sports bra, attar & perfume, jewelry, and ethnic lifestyle products. 1-Click Cash on Delivery across Bangladesh.',
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

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-800 font-sans" suppressHydrationWarning>
        <Providers>
          <FacebookPixel />
          <Header />
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
