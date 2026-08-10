'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRegisterMutation } from '@/store/api/authApi';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

// Regex pattern definitions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bdPhoneDigitsRegex = /^01[3-9]\d{8}$/;

/**
 * Normalizes input to check if it's a valid Bangladeshi phone number
 */
const cleanBdPhoneDigits = (input: string): string => {
  let cleaned = input.trim().replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+88')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('88')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
};

// Zod validation schema for single input registration
const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Full Name must be at least 2 characters.' }),
    identifier: z
      .string()
      .trim()
      .min(1, { message: 'Phone number or email address is required.' })
      .refine(
        (val) => {
          if (!val) return false;
          if (val.includes('@')) {
            return emailRegex.test(val);
          }
          const cleanedPhone = cleanBdPhoneDigits(val);
          return bdPhoneDigitsRegex.test(cleanedPhone);
        },
        {
          message:
            'Please enter a valid email address or 11-digit Bangladeshi phone number (e.g., 01712345678).',
        }
      ),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password.' }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and privacy policy.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [rtkRegister, { isLoading: isRtkLoading }] = useRegisterMutation();
  const { t, locale } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // React Hook Form initialization with Zod schema
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      identifier: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const identifierValue = watch('identifier') || '';
  const passwordValue = watch('password') || '';

  // Password strength calculation helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/\d/.test(pass)) score++;
    if (/[A-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: t('auth.weak') || 'দুর্বল', color: 'bg-destructive' };
    if (score === 2) return { score: 2, label: t('auth.medium') || 'মাঝারি', color: 'bg-amber-500' };
    return { score: 3, label: t('auth.strong') || 'শক্তিশালী', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(passwordValue);

  // Detect input mode for interactive user helper badge
  const getIdentifierType = (val: string) => {
    if (!val) return null;
    if (val.includes('@')) return 'email';
    const cleaned = cleanBdPhoneDigits(val);
    if (/^\d+$/.test(cleaned) || val.startsWith('+')) return 'phone';
    return null;
  };

  const detectedType = getIdentifierType(identifierValue);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Form submission handler
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmittingForm(true);

    try {
      let finalIdentifier = data.identifier.trim();

      // If user entered a phone number, convert to E.164 format (+8801XXXXXXXXX)
      if (!finalIdentifier.includes('@')) {
        const cleanedPhone = cleanBdPhoneDigits(finalIdentifier);
        finalIdentifier = `+88${cleanedPhone}`;
      } else {
        finalIdentifier = finalIdentifier.toLowerCase();
      }

      const payload = {
        name: data.name.trim(),
        identifier: finalIdentifier,
        password: data.password,
      };

      // Register in Express MongoDB backend
      try {
        await rtkRegister(payload).unwrap();
      } catch (rtkErr: any) {
        console.error('RTK Express registration error:', rtkErr);
        const msgKey = rtkErr?.data?.messageKey;
        const errorMsg = msgKey ? t(msgKey) : (rtkErr?.data?.message || rtkErr?.message || t('errors.registrationFailed'));
        toast.error(errorMsg);
        setIsSubmittingForm(false);
        return;
      }

      // Sync with Next.js API route
      try {
        const syncRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!syncRes.ok) {
          console.warn('Next.js route registration sync returned non-ok status:', syncRes.status);
          toast.warn(t('auth.syncWarning') || 'সেশন সিঙ্ক সমস্যা হয়েছে, পুনরায় লগইন প্রয়োজন হতে পারে');
        }
      } catch (fetchErr) {
        console.warn('Next.js route registration sync failed:', fetchErr);
        toast.warn(t('auth.syncWarning') || 'সেশন সিঙ্ক সমস্যা হয়েছে, পুনরায় লগইন প্রয়োজন হতে পারে');
      }

      toast.success(t('auth.registerSuccess'));
      router.push('/login');
    } catch (err: any) {
      console.error('Registration submission error:', err);
      const msgKey = err?.data?.messageKey;
      const errMsg = msgKey ? t(msgKey) : (err?.data?.message || err?.message || t('errors.genericError'));
      toast.error(errMsg);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const isLoading = isSubmittingForm || isRtkLoading;

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
        
        {/* LEFT SIDE: HERO IMAGE (/auth/register.png) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-center h-full relative">
          <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden group bg-card">
            <Image
              src="/auth/register.png"
              alt="Charulata Lifestyle Register"
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
                {t('auth.heroRegisterBadge') || 'চারুলতা পরিবারে স্বাগতম'}
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                {t('auth.heroRegisterText') || 'আজই যুক্ত হন আমাদের সাথে এবং উপভোগ করুন বিশেষ ছাড় ও প্রিমিয়াম সেবা।'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: REGISTER FORM CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none flex flex-col justify-center">
          <div className="bg-card px-6 py-7 sm:px-8 sm:py-8 rounded-2xl border border-border/80 h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="text-left mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                  {t('auth.registerTitle') || 'অ্যাকাউন্ট তৈরি করুন'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {t('auth.registerSubtitle') || 'আজই নিবন্ধন করুন, সহজে কেনাকাটা করুন এবং অর্ডারের সর্বশেষ আপডেট পান।'}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                
                {/* 1. FULL NAME FIELD */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-foreground/80 mb-1.5"
                  >
                    {t('auth.fullName') || 'সম্পূর্ণ নাম'} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      disabled={isLoading}
                      autoComplete="name"
                      placeholder={t('auth.fullNamePlaceholder') || 'আপনার পুরো নাম লিখুন'}
                      className={`auth-input block w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground/60 transition-colors duration-200 outline-none ${
                        errors.name
                          ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                          : touchedFields.name
                          ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 flex items-center text-xs font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* 2. PHONE OR EMAIL (SINGLE INPUT) FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="identifier"
                      className="block text-xs font-semibold text-foreground/80"
                    >
                      {t('auth.phoneOrEmail') || 'ফোন নম্বর বা ইমেইল'} <span className="text-destructive">*</span>
                    </label>
                    {/* Dynamic Detector Badge */}
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
                      {detectedType === 'email' ? (
                        <Mail className="h-4 w-4 text-primary transition-colors duration-200" aria-hidden="true" />
                      ) : detectedType === 'phone' ? (
                        <Phone className="h-4 w-4 text-primary transition-colors duration-200" aria-hidden="true" />
                      ) : (
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      disabled={isLoading}
                      autoComplete="username"
                      placeholder={t('auth.phoneOrEmailPlaceholder') || 'Enter phone number or email address'}
                      className={`auth-input block w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground/60 transition-colors duration-200 outline-none ${
                        errors.identifier
                          ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                          : touchedFields.identifier
                          ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      {...register('identifier')}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 flex items-center text-xs font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                {/* 3. PASSWORD FIELD */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-foreground/80 mb-1.5"
                  >
                    {t('auth.password') || 'পাসওয়ার্ড'} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      autoComplete="new-password"
                      placeholder={t('auth.passwordPlaceholder') || 'কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড লিখুন'}
                      className={`auth-input block w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground/60 transition-colors duration-200 outline-none ${
                        errors.password
                          ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                          : touchedFields.password
                          ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {passwordValue.length > 0 && (
                    <div className="mt-2 space-y-1 animate-fade-in">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">{t('auth.strength') || 'পাসওয়ার্ড শক্তি'}:</span>
                        <span className={`font-semibold ${
                          strength.score === 1 ? 'text-destructive' : strength.score === 2 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                        <div className={`h-full rounded-full transition-colors duration-300 ${strength.score >= 1 ? strength.color : 'bg-muted'}`} />
                        <div className={`h-full rounded-full transition-colors duration-300 ${strength.score >= 2 ? strength.color : 'bg-muted'}`} />
                        <div className={`h-full rounded-full transition-colors duration-300 ${strength.score >= 3 ? strength.color : 'bg-muted'}`} />
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 flex items-center text-xs font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* 4. CONFIRM PASSWORD FIELD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-foreground/80 mb-1.5"
                  >
                    {t('auth.confirmPassword') || 'পাসওয়ার্ড নিশ্চিত করুন'} <span className="text-destructive">*</span>
                  </label>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={isLoading}
                      autoComplete="new-password"
                      placeholder={t('auth.confirmPasswordPlaceholder') || 'পাসওয়ার্ডটি আবার লিখুন'}
                      className={`auth-input block w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground/60 transition-colors duration-200 outline-none ${
                        errors.confirmPassword
                          ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
                          : touchedFields.confirmPassword
                          ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 flex items-center text-xs font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* 5. TERMS & PRIVACY CHECKBOX */}
                <div className="pt-1">
                  <div className="flex items-start space-x-2">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      disabled={isLoading}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary accent-primary focus:ring-primary/20 cursor-pointer"
                      {...register('agreeToTerms')}
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-xs font-medium text-muted-foreground leading-snug cursor-pointer select-none"
                    >
                      {locale === 'bn' ? (
                        <>
                          আমি{' '}
                          <Link
                            href="/terms"
                            className="text-primary font-semibold hover:underline underline-offset-2"
                          >
                            শর্তাবলী
                          </Link>{' '}
                          ও{' '}
                          <Link
                            href="/privacy"
                            className="text-primary font-semibold hover:underline underline-offset-2"
                          >
                            গোপনীয়তা নীতি
                          </Link>{' '}
                          মেনে নিচ্ছি
                        </>
                      ) : (
                        <>
                          I agree to the{' '}
                          <Link
                            href="/terms"
                            className="text-primary font-semibold hover:underline underline-offset-2"
                          >
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            className="text-primary font-semibold hover:underline underline-offset-2"
                          >
                            Privacy Policy
                          </Link>
                        </>
                      )}
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-1 flex items-center text-xs font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>

                {/* 5. CREATE ACCOUNT SUBMIT BUTTON */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex w-full justify-center items-center space-x-2 rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 cursor-pointer min-h-[44px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>{t('auth.creatingAccount') || 'অ্যাকাউন্ট তৈরি হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('auth.register') || 'অ্যাকাউন্ট তৈরি করুন'}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>

                {/* GOOGLE LOGIN BUTTON */}
                <GoogleLoginButton />
              </form>
            </div>

            {/* BELOW BUTTON: LOGIN LINK */}
            <div className="mt-5 text-center border-t border-border/60 pt-4">
              <p className="text-sm text-muted-foreground">
                {t('auth.haveAccount') || 'ইতোমধ্যে অ্যাকাউন্ট আছে?'}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline underline-offset-4 transition-colors ml-1"
                >
                  {t('auth.signInHere') || 'সাইন ইন করুন'}
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

