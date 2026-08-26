import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Scale, HelpCircle } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Terms & Conditions | Charulata Lifestyle',
  description: 'Terms and Conditions for Charulata Lifestyle - orders, payments, delivery, and services across Bangladesh.',
};

const sections = [
  {
    number: '1',
    title: 'Scope of Services',
    content: [
      'Charulata Lifestyle sells fashion and lifestyle products online across Bangladesh.',
      'Our product range includes sarees, panjabis, jewelry, gadgets, and home appliances.',
      'We offer home delivery services throughout Bangladesh.',
    ],
  },
  {
    number: '2',
    title: 'Orders & Payments',
    content: [
      'After placing an order, our team will contact you for confirmation.',
      'Payments can be made via bKash, Nagad, Rocket, or Cash on Delivery.',
      'Product prices will not change after an order is confirmed.',
      'If an item is out of stock, the order will be cancelled and a full refund issued.',
    ],
  },
  {
    number: '3',
    title: 'Delivery Policy',
    content: [
      'Deliveries within Dhaka are typically completed within 1–2 business days.',
      'Outside Dhaka, delivery may take 3–7 business days.',
      'Delivery charges will be communicated at the time of order.',
      'Please inspect your product carefully before accepting the delivery.',
    ],
  },
  {
    number: '4',
    title: 'Product Description & Quality',
    content: [
      'We strive to provide accurate images and descriptions; however, slight color variations may occur due to screen differences.',
      'All products go through quality checks before dispatch.',
      'Defective or incorrect products will be handled as per our Refund & Return Policy.',
    ],
  },
  {
    number: '5',
    title: 'User Responsibilities',
    content: [
      'It is your responsibility to provide a correct delivery address and contact information.',
      'If you are unavailable during delivery, a re-delivery charge may apply.',
      'Any misuse of our services or fraudulent activity may result in legal action.',
    ],
  },
  {
    number: '6',
    title: 'Changes to Terms',
    content: [
      'Charulata Lifestyle reserves the right to update these Terms & Conditions at any time.',
      'Updated terms will be published on our website.',
      'Continued use of our services after changes implies acceptance of the new terms.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Banner */}
      <div className="relative bg-card border-b border-border py-14 sm:py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-primary text-xs font-extrabold tracking-[0.25em] uppercase mb-2">
            Charulata Lifestyle
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-xs font-semibold mt-2.5">Last Updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8 sm:space-y-10">
        {/* Intro */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3.5">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 font-serif">Terms of Use</h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans">
            By accessing or using the Charulata Lifestyle website and services, you agree to be bound by the following Terms and Conditions. Please read them carefully before making any purchase or using our platform.
          </p>
        </div>

        {/* Policy Sections */}
        {sections.map((section) => (
          <div key={section.number} className="group">
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold flex items-center justify-center font-mono">
                {section.number}
              </span>
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 font-serif">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans">
                      <span className="text-primary mt-0.5 shrink-0 font-bold">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 border-b border-border/60" />
          </div>
        ))}

        {/* Questions CTA */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 font-serif">Have Questions?</h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 font-sans">Reach out to our support team anytime.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-foreground">
            <a href="tel:01620556299" className="hover:text-primary transition-colors">📞 01620-556299</a>
            <a href="https://wa.me/message/WYR6MKB6ELBYM1" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">💬 WhatsApp</a>
            <a href="https://t.me/charulatalifestyle" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">✈️ Telegram</a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold pt-2">
          <Link href="/privacy-policy" className="text-primary hover:underline transition-colors">Privacy Policy →</Link>
          <Link href="/refund-policy" className="text-primary hover:underline transition-colors">Refund Policy →</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}