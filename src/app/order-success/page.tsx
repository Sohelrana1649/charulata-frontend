'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

function OrderSuccessFallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || searchParams.get('id');

  useEffect(() => {
    if (orderId) {
      router.replace(`/order-success/${encodeURIComponent(orderId)}`);
    }
  }, [orderId, router]);

  if (orderId) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Redirecting to order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
        <ShoppingBag size={28} />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-foreground">Order Success</h1>
        <p className="text-xs text-muted-foreground max-w-sm">
          Please view your order details from your profile or the link sent in your confirmation.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderSuccessFallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessFallbackContent />
    </Suspense>
  );
}
