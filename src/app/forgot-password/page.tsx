'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { Mail, ArrowRight, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      const msg = locale === 'bn' ? 'ইমেইল অ্যাড্রেস লিখুন' : 'Please enter your email address';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      const result = await forgotPassword({ email: email.trim().toLowerCase() }).unwrap();
      
      if (result.success || result.status === 'success' || result.message) {
        const msg = result.message || (locale === 'bn' ? 'আপনার ইমেইলে ওটিপি কোড পাঠানো হয়েছে!' : 'Verification OTP sent to your email!');
        setSuccessMsg(msg);
        toast.success(msg);
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        }, 1200);
      } else {
        const msg = locale === 'bn' ? 'ওটিপি পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to send OTP code. Please try again.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const msg = err?.data?.message || (locale === 'bn' ? 'ইমেইল পাওয়া যায়নি অথবা সমস্যা হয়েছে।' : 'Email not found or an error occurred. Please try again.');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-background selection:bg-primary selection:text-white">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-card px-6 py-7 sm:px-8 sm:py-8 rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between">
          <div>
            {/* Back to Login */}
            <div className="mb-4">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{locale === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to Sign In'}</span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-left mb-6">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold tracking-wide uppercase mb-2.5">
                <Sparkles className="w-3 h-3" />
                <span>Charulata Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                {locale === 'bn' ? 'পাসওয়ার্ড' : 'Forgot'}{' '}
                <span className="text-primary">{locale === 'bn' ? 'ভুলে গেছেন?' : 'Password?'}</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার রেজিস্টার্ড ইমেইল দিন। পাসওয়ার্ড রিসেট করার জন্য ৬-সংখ্যার একটি ওটিপি কোড পাঠানো হবে।'
                  : 'Enter your registered email address. We will send a 6-digit OTP code to reset your password.'}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* EMAIL FIELD */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground/80 mb-1.5"
                >
                  {locale === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}{' '}
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative rounded-xl">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-muted-foreground/60"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  ✓ {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full justify-center items-center space-x-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 cursor-pointer min-h-[44px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>{locale === 'bn' ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{locale === 'bn' ? 'ভেরিফিকেশন কোড পাঠান' : 'Send Verification Code'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center border-t border-border/60 pt-4">
            <p className="text-sm text-muted-foreground">
              {locale === 'bn' ? 'পাসওয়ার্ড মনে পড়েছে?' : 'Remember your password?'}{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors ml-1"
              >
                {locale === 'bn' ? 'লগইন করুন' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
