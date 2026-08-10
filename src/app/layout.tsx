import type { Metadata } from 'next';
import { Poppins, Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import ThemeScript from '@/components/ThemeScript';
import FacebookPixel from '@/components/analytics/FacebookPixel';

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

export const metadata: Metadata = {
  title: 'Charulata Lifestyle | Premium Ethnic Wear & Lifestyle Boutique',
  description: 'Shop premium sarees, panjabis, home decor, and authentic products at Charulata Lifestyle. Enjoy frictionless shopping with 1-click Cash on Delivery.',
  keywords: 'charulata lifestyle, ethnic wear, sarees, bangladesh fashion, panjabi, checkout, premium brand',
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
