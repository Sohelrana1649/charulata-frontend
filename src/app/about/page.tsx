'use client';

import React from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { 
  Sparkles, 
  Award, 
  Users, 
  Truck, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Star
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function AboutPage() {
  const { locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 space-y-12 sm:space-y-20">
      
      {/* 1. High-Contrast Luxury Hero Banner */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-950 p-8 sm:p-16 lg:p-20 border border-amber-500/20 shadow-2xl text-center space-y-6">
          
          {/* Background Image with Dark Gradient Layer */}
          <Image 
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600" 
            alt="Charulata Heritage" 
            fill
            priority
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-900/60 z-10" />
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-3xl rounded-full pointer-events-none z-10" />

          {/* Hero Content */}
          <div className="relative z-20 max-w-3xl mx-auto space-y-5">
            <span className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-[#f59e0b] bg-amber-500/15 border border-amber-500/40 px-4 py-2 rounded-full shadow-inner">
              <Sparkles size={14} className="animate-pulse text-[#f59e0b]" />
              <span>{locale === 'bn' ? 'চারুলতা হেরিটেজ ও লাইফস্টাইল' : 'CHARULATA HERITAGE & LIFESTYLE'}</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-white !text-white drop-shadow-xl leading-tight tracking-tight">
              {locale === 'bn' 
                ? 'ঐতিহ্য ও আধুনিক ফ্যাশনের অনন্য সংমিশ্রণ' 
                : 'Bridging Heritage Craft with Modern Elegance'
              }
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-zinc-200 !text-zinc-200 leading-relaxed font-sans max-w-2xl mx-auto drop-shadow-md font-medium">
              {locale === 'bn' 
                ? 'চারুলতা একটি প্রিমিয়াম লাইফস্টাইল ও এথনিক ওয়্যার বুটিক ব্র্যান্ড। আমাদের লক্ষ্য বাংলাদেশের ঐতিহ্যবাহী তাঁত শিল্প, জামদানি শাড়ি, রাজকীয় পাঞ্জাবি এবং আধুনিক ফ্যাশনকে বিশ্বমানের কোয়ালিটিতে গ্রাহকদের হাতে তুলে দেওয়া।'
                : 'Charulata is a premier luxury lifestyle & ethnic wear boutique dedicated to preserving Bangladesh\'s rich weaving heritage, handloom sarees, royal panjabis, and modern fashion.'
              }
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/search" 
                className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>{locale === 'bn' ? 'কালেকশন দেখুন' : 'Explore Collections'}</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl border border-white/20 transition-all backdrop-blur-md"
              >
                <MapPin size={15} className="text-[#f59e0b]" />
                <span>{locale === 'bn' ? 'শো-রুম ভিজিট করুন' : 'Visit Showroom'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Counter Strip */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { 
              number: '100%', 
              labelBn: 'অরিজিনাল তাঁত পণ্য', 
              labelEn: 'Original Handloom Crafts',
              icon: Award 
            },
            { 
              number: '50,000+', 
              labelBn: 'সন্তুষ্ট গ্রাহক', 
              labelEn: 'Happy Customers',
              icon: Users 
            },
            { 
              number: '64', 
              labelBn: 'জেলায় ক্যাশ অন ডেলিভারি', 
              labelEn: 'Districts COD Available',
              icon: Truck 
            },
            { 
              number: '4.9 ★', 
              labelBn: 'গ্রাহক রেটিং', 
              labelEn: 'Average Customer Rating',
              icon: Star 
            },
          ].map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-card border border-border/80 text-center space-y-2 shadow-2xs hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <IconComp size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-foreground">
                  {stat.number}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {locale === 'bn' ? stat.labelBn : stat.labelEn}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Brand Story & Craftsmanship */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
            {locale === 'bn' ? 'আমাদের ইতিহাস ও বার্তা' : 'Our Story & Vision'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-foreground leading-snug">
            {locale === 'bn' ? 'আভিজাত্য ও ঐতিহ্যের বিশ্বস্ত নাম চারুলতা' : 'Handpicked Quality Craftsmanship for Every Occasion'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === 'bn'
              ? 'আমাদের প্রতিটি শাড়ি, পাঞ্জাবি ও পোশাক অত্যন্ত যত্নের সাথে অভিজ্ঞ তাঁতিদের দ্বারা বোনা। আমরা জামদানি, কাতান, সিল্ক এবং অর্গানিক কটনের সেরা কালেকশন সরাসরি কারিগরদের থেকে সরবরাহ করি।'
              : 'Every piece in our boutique tells a story of authentic craftsmanship. From intricate Banarasi weaves and authentic Rajshahi silks to hand-embroidered Kurtis and luxury products, Charulata brings you unmatched quality.'
            }
          </p>

          <div className="space-y-3 pt-2">
            {[
              locale === 'bn' ? '১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটির নিশ্চয়তা' : '100% Guaranteed authentic handloom products',
              locale === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি' : 'Frictionless Cash on Delivery (COD) nationwide',
              locale === 'bn' ? 'গুলশান ফ্ল্যাগশিপ শোরুমে সরাসরি কেনাকাটার সুযোগ' : 'Gulshan Flagship showroom for in-person consultation'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-foreground">
                <CheckCircle2 size={17} className="text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link 
              href="/search" 
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <span>{locale === 'bn' ? 'আমাদের পণ্যসমূহ দেখুন' : 'Browse All Products'}</span>
              <ShoppingBag size={16} />
            </Link>
          </div>
        </div>

        {/* Story Image Grid */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-border shadow-md hover:scale-[1.02] transition-transform">
              <Image 
                src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600" 
                alt="Designer Kurtis" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden border border-border shadow-md hover:scale-[1.02] transition-transform">
              <Image 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600" 
                alt="Jewelry Collection" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
          <div className="space-y-4 pt-6">
            <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden border border-border shadow-md hover:scale-[1.02] transition-transform">
              <Image 
                src="https://res.cloudinary.com/dau8sazoh/image/upload/v1781684539/download_4_liieog.jpg" 
                alt="Panjabi Collection" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-border shadow-md hover:scale-[1.02] transition-transform">
              <Image 
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600" 
                alt="Attar & Beauty" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Brand Values */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'প্রিমিয়াম কোয়ালিটি' : 'Uncompromising Quality'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'আমরা প্রতিটি কাপড় ও পণ্যের ফিনিশিং এবং কোয়ালিটি কড়া তদারকিতে নিশ্চিত করি।'
                : 'Every thread and texture undergoes strict quality assurance before reaching you.'
              }
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'দ্রুত ডেলিভারি' : 'Express Nationwide Shipping'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'ঢাকায় ১-২ দিন এবং দেশের যেকোনো জেলায় ৩-৫ দিনে ক্যাশ অন ডেলিভারি।'
                : 'Fast 1-2 day delivery inside Dhaka and quick 3-5 days shipping across all 64 districts.'
              }
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'গ্রাহক সেবা ও রিটার্ন' : 'Customer First Care'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'সহজ এক্সচেঞ্জ এবং সার্বক্ষণিক কাস্টমার কেয়ার হেল্পলাইন সাপোর্টের নিশ্চয়তা।'
                : 'Frictionless support, flexible exchanges, and personal styling consultations.'
              }
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
