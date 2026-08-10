import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Eye, Lock, FileText } from 'lucide-react';

const sections = [
  {
    number: '1',
    title: 'Information We Collect',
    content: [
      'Personal Details: We collect your name, phone number, shipping address, and email when you place an order.',
      'Usage Data: We track website interactions, device details, and IP addresses to improve site stability and user experience.',
      'Cookies: We use standard cookies to remember your login status, cart items, and preferences.',
    ],
  },
  {
    number: '2',
    title: 'How We Use Your Information',
    content: [
      'Order Fulfillment: Processing transactions, coordinating deliveries, and sending status updates.',
      'Customer Support: Responding to requests, queries, and handling returns or refunds.',
      'Marketing: Sending newsletters and promotional campaigns (if you have opted in). You can opt out at any time.',
      'Security & Analytics: Monitoring site health, preventing fraud, and conducting anonymous performance studies.',
    ],
  },
  {
    number: '3',
    title: 'Data Sharing & Third Parties',
    content: [
      'Logistics Partners: We share your delivery address and phone number with our trusted courier services (e.g. RedX, Steadfast).',
      'Legal Requirements: We may disclose details if legally required to do so by government authorities in Bangladesh.',
      'No Selling: We will never sell or rent your personal information to third-party marketing companies.',
    ],
  },
  {
    number: '4',
    title: 'Data Security & Retention',
    content: [
      'Encrypted Storage: Sensitive user details and tokens are stored securely using encryption protocols.',
      'Payment Safety: Online payment processing is managed by verified, secure payment gateways (e.g. SSLCommerz). We do not store card credentials directly.',
      'Retention: Personal details are kept as long as necessary for tax, auditing, and order verification purposes.',
    ],
  },
  {
    number: '5',
    title: 'Your Rights & Controls',
    content: [
      'Access & Edit: You can access and update your profile information anytime through your My Maison profile page.',
      'Erasure Requests: You can contact our support team to request deletion of your account and personal details.',
      'Newsletter Opt-Out: Click the unsubscribe link in promotional emails or notify us directly to stop receiving marketing campaigns.',
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-xs font-semibold mt-2.5">Last Updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8 sm:space-y-10">
        {/* Intro Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3.5">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 font-serif">Your Privacy is Sacred</h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans">
            Charulata Lifestyle values your trust. This Privacy Policy details how we collect, store, utilize, and protect your information when you interact with our website and buy from our catalog.
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

        {/* Contact Info */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 font-serif">Data Protection Questions?</h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-5 font-sans">Please contact us if you need help managing your details.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:01620556299" className="bg-muted hover:bg-primary hover:text-white border border-border transition-all rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground cursor-pointer">
              📞 01620-556299
            </a>
            <a href="mailto:charulatalifestyl@gmail.com" className="bg-muted hover:bg-primary hover:text-white border border-border transition-all rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-foreground cursor-pointer">
              📧 Email Support
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold pt-2">
          <Link href="/terms" className="text-primary hover:underline transition-colors">Terms & Conditions →</Link>
          <Link href="/refund-policy" className="text-primary hover:underline transition-colors">Refund Policy →</Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}