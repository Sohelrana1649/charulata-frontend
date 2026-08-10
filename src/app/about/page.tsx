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
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function AboutPage() {
  const { locale } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16 space-y-16 sm:space-y-24">
      
      {/* 1. Hero Banner */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-950 p-8 sm:p-16 border border-border/40 shadow-xl text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 to-neutral-950/90 z-10" />
          <Image 
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600" 
            alt="Charulata Heritage" 
            fill
            className="object-cover opacity-25"
          />
          <div className="relative z-20 max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-widest text-[#c99a3c] bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
              <Sparkles size={13} className="animate-pulse" />
              <span>{locale === 'bn' ? 'চারুলতা বুটিক ও লাইফস্টাইল' : 'Charulata Heritage & Lifestyle'}</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white leading-tight">
              {locale === 'bn' ? 'ঐতিহ্য ও আধুনিক ফ্যাশনের অনন্য সংমিশ্রণ' : 'Bridging Heritage Craft with Modern Elegance'}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-2xl mx-auto">
              {locale === 'bn' 
                ? 'চারুলতা একটি প্রিমিয়াম লাইফস্টাইল বুটিক ব্র্যান্ড। আমাদের লক্ষ্য বাংলাদেশের ঐতিহ্যবাহী তাঁত শিল্প, জামদানি শাড়ি, রাজকীয় পাঞ্জাবি এবং আধুনিক ফ্যাশন পণ্যকে গ্রাহকদের দোরগোড়ায় পৌঁছে দেওয়া।'
                : 'Charulata is a premier luxury lifestyle & ethnic wear boutique dedicated to preserving Bangladesh\'s rich weaving heritage, handloom sarees, royal panjabis, and modern lifestyle accessories.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 2. Brand Story & Craftsmanship */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
            {locale === 'bn' ? 'আমাদের গল্প' : 'Our Story'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-foreground leading-snug">
            {locale === 'bn' ? 'আভিজাত্য ও ঐতিহ্যের বিশ্বস্ত নাম' : 'Handpicked Quality Craftsmanship for Every Occasion'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === 'bn'
              ? 'আমাদের প্রতিটি শাড়ি ও পাঞ্জাবি অত্যন্ত যত্নের সাথে অভিজ্ঞ তাঁতিদের দ্বারা বোনা। আমরা জামদানি, কাতান, সিল্ক এবং অর্গানিক কটনের সেরা কালেকশন সরবরাহ করি। আমাদের লক্ষ্য প্রতিটি পোশাকে অভিজাত্য ধরে রাখা।'
              : 'Every piece in our store tells a story of authentic craftsmanship. From intricate Banarasi weaves and authentic Rajshahi silks to hand-embroidered Kurtis and luxury gadgets, Charulata brings you unmatched quality.'
            }
          </p>

          <div className="space-y-3 pt-2">
            {[
              locale === 'bn' ? '১০০% অরিজিনাল ও গুণগত মান নিশ্চিত পণ্য' : '100% Guaranteed authentic handloom products',
              locale === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা' : 'Frictionless Cash on Delivery (COD) nationwide',
              locale === 'bn' ? 'গুলশান ফ্ল্যাগশিপে সরাসরি এসে কেনাকাটার সুযোগ' : 'Gulshan Flagship showroom for in-person consultations'
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
              className="inline-flex items-center space-x-2 bg-primary hover:opacity-90 text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <span>{locale === 'bn' ? 'আমাদের কালেকশন দেখুন' : 'Explore Collections'}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Story Image Grid */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-border shadow-sm">
              <Image 
                src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600" 
                alt="Designer Kurtis" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden border border-border shadow-sm">
              <Image 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600" 
                alt="Jewelry Collection" 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
          <div className="space-y-4 pt-6">
            <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden border border-border shadow-sm">
              <Image 
                src="https://res.cloudinary.com/dau8sazoh/image/upload/v1781684539/download_4_liieog.jpg" 
                alt="Panjabi Collection" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-border shadow-sm">
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

      {/* 3. Brand Pillars / Values */}
      <section className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'প্রিমিয়াম কোয়ালিটি' : 'Uncompromising Quality'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'আমরা প্রতিটি কাপড় ও পণ্যের ফিনিশিং ও কোয়ালিটি কড়া তদারকিতে নির্বাচন করি।'
                : 'Every thread and texture undergoes strict quality assurance before reaching you.'
              }
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'দ্রুত ডেলিভারি' : 'Express Nationwide Shipping'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'ঢাকায় ১-২ দিন এবং দেশের যেকোনো জেলায় ৩-৪ দিনে হোম ডেলিভারি।'
                : 'Fast 1-2 day delivery inside Dhaka and quick 3-4 days shipping across all 64 districts.'
              }
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              {locale === 'bn' ? 'গ্রাহক সন্তুষ্টি' : 'Customer First Care'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'সহজ রিটার্ন এবং সার্বক্ষণিক কাস্টমার কেয়ার হেল্পলাইন সাপোর্টের নিশ্চয়তা।'
                : 'Frictionless support, flexible exchanges, and personal styling consultations.'
              }
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
