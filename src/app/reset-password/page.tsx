'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { Mail, KeyRound, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

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

    if (formData.otp.length !== 6) {
      setErrorMsg('OTP code must be exactly 6 digits.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      const result = await resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password,
      }).unwrap();

      if (result.success || result.status === 'success') {
        setSuccessMsg(result.message || 'Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrorMsg('Password reset failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setErrorMsg(
        err?.data?.message || 'Verification failed. Please check the OTP and try again.'
      );
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 font-serif">
          Reset Your <span className="text-[#c99a3c]">Password</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit verification code sent to your email to configure your new credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          {successMsg ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-950 mb-1">Success!</h3>
              <p className="text-sm text-gray-500 mb-6">{successMsg}</p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 rounded-lg bg-[#c99a3c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b0842e] transition"
              >
                <span>Go to Login</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={!!emailParam}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-lg border border-gray-200 py-3 pl-10 text-sm focus:border-[#c99a3c] focus:outline-none focus:ring-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {!otpParam && (
                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    6-Digit Verification Code (OTP)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      className="block w-full rounded-lg border border-gray-200 py-3 pl-10 text-sm tracking-widest font-semibold focus:border-[#c99a3c] focus:outline-none focus:ring-0"
                      placeholder="e.g. 123456"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-lg border border-gray-200 py-3 pl-10 text-sm focus:border-[#c99a3c] focus:outline-none focus:ring-0"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="block w-full rounded-lg border border-gray-200 py-3 pl-10 text-sm focus:border-[#c99a3c] focus:outline-none focus:ring-0"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-600">
                  {errorMsg}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center space-x-2 rounded-lg bg-[#c99a3c] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#b0842e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99a3c] disabled:opacity-50 transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Verifying & resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center bg-slate-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#c99a3c]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
