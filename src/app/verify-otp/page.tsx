'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtpMutation, useForgotPasswordMutation } from '@/store/api/authApi';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/i18n/LanguageContext';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useForgotPasswordMutation();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { t, locale } = useTranslation();

  // Refs for the 6 input fields to manage focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle digit input
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace for navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle pasting the 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit OTP code.');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    setErrorMsg('');
    inputRefs.current[5]?.focus();
  };

  // Resend OTP code action
  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await resendOtp({ email }).unwrap();
      if (result.success || result.status === 'success') {
        toast.success(locale === 'bn' ? 'নতুন ওটিপি কোড পাঠানো হয়েছে।' : 'New OTP code sent.');
        setSuccessMsg(locale === 'bn' ? 'নতুন ওটিপি পাঠানো হয়েছে।' : 'OTP code has been resent.');
        setTimer(60);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg(locale === 'bn' ? 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to resend code.');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setErrorMsg(err?.data?.message || 'Error occurred. Please try again.');
    }
  };

  // Submit OTP Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrorMsg(locale === 'bn' ? 'সবগুলো ৬টি সংখ্যা লিখুন।' : 'Please enter all 6 digits.');
      return;
    }

    try {
      const result = await verifyOtp({ email: email.trim().toLowerCase(), otp: otpCode.trim() }).unwrap();
      if (result.success || result.status === 'success') {
        toast.success(locale === 'bn' ? 'ওটিপি কোড সফলভাবে যাচাই হয়েছে!' : 'OTP code verified successfully!');
        setSuccessMsg(locale === 'bn' ? 'ওটিপি যাচাই হয়েছে! পাসওয়ার্ড সেট করার পেজে নিয়ে যাওয়া হচ্ছে...' : 'OTP verified! Redirecting to setup password...');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&otp=${otpCode.trim()}`);
        }, 1200);
      } else {
        setErrorMsg(locale === 'bn' ? 'যাচাইকরণ ব্যর্থ হয়েছে। ওটিপি চেক করুন।' : 'Verification failed.');
      }
    } catch (err: any) {
      console.error('OTP Verification error:', err);
      setErrorMsg(err?.data?.message || (locale === 'bn' ? 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি।' : 'Invalid or expired OTP.'));
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
            {/* Back Link */}
            <div className="mb-4">
              <Link
                href="/forgot-password"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>{locale === 'bn' ? 'ইমেইল পরিবর্তন করুন' : 'Back to Forgot Password'}</span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-left mb-6">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold tracking-wide uppercase mb-2.5">
                <Sparkles className="w-3 h-3" />
                <span>Charulata Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                {locale === 'bn' ? 'ওটিপি যাচাইকরণ' : 'Verify Code'}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {locale === 'bn' ? 'আমরা একটি ৬-সংখ্যার ওটিপি কোড পাঠিয়েছি ' : 'We have sent a 6-digit OTP code to '}
                <span className="font-semibold text-foreground">{email || 'your email'}</span>.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-2">
                  {locale === 'bn' ? '৬-সংখ্যার যাচাইকরণ কোড' : '6-Digit Verification Code (OTP)'} <span className="text-destructive">*</span>
                </label>
                
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`h-12 w-full text-center text-lg sm:text-xl font-bold rounded-xl border bg-background text-foreground transition-all duration-200 outline-none ${
                        digit
                          ? 'border-primary ring-2 ring-primary/20 font-mono'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Message Display */}
              {errorMsg && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Success Message Display */}
              {successMsg && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  ✓ {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isVerifying || otp.join('').length !== 6}
                  className="group flex w-full justify-center items-center space-x-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 cursor-pointer min-h-[44px]"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>{locale === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{locale === 'bn' ? 'কোড যাচাই করুন' : 'Verify Code'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Resend OTP Section */}
              <div className="text-center pt-2">
                {timer > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {locale === 'bn' ? 'পুনরায় ওটিপি পাঠাতে অপেক্ষা করুন: ' : 'Resend code in: '}
                    <span className="font-bold text-primary font-mono">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={isResending}
                    onClick={handleResend}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>{locale === 'bn' ? 'নতুন ওটিপি কোড পাঠান' : 'Resend OTP Code'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center border-t border-border/60 pt-4">
            <p className="text-sm text-muted-foreground">
              {locale === 'bn' ? 'লগইন পেজে ফিরতে চান?' : 'Already have access?'}{' '}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline underline-offset-4 transition-colors ml-1"
              >
                {locale === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center bg-background">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
