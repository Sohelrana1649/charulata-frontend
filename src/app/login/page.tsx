'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/store/authSlice';
import { User, Mail, Phone, Lock, Loader2, ArrowRight, Eye, EyeOff, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/i18n/LanguageContext';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '';
  const isExpired = searchParams?.get('expired') === 'true';

  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const { t } = useTranslation();

  useEffect(() => {
    if (isExpired) {
      toast.warning('আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।');
    }
  }, [isExpired]);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Clean Bangladeshi phone digits helper
  const cleanBdPhoneDigits = (input: string): string => {
    let cleaned = input.trim().replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+88')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('88')) {
      cleaned = cleaned.substring(2);
    }
    return cleaned;
  };

  // Helper to detect if user typed an email or phone number for interactive badge
  const getIdentifierType = (val: string) => {
    if (!val) return null;
    if (val.includes('@')) return 'email';
    const cleaned = cleanBdPhoneDigits(val);
    if (/^\d+$/.test(cleaned) || val.startsWith('+')) return 'phone';
    return null;
  };

  const detectedType = getIdentifierType(formData.identifier);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (['super_admin', 'admin', 'staff'].includes(user.role)) {
        router.push('/admin');
      } else if (redirectTarget) {
        const cleanPath = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`;
        router.push(cleanPath);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.identifier.trim()) {
      const msg = t('auth.phoneOrEmailRequired');
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!formData.password) {
      const msg = t('auth.passwordRequired') || 'পাসওয়ার্ড দিন';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      let finalIdentifier = formData.identifier.trim();

      // If user typed a phone number, convert to E.164 format (+8801XXXXXXXXX)
      if (!finalIdentifier.includes('@')) {
        const cleanedPhone = cleanBdPhoneDigits(finalIdentifier);
        finalIdentifier = `+88${cleanedPhone}`;
      } else {
        finalIdentifier = finalIdentifier.toLowerCase();
      }

      const payload: any = {
        identifier: finalIdentifier,
        password: formData.password,
      };

      if (finalIdentifier.includes('@')) {
        payload.email = finalIdentifier;
      } else {
        payload.phone = finalIdentifier;
      }

      const result = await login(payload).unwrap();

      const token = result.token || result.data?.token;
      const user = result.user || result.data?.user;

      if (token && user) {
        dispatch(
          setCredentials({
            token,
            user,
          })
        );
        toast.success(t('auth.welcomeBack'));
        if (['super_admin', 'admin', 'staff'].includes(user.role)) {
          router.push('/admin');
        } else if (redirectTarget) {
          const cleanPath = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`;
          router.push(cleanPath);
        } else {
          router.push('/');
        }
      } else {
        const msg = t('errors.loginResponseError');
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msgKey = err?.data?.messageKey;
      const msg = msgKey ? t(msgKey) : (err?.data?.message || err?.message || t('errors.loginFailed'));
      console.error('Login error:', msg, err);
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // Prevent authenticated user form flash during redirect
  if (isAuthenticated) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-background selection:bg-primary selection:text-white">
      {/* Main Container Grid */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* LEFT SIDE: LOGIN FORM CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none flex flex-col justify-center">
          <div className="bg-card px-6 py-7 sm:px-8 sm:py-8 rounded-2xl border border-border/80 h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="text-left mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                  {t('auth.loginTitle') || 'স্বাগতম'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {t('auth.loginSubtitle') || 'আপনার চারুলতা অ্যাকাউন্টে সাইন ইন করুন'}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                
                {/* 1. PHONE OR EMAIL FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="identifier"
                      className="block text-xs font-semibold text-foreground/80"
                    >
                      {t('auth.phoneOrEmail') || 'মোবাইল নম্বর বা ইমেইল'} <span className="text-destructive">*</span>
                    </label>

                    {/* Dynamic Identifier Badge */}
                    {detectedType && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 animate-fade-in">
                        {detectedType === 'email' ? (
                          <>
                            <Mail className="w-3 h-3" /> Email
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-3 h-3" /> BD Mobile (+880)
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      {detectedType === 'phone' ? (
                        <Phone className="h-4 w-4 text-primary transition-colors duration-200" aria-hidden="true" />
                      ) : detectedType === 'email' ? (
                        <Mail className="h-4 w-4 text-primary transition-colors duration-200" aria-hidden="true" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      disabled={isLoading}
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 placeholder-muted-foreground/60"
                      placeholder={t('auth.phoneOrEmailPlaceholder') || 'Enter phone number or email address'}
                    />
                  </div>
                </div>

                {/* 2. PASSWORD FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-foreground/80"
                    >
                      {t('auth.password') || 'পাসওয়ার্ড'} <span className="text-destructive">*</span>
                    </label>
                    <div className="text-xs">
                      <Link
                        href="/forgot-password"
                        className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
                      >
                        {t('auth.forgotPassword') || 'পাসওয়ার্ড ভুলে গেছেন?'}
                      </Link>
                    </div>
                  </div>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="auth-input block w-full rounded-xl border border-border bg-background py-3 pl-10 pr-11 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 placeholder-muted-foreground/60"
                      placeholder={t('auth.loginPasswordPlaceholder') || 'Enter your password'}
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

                {/* 3. REMEMBER ME CHECKBOX */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  >
                    {t('auth.rememberMe') || 'মনে রাখুন'}
                  </label>
                </div>

                {/* ERROR MESSAGE DISPLAY */}
                {errorMsg && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive animate-fade-in">
                    {errorMsg}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex w-full justify-center items-center space-x-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 cursor-pointer min-h-[44px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>{t('common.loading') || 'সাইন ইন হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('auth.login') || 'সাইন ইন'}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>

                {/* GOOGLE LOGIN BUTTON */}
                <GoogleLoginButton />
              </form>
            </div>

            {/* BOTTOM REGISTRATION LINK */}
            <div className="mt-6 text-center border-t border-border/60 pt-4">
              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount') || 'অ্যাকাউন্ট নেই?'}{' '}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline underline-offset-4 transition-colors ml-1"
                >
                  {t('auth.signUpHere') || 'এখানে সাইন আপ করুন'}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: HERO IMAGE (/auth/login.png) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-center h-full relative">
          <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden group bg-card">
            <Image
              src="/auth/login.png"
              alt="Charulata Lifestyle Auth"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-102"
              priority
            />
            {/* Soft Ambient Text Shadow Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            {/* Light Glass Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/55 backdrop-blur-lg border border-white/20 text-white shadow-lg">
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <Sparkles className="w-4 h-4 shrink-0 text-rose-300" />
                {t('auth.heroLoginBadge') || 'স্বাগতম চারুলতা শপে'}
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                {t('auth.heroLoginText') || 'আভিজাত্য ও ঐতিহ্যের অনন্য সমন্বয় — আপনার কেনাকাটার সেরা অভিজ্ঞতা।'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center bg-background">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

