import React from 'react';
import type { Metadata } from 'next';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'চেকআউট | Charulata Lifestyle',
  description: 'Complete your order with Cash on Delivery in Bangladesh.',
};

export const revalidate = 300; // 5 mins ISR revalidation for delivery zones

const getCleanApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.charulatalifestyle.com/api/v1';
};

async function fetchDeliveryDistricts() {
  try {
    const res = await fetch(`${getCleanApiUrl()}/delivery/districts`, {
      next: { revalidate: 300, tags: ['delivery'] },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data || json || [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default async function CheckoutPage() {
  const districts = await fetchDeliveryDistricts();

  return (
    <main className="flex-1 bg-slate-50/50">
      <CheckoutForm initialDistricts={districts} />
    </main>
  );
}
