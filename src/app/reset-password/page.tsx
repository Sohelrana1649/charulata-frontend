'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { Mail, KeyRound, Lock, Loader2, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';
import { toast } from 'react-toastify';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const emailParam = searchParams.get('email');
  const otpParam = searchParams.get('otp');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: emailParam || '',
      otp: otpParam || '',
    }));
  }, [emailParam, otpParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email.trim()) {
      const msg = locale === 'bn' ? 'ইমেইল অ্যাড্রেস লিখুন।' : 'Email address is required.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!otpParam && formData.otp.trim().length !== 6) {
      const msg = locale === 'bn' ? '৬-সংখ্যার সঠিক ওটিপি কোড লিখুন।' : 'OTP code must be exactly 6 digits.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = locale === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = locale === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি।' : 'Passwords do not match.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      const result = await resetPassword({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        password: formData.password,
      }).unwrap();

      if (result.success || result.status === 'success' || result.message) {
        const msg = result.message || (locale === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! লগইনে নিয়ে যাওয়া হচ্ছে...' : 'Password reset successful! Redirecting to login...');
        setSuccessMsg(msg);
        toast.success(msg);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const msg = locale === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Password reset failed. Please try again.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const msg = err?.data?.message || (locale === 'bn' ? 'যাচাইকরণ ব্যর্থ হয়েছে। অনুগ্রহ করে ওটিপি চেক করে আবার চেষ্টা করুন।' : 'Verification failed. Please check the OTP and try again.');
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
                <span>Charulata Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                {locale === 'bn' ? 'নতুন পাসওয়ার্ড' : 'Reset Your'}{' '}
                <span className="text-primary">{locale === 'bn' ? 'সেট করুন' : 'Password'}</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার অ্যাকাউন্টের জন্য একটি নতুন পাসওয়ার্ড তৈরি করুন।'
                  : 'Enter your new secure credentials below to access your account.'}
              </p>
            </div>

            {/* Success View or Form */}
            {successMsg ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {locale === 'bn' ? 'অভিনন্দন!' : 'Success!'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  {successMsg}
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all"
                >
                  <span>{locale === 'bn' ? 'লগইন করুন' : 'Go to Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* 1. EMAIL FIELD */}
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
                      disabled={!!emailParam}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-muted-foreground/60 disabled:opacity-70 disabled:bg-muted/40"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* 2. OTP CODE (if not in URL) */}
                {!otpParam && (
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-xs font-semibold text-foreground/80 mb-1.5"
                    >
                      {locale === 'bn' ? '৬-সংখ্যার ওটিপি কোড' : '6-Digit Verification Code (OTP)'}{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative rounded-xl">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) =>
                          setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })
                        }
                        className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-mono tracking-widest text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-muted-foreground/60"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                )}

                {/* 3. NEW PASSWORD FIELD */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-foreground/80 mb-1.5"
                  >
                    {locale === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}{' '}
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-11 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-muted-foreground/60"
                      placeholder={locale === 'bn' ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড' : 'Enter new password (min. 6 chars)'}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. CONFIRM PASSWORD FIELD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-foreground/80 mb-1.5"
                  >
                    {locale === 'bn' ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm Password'}{' '}
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-11 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-muted-foreground/60"
                      placeholder={locale === 'bn' ? 'পুনরায় পাসওয়ার্ড লিখুন' : 'Re-enter your new password'}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message Box */}
                {errorMsg && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive animate-fade-in">
                    {errorMsg}
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
                        <span>{locale === 'bn' ? 'পরিবর্তন করা হচ্ছে...' : 'Verifying & resetting...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{locale === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Reset Password'}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center border-t border-border/60 pt-4">
            <p className="text-sm text-muted-foreground">
              {locale === 'bn' ? 'লগইন পেজে ফিরতে চান?' : 'Already have access?'}{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors ml-1"
              >
                {locale === 'bn' ? 'সাইন ইন করুন' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center bg-background">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
