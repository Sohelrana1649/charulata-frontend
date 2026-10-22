'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Truck,
  Lock,
  MessageCircle,
  Send,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useTranslation } from '@/i18n/LanguageContext';
import { useGetSettingsQuery } from '@/store/api/settingsApi';
import NewsletterSection from './NewsletterSection';

export default function Footer() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { data: settingsData } = useGetSettingsQuery();
  const settings = settingsData?.data;

  const footerLogo = settings?.footerLogo || '/logo.png';
  const brandName = settings?.storeName || (locale === 'bn' ? 'চারুলতা লাইফস্টাইল' : 'Charulata Lifestyle');

  // Contact details provided by settings / application
  const storeAddress = settings?.storeAddress || (
    locale === 'bn'
      ? 'শফী কমপ্লেক্স, ১/এ আউটার সার্কুলার রোড, মগবাজার, ঢাকা'
      : 'Shofi Complex, 1/A Outer Circular Rd, Moghbazar, Dhaka'
  );
  const storePhone = settings?.storePhone || '01620-556299';
  const rawPhone = storePhone.replace(/[^0-9+]/g, '');
  const storeEmail = settings?.storeEmail || 'charulatalifestyl@gmail.com';
  const facebookUrl = settings?.facebookUrl || 'https://web.facebook.com/charulatalifestyle';
  const instagramUrl = 'https://www.instagram.com/charulatalifestyl';
  const whatsappUrl = 'https://wa.me/8801620556299';
  const telegramUrl = 'https://t.me/charulatalifestyle';

  // Mobile accordion state for collapsible footer groups
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    customerService: false,
    shoppingInfo: false,
    about: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  // Do not render footer on admin dashboard or checkout page
  if (isAdminPage || isCheckoutPage) return null;

  return (
    <footer
      role="contentinfo"
      className="relative bg-zinc-950 text-zinc-300 border-t border-zinc-800/90 overflow-hidden"
    >
      {/* Subtle Top Rose Glow Gradient Line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-75"
      />

      {/* Ambient Lighting Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-48 bg-primary/10 rounded-full blur-[120px]"
      />

      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 pt-12 sm:pt-16 pb-24 sm:pb-12 lg:pb-8 sm:px-6 lg:px-10 xl:px-12 relative z-10">

        {/* 1. Value Props Banner */}
        <section aria-label="Store Guarantees" className="mb-10 sm:mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 pb-10 sm:pb-12 border-b border-zinc-800/80">

            {/* Fast Delivery */}
            <div className="group flex items-center space-x-3.5 sm:space-x-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-primary/40 hover:bg-zinc-900/80 transition-all duration-300">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Truck size={22} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                  {t('footer.fastDelivery') || 'Fast Delivery'}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                  {t('footer.fastDeliverySub') || 'Quick home delivery all over Bangladesh'}
                </p>
              </div>
            </div>

            {/* 100% Original */}
            <div className="group flex items-center space-x-3.5 sm:space-x-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-primary/40 hover:bg-zinc-900/80 transition-all duration-300">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ShieldCheck size={22} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                  {t('footer.original') || '100% Original'}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                  {t('footer.originalSub') || 'Handpicked premium products guaranteed'}
                </p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="group flex items-center space-x-3.5 sm:space-x-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-primary/40 hover:bg-zinc-900/80 transition-all duration-300">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Lock size={22} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                  {t('footer.securePayment') || 'Secure Payment'}
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                  {t('footer.securePaymentSub') || 'Cash on Delivery & Secure Digital Checkout'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 2. Newsletter Subscription Section (Prominent, High-Converting) */}
        <NewsletterSection />

        {/* 3. Main Footer Link Grid (5 Organized Groups) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-6 md:gap-8 lg:gap-8 mb-12 sm:mb-16">

          {/* Group 1: Brand & About HoludMaya */}
          <div className="lg:col-span-1 space-y-4">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label={`${brandName} Home`}
              className="relative h-12 w-36 sm:h-14 sm:w-44 flex items-center justify-start shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              suppressHydrationWarning
            >
              <Image
                src={footerLogo}
                alt={`${brandName} Logo`}
                width={200}
                height={56}
                suppressHydrationWarning
                className="h-full w-auto object-contain brightness-110"
              />
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
              {t('footer.brandDesc') || (
                locale === 'bn'
                  ? 'হলুদমায়া দিচ্ছে সেরা ফ্যাশন ও লাইফস্টাইল পণ্য। আমাদের কাছে পাবেন প্রিমিয়াম শাড়ি, পাঞ্জাবি, জুয়েলারি এবং আধুনিক লাইফস্টাইল কালেকশন।'
                  : 'HoludMaya offers the finest fashion and lifestyle collections at unmatched quality across Bangladesh.'
              )}
            </p>

            {/* Social Media Link Buttons (Group 5 - Featured with Brand) */}
            <div className="pt-2">
              <span className="block text-[11px] uppercase font-bold tracking-wider text-zinc-400 mb-2.5">
                {t('footer.socialMedia') || (locale === 'bn' ? 'সোশ্যাল মিডিয়া' : 'Social Media')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brandName} on Facebook`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:outline-none"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brandName} on Instagram`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E4405F]/30 bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E4405F] focus-visible:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Contact ${brandName} on WhatsApp`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:outline-none"
                >
                  <MessageCircle size={19} />
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brandName} on Telegram`}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#0088cc]/30 bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0088cc] focus-visible:outline-none"
                >
                  <Send size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Group 2: Customer Service (Collapsible Accordion on Mobile) */}
          <nav aria-label={t('footer.customerService') || 'Customer Service'} className="border-b md:border-b-0 border-zinc-800/80 pb-4 md:pb-0">
            {/* Mobile Accordion Header Button */}
            <button
              type="button"
              onClick={() => toggleSection('customerService')}
              aria-expanded={openSections.customerService}
              className="md:hidden w-full flex items-center justify-between py-2 text-left font-extrabold uppercase tracking-wider text-xs sm:text-sm !text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <span className="flex items-center">
                <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
                {t('footer.customerService') || (locale === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service')}
              </span>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-300 ${openSections.customerService ? 'rotate-180 text-primary' : ''}`}
              />
            </button>

            {/* Desktop Static Header */}
            <h4 className="hidden md:flex items-center text-xs sm:text-sm font-extrabold uppercase tracking-wider !text-white mb-4 lg:mb-5">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.customerService') || (locale === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service')}
            </h4>

            {/* Link List */}
            <ul
              className={`space-y-1 md:space-y-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden ${openSections.customerService ? 'max-h-96 pt-2' : 'max-h-0 md:max-h-none md:pt-0'
                }`}
            >
              {[
                { label: t('footer.contactUs') || (locale === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'), href: "/contact" },
                { label: t('footer.trackOrder') || (locale === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'), href: "/profile?tab=orders" },
                { label: t('footer.orderHistory') || (locale === 'bn' ? 'অর্ডার ইতিহাস' : 'Order History'), href: "/profile?tab=orders" },
                { label: t('footer.refundPolicy') || (locale === 'bn' ? 'রিফান্ড ও রিটার্ন পলিসি' : 'Refund & Return Policy'), href: "/refund-policy" },
                { label: t('footer.faq') || (locale === 'bn' ? 'এফএকিউ / হেল্প ডেস্ক' : 'FAQ / Help Desk'), href: "/faq" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="group min-h-[44px] md:min-h-0 flex items-center py-1.5 md:py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-primary mr-1.5 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                    <span className="text-zinc-400 group-hover:text-white truncate border-b-2 border-transparent group-hover:border-primary/70 pb-0.5 transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Group 3: Shopping Information (Collapsible Accordion on Mobile) */}
          <nav aria-label={t('footer.shoppingInfo') || 'Shopping Information'} className="border-b md:border-b-0 border-zinc-800/80 pb-4 md:pb-0">
            {/* Mobile Accordion Header Button */}
            <button
              type="button"
              onClick={() => toggleSection('shoppingInfo')}
              aria-expanded={openSections.shoppingInfo}
              className="md:hidden w-full flex items-center justify-between py-2 text-left font-extrabold uppercase tracking-wider text-xs sm:text-sm !text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <span className="flex items-center">
                <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
                {t('footer.shoppingInfo') || (locale === 'bn' ? 'শপিং তথ্য' : 'Shopping Information')}
              </span>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-300 ${openSections.shoppingInfo ? 'rotate-180 text-primary' : ''}`}
              />
            </button>

            {/* Desktop Static Header */}
            <h4 className="hidden md:flex items-center text-xs sm:text-sm font-extrabold uppercase tracking-wider !text-white mb-4 lg:mb-5">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.shoppingInfo') || (locale === 'bn' ? 'শপিং তথ্য' : 'Shopping Information')}
            </h4>

            {/* Link List */}
            <ul
              className={`space-y-1 md:space-y-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden ${openSections.shoppingInfo ? 'max-h-96 pt-2' : 'max-h-0 md:max-h-none md:pt-0'
                }`}
            >
              {[
                { label: t('footer.allCollections') || (locale === 'bn' ? 'সকল কালেকশন' : 'All Collections'), href: "/search" },
                { label: t('footer.sareesEthnic') || (locale === 'bn' ? 'শাড়ি ও এথনিক ওয়্যার' : 'Sarees & Ethnic Wear'), href: "/search?category=jamdani-silk-sarees" },
                { label: t('footer.kurtasPanjabis') || (locale === 'bn' ? 'কুর্তা ও পাঞ্জাবি' : 'Kurtas & Panjabis'), href: "/search?category=panjabi" },
                { label: t('footer.premiumJewelry') || (locale === 'bn' ? 'প্রিমিয়াম জুয়েলারি' : 'Premium Jewelry'), href: "/search?category=jewelry" },
                { label: t('footer.modernGadgets') || (locale === 'bn' ? 'আধুনিক গ্যাজেট' : 'Modern Gadgets'), href: "/search?category=gadgets" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="group min-h-[44px] md:min-h-0 flex items-center py-1.5 md:py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-primary mr-1.5 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                    <span className="text-zinc-400 group-hover:text-white truncate border-b-2 border-transparent group-hover:border-primary/70 pb-0.5 transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Group 4: About Store (Collapsible Accordion on Mobile) */}
          <nav aria-label={t('footer.aboutStore') || t('footer.aboutHoludMaya') || `About ${brandName}`} className="border-b md:border-b-0 border-zinc-800/80 pb-4 md:pb-0">
            {/* Mobile Accordion Header Button */}
            <button
              type="button"
              onClick={() => toggleSection('about')}
              aria-expanded={openSections.about}
              className="md:hidden w-full flex items-center justify-between py-2 text-left font-extrabold uppercase tracking-wider text-xs sm:text-sm !text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <span className="flex items-center">
                <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
                {t('footer.aboutStore') || t('footer.aboutHoludMaya') || (locale === 'bn' ? 'চারুলতা লাইফস্টাইল সম্পর্কে' : `About ${brandName}`)}
              </span>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-300 ${openSections.about ? 'rotate-180 text-primary' : ''}`}
              />
            </button>

            {/* Desktop Static Header */}
            <h4 className="hidden md:flex items-center text-xs sm:text-sm font-extrabold uppercase tracking-wider !text-white mb-4 lg:mb-5">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.aboutStore') || t('footer.aboutHoludMaya') || (locale === 'bn' ? 'চারুলতা লাইফস্টাইল সম্পর্কে' : `About ${brandName}`)}
            </h4>

            {/* Link List */}
            <ul
              className={`space-y-1 md:space-y-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden ${openSections.about ? 'max-h-96 pt-2' : 'max-h-0 md:max-h-none md:pt-0'
                }`}
            >
              {[
                { label: t('footer.home') || (locale === 'bn' ? 'হোম' : 'Home'), href: "/" },
                { label: t('footer.aboutUs') || (locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'), href: "/about" },
                { label: t('footer.blogJournal') || (locale === 'bn' ? 'ব্লগ ও জার্নাল' : 'Blog & Journal'), href: "/blog" },
                { label: t('footer.privacyPolicy') || (locale === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'), href: "/privacy-policy" },
                { label: t('footer.termsConditions') || (locale === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'), href: "/terms" }
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="group min-h-[44px] md:min-h-0 flex items-center py-1.5 md:py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-primary mr-1.5 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                    <span className="text-zinc-400 group-hover:text-white truncate border-b-2 border-transparent group-hover:border-primary/70 pb-0.5 transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Group 5: Contact Information (Collapsible Accordion on Mobile) */}
          <address className="not-italic lg:col-span-1 border-b md:border-b-0 border-zinc-800/80 pb-4 md:pb-0">
            {/* Mobile Accordion Header Button */}
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              aria-expanded={openSections.contact}
              className="md:hidden w-full flex items-center justify-between py-2 text-left font-extrabold uppercase tracking-wider text-xs sm:text-sm !text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <span className="flex items-center">
                <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
                {t('footer.contactInfo') || (locale === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information')}
              </span>
              <ChevronDown
                size={16}
                className={`text-zinc-400 transition-transform duration-300 ${openSections.contact ? 'rotate-180 text-primary' : ''}`}
              />
            </button>

            {/* Desktop Static Header */}
            <h4 className="hidden md:flex items-center text-xs sm:text-sm font-extrabold uppercase tracking-wider !text-white mb-4 lg:mb-5">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.contactInfo') || (locale === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information')}
            </h4>

            {/* Contact Items */}
            <div
              className={`space-y-3 transition-all duration-300 overflow-hidden ${openSections.contact ? 'max-h-[500px] pt-2' : 'max-h-0 md:max-h-none md:pt-0'
                }`}
            >
              {/* Showroom & Office */}
              <div className="flex items-start space-x-3 text-xs sm:text-sm p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-zinc-100 font-extrabold leading-snug">
                    {t('footer.showroomHeadOffice') || (locale === 'bn' ? 'শোরুম ও হেড অফিস' : 'Showroom & Head Office')}
                  </span>
                  <span className="text-zinc-400 text-xs mt-1 block leading-relaxed">
                    {storeAddress}
                  </span>
                  <a
                    href="https://maps.google.com/?q=Shofi+Complex,+1/A+Outer+Circular+Rd,+Moghbazar,+Dhaka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1.5"
                  >
                    <span>{t('footer.viewOnMap') || (locale === 'bn' ? 'গুগল ম্যাপে দেখুন' : 'View on Google Maps')}</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <a
                href={`tel:${rawPhone}`}
                aria-label={`Call or WhatsApp: ${storePhone}`}
                className="flex items-center space-x-3 text-xs sm:text-sm p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-primary/40 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 flex items-center justify-center">
                  <Phone size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-zinc-100 font-bold leading-snug">
                    {t('footer.callWhatsApp') || (locale === 'bn' ? 'কল / হোয়াটসঅ্যাপ' : 'Call / WhatsApp')}
                  </span>
                  <span className="text-primary font-mono font-bold text-xs mt-0.5 block truncate group-hover:underline">
                    {storePhone}
                  </span>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${storeEmail}`}
                aria-label={`Send email to: ${storeEmail}`}
                className="flex items-center space-x-3 text-xs sm:text-sm p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-primary/40 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 flex items-center justify-center">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-zinc-100 font-bold leading-snug">
                    {t('footer.emailAddress') || (locale === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address')}
                  </span>
                  <span className="text-primary font-medium text-xs mt-0.5 block truncate group-hover:underline">
                    {storeEmail}
                  </span>
                </div>
              </a>

              {/* Opening Hours */}
              <div className="flex items-center space-x-3 text-xs p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-zinc-400">
                <Clock size={15} className="text-primary shrink-0" />
                <span className="leading-snug">
                  {t('footer.openingHoursValue') || (locale === 'bn' ? 'প্রতিদিন: সকাল ১০:০০ – রাত ৯:০০' : 'Everyday: 10:00 AM – 9:00 PM')}
                </span>
              </div>
            </div>
          </address>

        </div>

        {/* 4. Supported Payment Methods Row */}
        <section
          aria-label={t('footer.securePaymentMethods') || 'Secure Payment Methods'}
          className="border-t border-zinc-800/80 pt-8 pb-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-extrabold text-zinc-300 uppercase tracking-wider">
            <ShieldCheck size={18} className="text-primary shrink-0" />
            <span>{t('footer.securePaymentMethods') || (locale === 'bn' ? '১০০% নিরাপদ পেমেন্ট পদ্ধতি' : '100% Secure Payment Methods')}</span>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {/* bKash */}
            <div
              title="bKash"
              className="h-8 sm:h-9 px-3 bg-white rounded-lg flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-transform"
            >
              <Image
                src="/bKash-logo.svg"
                alt="bKash Payment Gateway"
                width={70}
                height={22}
                className="h-4.5 sm:h-5 w-auto object-contain max-w-[70px]"
              />
            </div>

            {/* Nagad */}
            <div
              title="Nagad"
              className="h-8 sm:h-9 px-3 bg-white rounded-lg flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-transform"
            >
              <Image
                src="/nAgad-logo.svg"
                alt="Nagad Payment Gateway"
                width={70}
                height={22}
                className="h-4.5 sm:h-5 w-auto object-contain max-w-[70px]"
              />
            </div>

            {/* Rocket */}
            <div
              title="Rocket"
              className="h-8 sm:h-9 px-3 bg-[#8C3493] rounded-lg flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-transform overflow-hidden"
            >
              <Image
                src="/rOcket-logo.svg"
                alt="Rocket Payment Gateway"
                width={70}
                height={22}
                className="h-4.5 sm:h-5 w-auto object-contain max-w-[70px]"
              />
            </div>

            {/* Visa */}
            <div
              title="Visa"
              className="h-8 sm:h-9 px-3 bg-white rounded-lg flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-transform"
            >
              <Image
                src="/Visa_Inc.-Logo.wine.svg"
                alt="Visa Card Gateway"
                width={75}
                height={26}
                className="h-6 sm:h-7 w-auto object-contain max-w-[75px]"
              />
            </div>

            {/* Mastercard */}
            <div
              title="Mastercard"
              className="h-8 sm:h-9 px-3 bg-white rounded-lg flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-transform"
            >
              <Image
                src="/Mastercard-Logo.wine.svg"
                alt="Mastercard Gateway"
                width={75}
                height={26}
                className="h-6 sm:h-7 w-auto object-contain max-w-[75px]"
              />
            </div>

            {/* Cash on Delivery Badge */}
            <div
              title="Cash on Delivery"
              className="h-8 sm:h-9 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg flex items-center justify-center gap-1.5 text-zinc-200 text-xs font-bold shadow-xs hover:scale-105 transition-transform"
            >
              <Truck size={14} className="text-primary" />
              <span>{t('footer.cashOnDelivery') || (locale === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery')}</span>
            </div>
          </div>
        </section>

        {/* 5. Bottom Banner: Dynamic Copyright & Policy Links */}
        <div className="border-t border-zinc-800/60 pt-6 flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm font-medium text-zinc-400 gap-4">

          {/* Copyright & Developer Attribution */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center md:text-left order-2 md:order-1">
            <p>
              &copy; {new Date().getFullYear()} {brandName}. {t('footer.allRightsReserved') || (locale === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.')}
            </p>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <p className="text-xs text-zinc-400">
              Developed by{' '}
              <a
                href="https://shipon-chowdhury.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                Shipon Chowdhury
              </a>
            </p>
          </div>

          {/* Legal / Policy Links */}
          <nav aria-label="Legal & Policies" className="flex flex-wrap justify-center gap-x-5 gap-y-2 order-1 md:order-2 font-semibold">
            <Link
              href="/privacy-policy"
              className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t('footer.privacyPolicy') || (locale === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy')}
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t('footer.termsConditions') || (locale === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions')}
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t('footer.refundPolicy') || (locale === 'bn' ? 'রিফান্ড ও রিটার্ন পলিসি' : 'Refund & Return Policy')}
            </Link>
            <Link
              href="/faq"
              className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t('footer.faq') || (locale === 'bn' ? 'এফএকিউ / হেল্প ডেস্ক' : 'FAQ / Help Desk')}
            </Link>
          </nav>

        </div>

      </div>
    </footer>
  );
}
