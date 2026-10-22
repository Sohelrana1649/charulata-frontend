'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { useSubscribeNewsletterMutation } from '@/store/api/userApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterSection() {
  const { t, locale } = useTranslation();
  const [emailInput, setEmailInput] = useState('');
  const [clientError, setClientError] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionErrorMsg, setSubscriptionErrorMsg] = useState('');

  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    if (clientError) setClientError('');
    if (subscriptionErrorMsg) setSubscriptionErrorMsg('');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions while already in-flight
    if (isSubscribing) return;

    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      setClientError(
        t('footer.newsletterInvalidEmail') ||
        (locale === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.')
      );
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setClientError(
        t('footer.newsletterInvalidEmail') ||
        (locale === 'bn' ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.')
      );
      return;
    }

    setClientError('');
    setSubscriptionErrorMsg('');

    try {
      // Connect to existing newsletter API - wait for backend confirmation
      await subscribeNewsletter(trimmedEmail).unwrap();

      // Backend confirmed successful subscription
      setSubscriptionSuccess(true);
      setSubscriptionErrorMsg('');
      setClientError('');
      setEmailInput('');

      // Auto-hide success message after 7 seconds
      setTimeout(() => {
        setSubscriptionSuccess(false);
      }, 7000);
    } catch (err: any) {
      setSubscriptionSuccess(false);
      const serverMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        t('footer.newsletterError') ||
        (locale === 'bn' ? 'সাবস্ক্রাইব করা সম্ভব হয়নি। আবার চেষ্টা করুন।' : 'Failed to subscribe. Please try again.');
      setSubscriptionErrorMsg(serverMsg);
    }
  };

  return (
    <section
      aria-label={t('footer.newsletterTitle') || 'Newsletter Subscription'}
      className="relative mb-12 sm:mb-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl"
    >
      {/* Subtle Luxury Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

        {/* Left Column: Heading, Badge & Description */}
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles size={13} className="shrink-0 animate-pulse" />
            <span>{t('footer.newsletterBadge') || (locale === 'bn' ? 'বিশেষ অফার ও আপডেট' : 'Exclusive Updates')}</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif !text-white tracking-tight leading-snug sm:leading-tight">
            {t('footer.newsletterTitle') || (locale === 'bn' ? 'আমাদের নিউজলেটারে যুক্ত থাকুন' : 'Subscribe to Our Newsletter')}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
            {t('footer.newsletterSub') || (
              locale === 'bn'
                ? 'নতুন কালেকশন, প্রাইভেট সেল এবং বিশেষ অফারের নিয়মিত আপডেট সরাসরি আপনার ইনবক্সে পান।'
                : 'Be the first to know about new arrivals, private sales, and seasonal handloom collections.'
            )}
          </p>


        </div>

        {/* Right Column: Form, Submission & Status */}
        <div className="lg:col-span-5 w-full">
          <form
            onSubmit={handleSubscribe}
            noValidate
            aria-label={t('footer.newsletterTitle') || 'Subscribe to Newsletter'}
            className="w-full space-y-2.5"
          >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-0 sm:bg-zinc-950 sm:p-1 sm:rounded-2xl sm:border sm:border-zinc-700/80 sm:focus-within:border-primary sm:focus-within:ring-2 sm:focus-within:ring-primary/25 transition-all">

              {/* Email Input */}
              <div className="relative flex-1 flex items-center">
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  {t('footer.emailAddress') || 'Email Address'}
                </label>
                <Mail
                  size={18}
                  aria-hidden="true"
                  className="absolute left-3.5 text-zinc-400 pointer-events-none transition-colors"
                />
                <input
                  id="footer-newsletter-email"
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={emailInput}
                  onChange={handleEmailChange}
                  disabled={isSubscribing}
                  placeholder={
                    t('footer.newsletterPlaceholder') ||
                    (locale === 'bn' ? 'আপনার ইমেইল দিন...' : 'Enter your email address...')
                  }
                  aria-required="true"
                  aria-invalid={Boolean(clientError || subscriptionErrorMsg)}
                  aria-describedby={
                    clientError ? 'newsletter-client-error' :
                      subscriptionErrorMsg ? 'newsletter-server-error' :
                        subscriptionSuccess ? 'newsletter-success-msg' : undefined
                  }
                  className="w-full h-12 rounded-xl sm:rounded-none sm:rounded-l-xl border border-zinc-700/80 sm:border-0 bg-zinc-950 pl-11 pr-3 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 sm:focus:ring-0 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubscribing || !emailInput.trim()}
                aria-label={
                  isSubscribing
                    ? (t('footer.newsletterSubscribing') || 'Subscribing...')
                    : (t('footer.newsletterBtn') || 'Subscribe')
                }
                className="h-12 px-5 sm:px-6 rounded-xl sm:rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-all duration-200 shadow-md hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>{t('footer.newsletterSubscribing') || (locale === 'bn' ? 'যুক্ত হচ্ছি...' : 'Subscribing...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('footer.newsletterBtn') || (locale === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe')}</span>
                    <Send size={14} className="stroke-[2.2]" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* Validation / Status Messages */}
            <div className="min-h-[22px] px-1">
              {/* Client Validation Error */}
              {clientError && (
                <div
                  id="newsletter-client-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 animate-fadeIn"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{clientError}</span>
                </div>
              )}

              {/* Server Rejection Error */}
              {subscriptionErrorMsg && (
                <div
                  id="newsletter-server-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 animate-fadeIn"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{subscriptionErrorMsg}</span>
                </div>
              )}

              {/* Confirmed Server Success */}
              {subscriptionSuccess && (
                <div
                  id="newsletter-success-msg"
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-fadeIn"
                >
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>
                    {t('footer.newsletterSuccess') ||
                      (locale === 'bn' ? 'ধন্যবাদ! সফলভাবে নিউজলেটারে যুক্ত হয়েছেন।' : 'Thank you for subscribing! Welcome to our community.')
                    }
                  </span>
                </div>
              )}
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
