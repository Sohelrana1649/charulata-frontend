import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Package, Search, Camera, Phone, CheckCircle, ArrowLeft } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Refund & Return Policy | Charulata Lifestyle',
  description: 'Refund, return, and exchange policy for Charulata Lifestyle in Bangladesh.',
};

const steps = [
  { icon: Package, label: 'Receive Product', desc: 'Accept your delivery' },
  { icon: Search, label: 'Inspect', desc: 'Within 48 hours' },
  { icon: Camera, label: 'Take Photos', desc: 'Proof of the issue' },
  { icon: Phone, label: 'Contact Us', desc: 'Report the problem' },
  { icon: CheckCircle, label: 'Get Refund', desc: 'Within 3–5 business days' },
];

const sections = [
  {
    number: '1',
    title: 'When You Are Eligible for a Refund',
    type: 'success' as const,
    content: [
      'The product arrives damaged or defective.',
      'You receive the wrong product instead of what you ordered.',
      'The product quality is significantly different from what was advertised.',
      'A product is missing from your delivered package.',
    ],
  },
  {
    number: '2',
    title: 'When Refunds Are Not Applicable',
    type: 'warning' as const,
    content: [
      'You request a return after using the product.',
      'The complaint is raised more than 48 hours after delivery.',
      'The issue is a personal preference (e.g., color or size) and the product is not defective.',
      'Delivery issues were caused by incorrect address or contact information provided by the customer.',
    ],
  },
  {
    number: '3',
    title: 'Return Conditions',
    type: 'info' as const,
    content: [
      'Products must be returned in their original packaging.',
      'Items must be unused and have all original tags attached.',
      'Please contact us and get approval before sending any return.',
      'If the product is defective, we will cover the return shipping cost.',
    ],
  },
  {
    number: '4',
    title: 'Refund Method',
    type: 'info' as const,
    content: [
      'Refunds are processed via bKash, Nagad, or Rocket within 3–5 business days.',
      'For Cash on Delivery orders, please provide your mobile banking number.',
      'You will be notified via SMS or call once the refund process has been initiated.',
    ],
  },
];

export default function RefundPolicyPage() {
  const typeStyles = {
    success: {
      badge: 'bg-green-500/10 text-green-500 border-green-500/20',
      bullet: 'text-green-500',
      symbol: '✓',
    },
    warning: {
      badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      bullet: 'text-rose-500',
      symbol: '✗',
    },
    info: {
      badge: 'bg-primary/10 text-primary border-primary/20',
      bullet: 'text-primary',
      symbol: '✦',
    },
  };

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
            Refund & Return Policy
          </h1>
          <p className="text-muted-foreground text-xs font-semibold mt-2.5">Last Updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8 sm:space-y-10">

        {/* Quality Guarantee Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 text-center shadow-xs">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3.5">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 font-serif">Quality Guaranteed</h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-sans">
            We are committed to your satisfaction. If anything goes wrong with your order, we are always here to help you resolve it.
          </p>
        </div>

        {/* Process Steps */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-8 text-center font-serif">
            How the Refund Process Works
          </h2>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-0">
            <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-px bg-border z-0" />
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md shrink-0">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="sm:text-center">
                    <p className="text-xs sm:text-sm font-extrabold text-foreground font-serif">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Policy Sections */}
        {sections.map((section) => {
          const style = typeStyles[section.type];
          return (
            <div key={section.number}>
              <div className="flex items-start gap-4">
                <span className={`shrink-0 w-9 h-9 rounded-full ${style.badge} border text-sm font-bold flex items-center justify-center font-mono`}>
                  {section.number}
                </span>
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 font-serif">{section.title}</h2>
                  <ul className="space-y-2.5">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans">
                        <span className={`${style.bullet} mt-0.5 shrink-0 font-bold`}>{style.symbol}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-b border-border/60" />
            </div>
          );
        })}

        {/* Contact CTA */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 font-serif">Need a Refund?</h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-5 font-sans">Our support team is ready to help you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:01620556299" className="bg-muted hover:bg-primary hover:text-white border border-border transition-all rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground cursor-pointer">
              📞 01620-556299
            </a>
            <a href="https://wa.me/message/WYR6MKB6ELBYM1" target="_blank" rel="noopener noreferrer" className="bg-muted hover:bg-primary hover:text-white border border-border transition-all rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground cursor-pointer">
              💬 WhatsApp
            </a>
            <a href="mailto:charulatalifestyl@gmail.com" className="bg-muted hover:bg-primary hover:text-white border border-border transition-all rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground cursor-pointer">
              📧 Email Support
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold pt-2">
          <Link href="/privacy-policy" className="text-primary hover:underline transition-colors">Privacy Policy →</Link>
          <Link href="/terms" className="text-primary hover:underline transition-colors">Terms & Conditions →</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}