'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

interface GoogleLoginButtonProps {
  redirectUrl?: string;
}

export default function GoogleLoginButton({ redirectUrl = '/' }: GoogleLoginButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [googleLoginMutation, { isLoading: isMutationLoading }] = useGoogleLoginMutation();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    const tokenToUse = tokenResponse?.access_token || tokenResponse?.credential;
    if (!tokenToUse) {
      toast.error('Google verification failed. Token missing.');
      return;
    }

    try {
      setIsVerifying(true);
      const res: any = await googleLoginMutation({
        credential: tokenToUse,
        idToken: tokenToUse,
      }).unwrap();

      const user = res?.user || res?.data?.user;
      const token = res?.token || res?.data?.token;

      if (user && token) {
        dispatch(setCredentials({ user, token }));
        toast.success(`Welcome back, ${user.name || 'User'}! 🎉`);

        if (['super_admin', 'admin', 'staff'].includes(user.role)) {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
      } else {
        toast.error('Google login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMsg = err?.data?.message || 'Google authentication failed';
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (errorResponse) => {
      console.error('Google login cancelled/failed:', errorResponse);
      toast.error('Google Sign-In was cancelled or failed.');
    },
  });

  const isLoading = isMutationLoading || isVerifying;

  const orText = t('auth.or') || (locale === 'en' ? 'OR' : 'অথবা');
  const continueText = t('auth.continueWithGoogle') || (locale === 'en' ? 'Continue with Google' : 'Google দিয়ে সাইন ইন করুন');
  const verifyingText = t('auth.googleVerifying') || (locale === 'en' ? 'Verifying Google Sign-In...' : 'Google সাইন ইন যাচাই হচ্ছে...');

  return (
    <div className="w-full flex flex-col items-center justify-center my-3">
      {/* Divider */}
      <div className="relative w-full flex items-center justify-center my-3">
        <div className="border-t border-border/80 w-full" />
        <span className="bg-card px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 select-none">
          {orText}
        </span>
      </div>

      {/* User-Friendly Google Button matching form style */}
      <button
        type="button"
        onClick={() => !isLoading && loginWithGoogle()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-background hover:bg-muted/70 active:scale-[0.99] text-foreground text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer min-h-[44px] disabled:opacity-60 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{verifyingText}</span>
          </>
        ) : (
          <>
            <Image
              src="/auth/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5 shrink-0 object-contain"
            />
            <span>{continueText}</span>
          </>
        )}
      </button>
    </div>
  );
}
