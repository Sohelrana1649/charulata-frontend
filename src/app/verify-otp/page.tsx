'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtpMutation, useForgotPasswordMutation } from '@/store/api/authApi';
import { ArrowLeft, ArrowRight, Loader2, KeyRound, RefreshCw } from 'lucide-react';
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
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character typed (in case of double inputs)
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMsg('');

    // Automatically focus next field if a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace for navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, delete previous and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
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

    // Focus the last input field after pasting
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
        toast.success('New OTP verification code sent to your email.');
        setSuccessMsg('OTP code has been resent.');
        setTimer(60); // Reset countdown timer to 60 seconds
        setOtp(Array(6).fill('')); // Clear inputs
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg('Failed to resend verification code. Please try again.');
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
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      const result = await verifyOtp({ email, otp: otpCode }).unwrap();
      if (result.success || result.status === 'success') {
        toast.success('OTP code verified successfully!');
        setSuccessMsg('OTP code verified! Redirecting to setup new password...');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
        }, 1500);
      } else {
        setErrorMsg('Verification failed. Please double check the OTP.');
      }
    } catch (err: any) {
      console.error('OTP Verification error:', err);
      setErrorMsg(err?.data?.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[75vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/forgot-password" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-secondary transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>{locale === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন এ ফিরে যান' : 'Back to Forgot Password'}</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">
          {t('auth.otpTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === 'bn' ? 'আমরা একটি ৬-সংখ্যার ওয়ান-টাইম পাসওয়ার্ড (ওটিপি) পাঠিয়েছি ' : 'We have sent a 6-digit One-Time Password (OTP) to '}<span className="font-semibold text-foreground">{email || 'your email'}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card px-4 py-8 shadow-sm sm:rounded-xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {locale === 'bn' ? '৬-সংখ্যার যাচাইকরণ কোড (ওটিপি)' : '6-Digit Verification Code (OTP)'}
              </label>
              
              {/* 6 Digit Input Group */}
              <div className="flex justify-between gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-lg font-bold border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground bg-muted"
                  />
                ))}
              </div>
            </div>

            {/* Timer and Resend Action */}
            <div className="flex items-center justify-between text-xs font-medium">
              {timer > 0 ? (
                <span className="text-muted-foreground">
                  {locale === 'bn' ? `${timer} সেকেন্ড পর কোড পুনরায় পাঠান` : `Resend code in ${timer}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="inline-flex items-center space-x-1 text-secondary hover:opacity-90 transition font-bold"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="animate-spin h-3.5 w-3.5 mr-1" />
                      <span>{locale === 'bn' ? 'পুনরায় পাঠানো হচ্ছে...' : 'Resending...'}</span>
                    </>
                  ) : (
                    <span>{t('auth.resendOtp')}</span>
                  )}
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-600">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg bg-green-50 p-3.5 text-xs font-medium text-green-700">
                {successMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex w-full justify-center items-center space-x-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 transition"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>{locale === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.verifyOtp')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[75vh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}
