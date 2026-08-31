'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ChevronRight, ShieldCheck, Truck, Lock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import Image from '@/components/SafeImage';
import { useTranslation } from '@/i18n/LanguageContext';
import { useGetSettingsQuery } from '@/store/api/settingsApi';
import { useSubscribeNewsletterMutation } from '@/store/api/userApi';

export default function Footer() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const { data: settingsData } = useGetSettingsQuery();
  const footerLogo = settingsData?.data?.footerLogo || '/logo.png';

  const [emailInput, setEmailInput] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionErrorMsg, setSubscriptionErrorMsg] = useState('');
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      try {
        await subscribeNewsletter(emailInput.trim()).unwrap();
        setSubscriptionSuccess(true);
        setSubscriptionErrorMsg('');
        setEmailInput('');
        setTimeout(() => setSubscriptionSuccess(false), 5000);
      } catch (err: any) {
        setSubscriptionErrorMsg(err?.data?.message || 'Failed to subscribe');
        setTimeout(() => setSubscriptionErrorMsg(''), 5000);
      }
    }
  };

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  // Do not render footer on admin dashboard or checkout page
  if (isAdminPage || isCheckoutPage) return null;

  return (
    <footer className="relative bg-zinc-950 text-zinc-300 border-t border-zinc-800 overflow-hidden">
      {/* Ultra-subtle Centered Primary Rose Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl sm:max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-65" />

      {/* Decorative Luxury Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 pt-16 pb-8 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        
        {/* Core Value Props Banner inside Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-zinc-800">
          
          {/* Fast Delivery */}
          <div className="group flex items-center space-x-4 p-5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 hover:border-primary/50 hover:bg-zinc-800/70 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs">
              <Truck size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                {t('footer.fastDelivery')}
              </h5>
              <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed">
                {t('footer.fastDeliverySub')}
              </p>
            </div>
          </div>

          {/* 100% Original */}
          <div className="group flex items-center space-x-4 p-5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 hover:border-primary/50 hover:bg-zinc-800/70 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs">
              <ShieldCheck size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                {t('footer.original')}
              </h5>
              <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed">
                {t('footer.originalSub')}
              </p>
            </div>
          </div>

          {/* Secure Payment */}
          <div className="group flex items-center space-x-4 p-5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 hover:border-primary/50 hover:bg-zinc-800/70 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-xs">
              <Lock size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-white text-xs sm:text-sm font-extrabold font-serif uppercase tracking-wider group-hover:text-primary transition-colors">
                {t('footer.securePayment')}
              </h5>
              <p className="text-xs sm:text-sm text-zinc-200 mt-1 leading-relaxed">
                {t('footer.securePaymentSub')}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Grid (2-Column Grid on Mobile for compact height) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10 mb-12 sm:mb-16">
          
          {/* Brand Info (Full Width on Mobile) */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="space-y-3">
              <Link 
                href="/" 
                onClick={(e) => {
                  if (pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="relative h-12 w-36 sm:h-16 sm:w-48 flex items-center justify-start shrink-0"
                suppressHydrationWarning
              >
                <Image 
                  src={footerLogo} 
                  alt="Charulata Lifestyle Logo" 
                  width={220}
                  height={64}
                  suppressHydrationWarning
                  className="h-full w-auto object-contain brightness-110"
                />
              </Link>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 pt-0.5">
                {t('footer.brandDesc')}
              </p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-2.5">
              {[
                {
                  href: "https://web.facebook.com/charulatalifestyle",
                  aria: "Facebook",
                  colorClass: "text-[#1877F2] border-[#1877F2]/30 bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
                  icon: (
                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  )
                },
                {
                  href: "https://www.instagram.com/charulatalifestyl",
                  aria: "Instagram",
                  colorClass: "text-[#E4405F] border-[#E4405F]/30 bg-[#E4405F]/10 hover:bg-[#E4405F]/20",
                  icon: (
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  )
                },
                {
                  href: "https://wa.me/message/WYR6MKB6ELBYM1",
                  aria: "WhatsApp",
                  colorClass: "text-[#25D366] border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20",
                  icon: <MessageCircle size={17} />
                },
                {
                  href: "https://t.me/charulatalifestyle",
                  aria: "Telegram",
                  colorClass: "text-[#0088cc] border-[#0088cc]/30 bg-[#0088cc]/10 hover:bg-[#0088cc]/20",
                  icon: <Send size={17} />
                }
              ].map((soc, i) => (
                <a 
                  key={i} 
                  href={soc.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border hover:scale-110 transition-all duration-300 ${soc.colorClass}`}
                  aria-label={soc.aria}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Column 1 on Mobile) */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white mb-4 sm:mb-6 flex items-center">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-semibold">
              {[
                { label: t('footer.home'), href: "/" },
                { label: locale === 'bn' ? 'ব্লগ ও জার্নাল' : 'Blog & Journal', href: "/blog" },
                { label: locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us', href: "/about" },
                { label: locale === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us', href: "/contact" },
                { label: t('footer.shopCollection'), href: "/search" },
                { label: t('footer.trackOrder'), href: "/profile?tab=orders" }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center py-1 transition-all duration-300"
                  >
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-primary mr-1 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
                    <span className="text-zinc-400 group-hover:text-white font-semibold truncate border-b-2 border-transparent group-hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections (Column 2 on Mobile - Side by side with Quick Links!) */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white mb-4 sm:mb-6 flex items-center">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.collections')}
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-semibold">
              {[
                { label: t('footer.sareesEthnic'), href: "/search?category=jamdani-silk-sarees" },
                { label: t('footer.kurtasPanjabis'), href: "/search?category=panjabi" },
                { label: t('footer.premiumJewelry'), href: "/search?category=jewelry" },
                { label: t('footer.modernGadgets'), href: "/search?category=gadgets" }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center py-1 transition-all duration-300"
                  >
                    <ChevronRight size={13} className="text-zinc-500 group-hover:text-primary mr-1 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
                    <span className="text-zinc-400 group-hover:text-white font-semibold truncate border-b-2 border-transparent group-hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white mb-4 sm:mb-6 flex items-center">
              <span className="w-1.5 h-3 bg-primary rounded-full mr-2 shrink-0" />
              {t('footer.contactUs') || 'যোগাযোগ করুন'}
            </h4>
            <div className="space-y-3.5">
              {/* Address */}
              <div className="flex items-center space-x-3 text-xs sm:text-sm group p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="block text-zinc-100 text-xs sm:text-sm font-extrabold leading-snug">{locale === 'bn' ? 'শোরুম ও হেড অফিস' : 'Showroom & Head Office'}</span>
                  <span className="text-zinc-300 text-xs sm:text-sm mt-0.5 block leading-snug font-medium">
                    {locale === 'bn' 
                      ? 'শফী কমপ্লেক্স, ১/এ আউটার সার্কুলার রোড, মগবাজার, ঢাকা' 
                      : 'Shofi Complex, 1/A Outer Circular Rd, Moghbazar, Dhaka'
                    }
                  </span>
                </div>
              </div>
              
              {/* Phone / WhatsApp */}
              <a href="tel:01620556299" className="flex items-center space-x-3 text-xs sm:text-sm group p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 cursor-pointer hover:border-primary/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="block text-zinc-100 text-xs sm:text-sm font-extrabold leading-snug">{t('footer.callWhatsApp') || 'কল / হোয়াটসঅ্যাপ'}</span>
                  <span className="text-primary group-hover:underline text-xs sm:text-sm mt-0.5 block font-mono font-bold leading-snug">01620-556299</span>
                </div>
              </a>
              
              {/* Email */}
              <a href="mailto:charulatalifestyl@gmail.com" className="flex items-center space-x-3 text-xs sm:text-sm group p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 cursor-pointer hover:border-primary/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <span className="block text-zinc-100 text-xs sm:text-sm font-extrabold leading-snug">{t('footer.emailAddress') || 'ইমেইল ঠিকানা'}</span>
                  <span className="text-primary group-hover:underline text-xs sm:text-sm mt-0.5 block font-semibold truncate leading-snug">charulatalifestyl@gmail.com</span>
                </div>
              </a>
            </div>

            {/* Newsletter Subscription Box on the Right side - Ergonomic & User-friendly */}
            <div className="mt-4 max-w-md w-full">
              <form onSubmit={handleSubscribe} className="flex items-stretch w-full h-11 sm:h-12 shadow-sm group">
                <div className="relative flex-1 flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-zinc-400 pointer-events-none group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    name="footerNewsletterEmail"
                    autoComplete="off"
                    spellCheck={false}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={locale === 'bn' ? 'আপনার ইমেইল দিন...' : 'Enter your email...'}
                    style={{ backgroundColor: '#18181b', color: '#ffffff' }}
                    className="w-full h-full rounded-l-xl rounded-r-none border border-zinc-700/80 bg-[#18181b] pl-11 pr-3 text-xs sm:text-sm text-white placeholder-zinc-400/80 focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-primary hover:bg-primary/90 hover:shadow-md text-white text-xs sm:text-sm font-bold px-4 sm:px-6 rounded-r-xl border border-l-0 border-primary transition-all flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-60 cursor-pointer active:scale-95 h-full shadow-xs"
                >
                  <span>{isSubscribing ? '...' : (locale === 'bn' ? 'যুক্ত হন' : 'Subscribe')}</span>
                  {!isSubscribing && <Send size={13} className="stroke-[2.5]" />}
                </button>
              </form>

              {subscriptionSuccess && (
                <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-emerald-400 pt-2">
                  <CheckCircle2 size={15} />
                  <span>{locale === 'bn' ? 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!' : 'Successfully subscribed!'}</span>
                </div>
              )}
              {subscriptionErrorMsg && (
                <div className="text-xs sm:text-sm font-semibold text-rose-400 pt-2">
                  {subscriptionErrorMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col lg:flex-row justify-between items-center text-xs sm:text-sm font-bold text-zinc-400 gap-5 lg:gap-4">
          
          {/* Policy Links (Order 1 on mobile, Order 3 on Desktop) */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 order-1 lg:order-3">
            <Link href="/privacy-policy" className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">
              {t('footer.termsConditions')}
            </Link>
            <Link href="/refund-policy" className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">
              {t('footer.refundPolicy')}
            </Link>
            <Link href="/faq" className="hover:text-primary border-b-2 border-transparent hover:border-primary/70 pb-0.5 transition-all duration-300 ease-in-out">
              {t('footer.faq') || 'FAQ'}
            </Link>
          </div>

          {/* Payment Method Badges (Order 2 on mobile, Order 2 on Desktop) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-1 lg:my-0 flex-wrap order-2 lg:order-2">
            {/* bKash */}
            <div className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 bg-white rounded-xl flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer">
              <img src="/bKash-logo.svg" alt="bKash" className="h-5 sm:h-6 w-auto object-contain max-w-[75px]" />
            </div>

            {/* Nagad */}
            <div className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 bg-white rounded-xl flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer">
              <img src="/nAgad-logo.svg" alt="Nagad" className="h-5 sm:h-6 w-auto object-contain max-w-[75px]" />
            </div>

            {/* Rocket */}
            <div className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 bg-[#8C3493] rounded-xl flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden">
              <img src="/rOcket-logo.svg" alt="Rocket" className="h-5 sm:h-6 w-auto object-contain max-w-[75px]" />
            </div>

            {/* Visa */}
            <div className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 bg-white rounded-xl flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer">
              <img src="/Visa_Inc.-Logo.wine.svg" alt="Visa" className="h-6.5 sm:h-7.5 w-auto object-contain max-w-[80px]" />
            </div>

            {/* Mastercard */}
            <div className="h-8.5 sm:h-9.5 px-3 sm:px-3.5 bg-white rounded-xl flex items-center justify-center border border-zinc-700/60 shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer">
              <img src="/Mastercard-Logo.wine.svg" alt="Mastercard" className="h-6.5 sm:h-7.5 w-auto object-contain max-w-[80px]" />
            </div>
          </div>

          {/* Left / Bottom-most on Mobile: Copyright & Developer Attribution (Order 3 on mobile, Order 1 on Desktop) */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center md:text-left order-3 lg:order-1 pt-2 lg:pt-0">
            <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <p className="text-xs text-zinc-400 font-medium">
              Developed by{' '}
              <a
                href="https://www.linkedin.com/in/shipon-chowdhury/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold hover:underline transition-all"
              >
                Shipon Chowdhury
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
