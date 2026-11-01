'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetOrderDetailsQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';
import { downloadInvoicePdf } from '@/utils/invoicePdf';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderInvoiceViewPage() {
  const params = useParams();
  const rawOrderId = params?.orderId as string;
  const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : '';

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<any>(null);

  const { data: serverData, isLoading } = useGetOrderDetailsQuery(orderId, {
    skip: !isAuthenticated || !orderId,
  });

  useEffect(() => {
    if (!orderId) return;

    try {
      const sessionKey = `charulata_order_${orderId}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        setOrder(parsed.order || parsed);
        return;
      }

      const storedOrdersRaw = localStorage.getItem('charulata_placed_orders');
      if (storedOrdersRaw) {
        const storedOrders = JSON.parse(storedOrdersRaw);
        if (storedOrders[orderId]) {
          setOrder(storedOrders[orderId].order || storedOrders[orderId]);
          return;
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
  }, [orderId]);

  useEffect(() => {
    if (serverData) {
      const ord = serverData.data?.order || serverData.order || serverData.data;
      if (ord) setOrder(ord);
    }
  }, [serverData]);

  const handlePrint = () => {
    if (order) {
      downloadInvoicePdf(order);
    }
  };

  if (!order && isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">ইনভয়েস লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-card border border-border rounded-2xl text-center space-y-4">
        <h1 className="text-lg font-bold text-foreground">অর্ডার পাওয়া যায়নি</h1>
        <p className="text-xs text-muted-foreground">
          এই অর্ডারের ইনভয়েস দেখতে প্রথমে অর্ডার সফল হওয়ার পেইজে যান।
        </p>
        <Link
          href={`/order-success/${encodeURIComponent(orderId)}`}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>অর্ডার পেইজে যান</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between gap-3 bg-muted/60 border border-border/80 p-3.5 rounded-2xl">
        <Link
          href={`/order-success/${encodeURIComponent(orderId)}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-foreground hover:text-primary transition"
        >
          <ArrowLeft size={15} />
          <span>অর্ডার সফল পেইজে ফিরে যান</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-[#b0842e] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download size={14} />
            <span>Invoice Download (PDF)</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md inline-flex items-center space-x-2 transition cursor-pointer"
        >
          <Printer size={16} />
          <span>প্রিন্ট অথবা PDF ডাউনলোড করুন</span>
        </button>
      </div>
    </div>
  );
}
