'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, HelpCircle, MessageCircle, Mail, Search } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function FaqClientView() {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: locale === 'bn' ? 'বাংলাদেশ জুড়ে ডেলিভারি পেতে কত সময় লাগে?' : 'How long does shipping take within Bangladesh?',
      a: locale === 'bn' 
        ? 'আমরা ঢাকার ভেতরে ১-২ কার্যদিবসের মধ্যে এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে পণ্য ডেলিভারি করে থাকি। সব অর্ডার ২৪ ঘণ্টার মধ্যে প্রসেস করা হয়।'
        : 'We deliver within 1-2 business days inside Dhaka and 3-5 business days for the rest of Bangladesh. All orders are processed within 24 hours.'
    },
    {
      q: locale === 'bn' ? 'আপনারা কি ক্যাশ অন ডেলিভারি (COD) দিয়ে থাকেন?' : 'Do you offer Cash on Delivery (COD)?',
      a: locale === 'bn'
        ? 'হ্যাঁ! আমরা বাংলাদেশের ৬৪টি জেলাতেই ক্যাশ অন ডেলিভারি (COD) দিয়ে থাকি। এছাড়া আপনি বিকাশ, নগদ বা কার্ডের মাধ্যমে পেমেন্ট করতে পারবেন।'
        : 'Yes! We offer Cash on Delivery (COD) across all 64 districts of Bangladesh. You can also pay via bKash, Nagad, or card payment during checkout.'
    },
    {
      q: locale === 'bn' ? 'রিটার্ন ও এক্সচেঞ্জ পলিসি কি?' : 'What is your return & exchange policy?',
      a: locale === 'bn'
        ? 'আমরা ডেলিভারির ৩ দিনের মধ্যে রিটার্ন ও এক্সচেঞ্জ গ্রহণ করি। পণ্যগুলো অব্যবহৃত এবং আসল প্যাকেজিং সহ থাকতে হবে। রিটার্ন শুরু করতে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।'
        : 'We accept returns and exchanges within 3 days of delivery. Products must be unused and in their original packaging. Contact our support team to initiate a return.'
    },
    {
      q: locale === 'bn' ? 'আমি কি আমার অর্ডার ট্র্যাক করতে পারি?' : 'Can I track my order status?',
      a: locale === 'bn'
        ? 'হ্যাঁ, আপনার ইমেইল বা ফোনে পাঠানো ট্র্যাকিং আইডি ব্যবহার করে আপনি অর্ডারের অবস্থা ট্র্যাক করতে পারেন। রিয়েল-টাইম আপডেটের জন্য আমাদের \'অর্ডার ট্র্যাক\' পেজে ভিজিট করুন।'
        : 'Yes, you can track your order using the tracking ID sent to your email or phone. Visit our \'Track Order\' page for real-time updates.'
    },
    {
      q: locale === 'bn' ? 'আপনাদের কি কোনো ফিজিক্যাল শোরুম আছে?' : 'Do you have a physical retail flagship store?',
      a: locale === 'bn'
        ? 'হ্যাঁ! ঢাকার মগবাজারে শফী কমপ্লেক্সে আমাদের মূল শোরুম ও অফিস রয়েছে। সরাসরি প্রোডাক্ট দেখতে ও স্টাইলিং পরামর্শের জন্য আমাদের শোরুমে আমন্ত্রণ রইল।'
        : 'Yes! We have an office & showroom at Shofi Complex, 1/A Outer Circular Rd, Moghbazar, Dhaka. Visit us for an in-person shopping experience.'
    },
    {
      q: locale === 'bn' ? 'কিভাবে অর্ডার প্লে করব?' : 'How do I place an order?',
      a: locale === 'bn'
        ? 'পছন্দের পণ্যটি সিলেক্ট করে আপনার সাইজ এবং কালার নির্বাচন করুন, তারপর "কার্টে যোগ করুন" অথবা সরাসরি কিনতে "বাই নাও" ক্লিক করুন। আপনার শিপিং ডিটেইলস পূরণ করে পছন্দের পেমেন্ট মেথড সিলেক্ট করলেই অর্ডারটি সফলভাবে প্লে হয়ে যাবে।'
        : 'Select your preferred product, size, and color, and then click "Add to Cart" or "Buy Now". Fill in your shipping details and select your payment method to successfully place your order.'
    },
    {
      q: locale === 'bn' ? 'কোন ডেলিভারি চার্জ আছে কি?' : 'Are there any delivery charges?',
      a: locale === 'bn'
        ? 'হ্যাঁ, ডেলিভারি চার্জ ঢাকার ভেতরে ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা।'
        : 'Yes, the delivery charge inside Dhaka city is BDT 60, and outside Dhaka is BDT 120.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Banner */}
      <div className="relative bg-muted/40 border-b border-border py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,154,60,0.05),transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={14} />
            <span>{locale === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
          </Link>
          <p className="text-[#c99a3c] text-xs font-bold tracking-[0.25em] uppercase mb-3">
            {locale === 'bn' ? 'হেল্প ডেস্ক' : 'Help Desk'}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground font-serif tracking-tight">
            {locale === 'bn' ? 'প্রশ্নগুলোর সুন্দর উত্তর।' : 'Questions, beautifully answered.'}
          </h1>
          
          {/* FAQ Search bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder={locale === 'bn' ? 'আপনার প্রশ্নটি খুঁজুন...' : 'Search for questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-border bg-card text-foreground placeholder-muted-foreground/60 shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all duration-300 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {/* FAQs List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 bg-card ${
                    isOpen 
                      ? 'border-[#c99a3c] shadow-lg shadow-amber-500/5' 
                      : 'border-border hover:border-[#c99a3c]/50'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center space-x-3.5">
                      <HelpCircle size={18} className="text-[#c99a3c] shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border pt-4 bg-muted/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card">
              <p className="text-sm font-semibold text-muted-foreground">{locale === 'bn' ? 'কোনো প্রশ্ন পাওয়া যায়নি।' : 'No questions found matching your search.'}</p>
            </div>
          )}
        </div>

        {/* Contact Block at the bottom */}
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(201,154,60,0.04),transparent_60%)] pointer-events-none" />
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-foreground font-serif">
              {locale === 'bn' ? 'এখনও সাহায্য প্রয়োজন?' : 'Still need help?'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {locale === 'bn' 
                ? 'যদি আপনি আপনার কাঙ্ক্ষিত উত্তরটি খুঁজে না পেয়ে থাকেন, তবে সরাসরি আমাদের কাস্টমার সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন।'
                : "If you didn't find the answer to your question, feel free to get in touch with our customer support team directly."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto pt-2">
            <a 
              href="https://wa.me/8801620556299" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-6 rounded-2xl text-sm font-bold shadow-md shadow-green-500/10 transition duration-300 w-full cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Chat</span>
            </a>
            <a 
              href="mailto:charulatalifestyl@gmail.com"
              className="flex items-center justify-center space-x-2 bg-[#151B26] border border-gray-800 hover:border-gray-750 text-white py-3 px-6 rounded-2xl text-sm font-bold shadow-md transition duration-300 w-full cursor-pointer"
            >
              <Mail size={18} />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
