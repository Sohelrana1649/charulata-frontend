'use client';

import React, { useState } from 'react';
import { useTrackOrderMutation } from '@/store/api/orderApi';
import { Package, Truck, Search, Calendar, User, MapPin, DollarSign, Loader2, Download } from 'lucide-react';
import { downloadInvoicePdf } from '@/utils/invoicePdf';

export default function TrackOrderPage() {
  const [trackOrder, { isLoading }] = useTrackOrderMutation();
  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setTrackingInfo(null);

    if (!formData.orderId.trim() || !formData.email.trim()) {
      setErrorMsg('Please enter both Order ID and Email.');
      return;
    }

    try {
      const res = await trackOrder({
        orderId: formData.orderId.trim(),
        email: formData.email.trim(),
      }).unwrap();

      if ((res.status === 'success' || res.success) && res.data) {
        setTrackingInfo(res.data.order || res.data);
      } else {
        setErrorMsg('Could not find order. Please verify Order ID and Email.');
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setErrorMsg(
        err?.data?.message || 'Failed to track order. Please check your credentials.'
      );
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/25',
    Confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
    Processing: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
    Packed: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
    Shipped: 'bg-pink-500/10 text-pink-500 border-pink-500/25',
    'Out for delivery': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/25',
    Delivered: 'bg-green-500/10 text-green-500 border-green-500/25',
    Cancelled: 'bg-red-500/10 text-red-500 border-red-500/25',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <div className="flex items-center space-x-2.5 mb-8 justify-center">
        <Truck className="text-[var(--brand)]" size={26} />
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] font-serif">Track Your Order</h1>
      </div>

      {/* Tracker Search Form */}
      <div className="max-w-md mx-auto bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Order ID
            </label>
            <input 
              type="text" 
              placeholder="e.g. CL-20260617-1234"
              value={formData.orderId}
              onChange={(e) => setFormData({...formData, orderId: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand)] placeholder-gray-500 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Billing Email
            </label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--brand)] placeholder-gray-500 transition-colors duration-200"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium border border-red-500/20">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--brand)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-md shadow-amber-500/10 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Locating Order...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tracking Result View */}
      {trackingInfo && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6 sm:p-8 space-y-8 animate-fade-in">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Tracking Code</span>
              <h2 className="text-lg font-mono font-bold text-[var(--foreground)] mt-0.5">{trackingInfo.orderId}</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => downloadInvoicePdf(trackingInfo)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[#0B0F19] transition cursor-pointer"
              >
                <Download size={13} />
                <span>Download Invoice PDF</span>
              </button>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                statusColors[trackingInfo.deliveryStatus] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}>
                {trackingInfo.deliveryStatus}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] shrink-0 border border-[var(--brand)]/20">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Recipient</p>
                <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{trackingInfo.shippingAddress?.recipientName}</p>
                <p className="text-xs text-gray-405">{trackingInfo.shippingAddress?.recipientPhone}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] shrink-0 border border-[var(--brand)]/20">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Shipping To</p>
                <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{trackingInfo.shippingAddress?.district}</p>
                <p className="text-xs text-gray-405 line-clamp-1">{trackingInfo.shippingAddress?.addressLine}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] shrink-0 border border-[var(--brand)]/20">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">COD Total</p>
                <p className="text-sm font-extrabold text-[var(--brand)] mt-0.5">BDT {trackingInfo.totalAmount}</p>
                <p className="text-xs text-gray-405">Method: {trackingInfo.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="border-t border-[var(--border)] pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center space-x-1.5">
              <Package size={16} className="text-[var(--brand)]" />
              <span>Live Delivery Timeline</span>
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
              {trackingInfo.timeline?.map((event: any, idx: number) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-white dark:border-gray-950 bg-[var(--brand)] ring-4 ring-[var(--background)] flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{event.title}</p>
                    {event.description && <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
