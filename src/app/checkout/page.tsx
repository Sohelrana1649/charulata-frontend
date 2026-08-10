'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#c99a3c] mb-2" />
        <p className="text-sm text-gray-500">Loading Checkout...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-slate-50/50">
      <CheckoutForm />
    </main>
  );
}
