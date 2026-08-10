'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await forgotPassword({ email }).unwrap();
      
      if (result.success || result.status === 'success') {
        setSuccessMsg(result.message || 'OTP sent successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setErrorMsg('Failed to send OTP code. Please try again.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setErrorMsg(
        err?.data?.message || 'Email not found or error occurred. Please try again.'
      );
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/login" className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-[#c99a3c] transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
          Forgot Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your registered email address below. We will send you a mandatory 6-digit OTP to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 py-3 pl-10 text-sm focus:border-[#c99a3c] focus:outline-none focus:ring-0"
                  placeholder="Enter your email address"
                />
              </div>
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
                disabled={isLoading}
                className="flex w-full justify-center items-center space-x-2 rounded-lg bg-[#c99a3c] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#b0842e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c99a3c] disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
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
