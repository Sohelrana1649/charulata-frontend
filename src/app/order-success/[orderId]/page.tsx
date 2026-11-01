'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import {
  CheckCircle2,
  Sparkles,
  Download,
  Printer,
  ShoppingBag,
  ArrowRight,
  Truck,
  Phone,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  AlertTriangle,
  RotateCcw,
  PackageCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { useTranslation } from '@/i18n/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { useGetOrderDetailsQuery } from '@/store/api/orderApi';
import { downloadInvoicePdf } from '@/utils/invoicePdf';
import { parseAndFormatOrderAddress } from '@/utils/orderAddress';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const rawOrderId = params?.orderId as string;
  const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : '';

  const [copied, setCopied] = useState<boolean>(false);
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // If user is authenticated, query the server directly for this order
  const { data: serverOrderData, isLoading: isServerLoading, error: serverError } = useGetOrderDetailsQuery(
    orderId,
    { skip: !isAuthenticated || !orderId }
  );

  // Check session storage and local device storage on mount
  useEffect(() => {
    if (!orderId) {
      setIsCheckingSession(false);
      return;
    }

    try {
      // 1. Check current session storage
      const sessionKey = `charulata_order_${orderId}`;
      const sessionData = sessionStorage.getItem(sessionKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        setLocalOrder(parsed.order || parsed);
        setIsVerified(true);
        setIsCheckingSession(false);
        return;
      }

      // 2. Check local storage for orders placed on this device
      const storedOrdersRaw = localStorage.getItem('charulata_placed_orders');
      if (storedOrdersRaw) {
        const storedOrders = JSON.parse(storedOrdersRaw);
        if (storedOrders[orderId]) {
          const matched = storedOrders[orderId];
          setLocalOrder(matched.order || matched);
          setIsVerified(true);
          setIsCheckingSession(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Session check error:', err);
    }

    setIsCheckingSession(false);
  }, [orderId]);

  // If server successfully returns order for authenticated user
  useEffect(() => {
    if (serverOrderData) {
      const order = serverOrderData.data?.order || serverOrderData.order || serverOrderData.data || serverOrderData;
      if (order) {
        setLocalOrder(order);
        setIsVerified(true);
      }
    }
  }, [serverOrderData]);

  // Effective order data
  const order = localOrder || serverOrderData?.data?.order || serverOrderData?.order;

  // Celebratory confetti animation on mount when order is verified
  useEffect(() => {
    if (isVerified && order) {
      try {
        const count = 220;
        const defaults = { origin: { y: 0.6 } };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        };

        fire(0.25, { spread: 30, startVelocity: 60, colors: ['#10b981', '#059669', '#34d399', '#fbbf24', '#800020'] });
        fire(0.2, { spread: 60, colors: ['#10b981', '#059669', '#34d399', '#fbbf24', '#e11d48'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9, colors: ['#10b981', '#059669', '#34d399', '#3b82f6', '#ec4899'] });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#10b981', '#059669', '#34d399', '#fbbf24'] });
      } catch (err) {
        console.error('Confetti animation error:', err);
      }
    }
  }, [isVerified, Boolean(order)]);

  // Manual ownership verification for external unauthenticated visitors
  const handleVerifyOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    const cleanInput = phoneInput.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanInput || cleanInput.length < 10) {
      setVerifyError(locale === 'bn' ? 'অনুগ্রহ করে সঠিক ফোন নম্বর দিন।' : 'Please enter a valid phone number.');
      return;
    }

    if (order) {
      const orderPhone = (order.shippingAddress?.recipientPhone || order.customer?.phone || '').replace(/[\s\-\(\)\+]/g, '');
      const inputEnding = cleanInput.slice(-10);
      const orderEnding = orderPhone.slice(-10);

      if (orderEnding && inputEnding === orderEnding) {
        setIsVerified(true);
        try {
          sessionStorage.setItem(`charulata_order_${orderId}`, JSON.stringify({ order, phone: orderPhone }));
        } catch {}
        toast.success(locale === 'bn' ? 'অর্ডার সফলভাবে যাচাই হয়েছে!' : 'Order verified successfully!');
      } else {
        setVerifyError(
          locale === 'bn'
            ? 'ফোন নম্বরটি এই অর্ডারের সাথে মিলছে না। অনুগ্রহ করে সঠিক নম্বর দিন।'
            : 'Phone number does not match this order. Please try again.'
        );
      }
    } else {
      setVerifyError(
        locale === 'bn'
          ? 'অর্ডারটি খুঁজে পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।'
          : 'Order could not be found or verification session has expired.'
      );
    }
  };

  const handleCopyOrderId = () => {
    if (typeof window !== 'undefined' && orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success(locale === 'bn' ? 'অর্ডার আইডি কপি করা হয়েছে!' : 'Order ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) {
      toast.error(locale === 'bn' ? 'অর্ডার তথ্য উপলব্ধ নয়' : 'Order details not available');
      return;
    }
    downloadInvoicePdf(order);
  };

  // Calculations & Details
  const orderIdDisplay = order?.orderId || order?._id || orderId || 'N/A';
  const items = Array.isArray(order?.items) ? order.items : [];
  const shippingAddress = order?.shippingAddress || {};
  const formattedAddress = parseAndFormatOrderAddress(shippingAddress);

  const subTotal = Number(order?.subTotal) || items.reduce(
    (acc: number, it: any) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const deliveryCharge = Number(order?.shippingCharge) || 0;
  const discount = Number(order?.discount) || 0;
  const totalAmount = Number(order?.totalAmount) || Math.max(0, subTotal + deliveryCharge - discount);
  const advanceAmount = Number(order?.advanceAmount || order?.advancePayment || 0);
  const dueCOD = Math.max(0, totalAmount - advanceAmount);

  const isCOD = !order?.paymentMethod || order.paymentMethod.toUpperCase() === 'COD' || order.paymentMethod.toLowerCase().includes('cash');
  const paymentStatusDisplay = isCOD
    ? (locale === 'bn' ? 'অপেক্ষারত (ক্যাশ অন ডেলিভারি)' : 'Pending (Cash on Delivery)')
    : (order?.paymentStatus ? String(order.paymentStatus).toUpperCase() : 'Paid');

  const orderStatusDisplay = order?.orderStatus || order?.deliveryStatus || 'Pending';

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Loading state
  if (isCheckingSession || (isAuthenticated && isServerLoading && !order)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-foreground">
          {locale === 'bn' ? 'অর্ডার তথ্য যাচাই হচ্ছে...' : 'Verifying order details...'}
        </h2>
      </div>
    );
  }

  // Privacy Protection Shield: If order owner is not verified (e.g. unknown visitor typing arbitrary orderId)
  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-foreground font-serif">
              {locale === 'bn' ? 'নিরাপত্তা যাচাইকরণ' : 'Security Verification'}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {locale === 'bn'
                ? 'অন্যের অর্ডারের গোপনীয়তা সুরক্ষার জন্য, অর্ডার করার সময় ব্যবহৃত ফোন নম্বরটি লিখে যাচাই করুন।'
                : 'To protect order privacy, please enter the recipient phone number used during checkout.'}
            </p>
          </div>

          <form onSubmit={handleVerifyOwnership} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                {locale === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                required
              />
            </div>

            {verifyError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck size={16} />
              <span>{locale === 'bn' ? 'যাচাই করে দেখুন' : 'Verify & View Order'}</span>
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              <span>{locale === 'bn' ? '← হোমে ফিরে যান' : '← Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* ── TOP CONFIRMATION BANNER ── */}
      <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-xs relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-25" />
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 size={32} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif tracking-tight">
              {locale === 'bn' ? 'ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত হয়েছে' : 'Thank You! Your Order is Confirmed'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto">
              {locale === 'bn'
                ? 'আপনার অর্ডারটি সফলভাবে ডাটাবেসে সেভ হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                : 'Your order has been successfully placed. We will contact you soon for confirmation.'}
            </p>
          </div>

          {/* Order ID Tag with 1-Click Copy */}
          <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-muted/80 border border-border/80 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-foreground">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Order ID: #{orderIdDisplay}</span>
              <button
                onClick={handleCopyOrderId}
                className="ml-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Copy Order ID"
                aria-label="Copy Order ID"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>

            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 border border-border/50 px-3 py-1.5 rounded-full">
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>

          {/* Action CTAs: Invoice Download (PDF) + Continue Shopping */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-[#b0842e] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              title="Download Official PDF Invoice"
            >
              <Download size={16} />
              <span>{locale === 'bn' ? 'ইনভয়েস ডাউনলোড (PDF)' : 'Invoice Download (PDF)'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs sm:text-sm font-bold transition active:scale-95"
            >
              <ShoppingBag size={15} />
              <span>{locale === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
            </Link>

            <Link
              href="/orders/track"
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-primary hover:bg-primary/5 rounded-xl text-xs sm:text-sm font-bold transition"
            >
              <Truck size={15} />
              <span>{locale === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN ORDER DETAILS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Ordered Items & Product Details (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Status & Delivery Estimation Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageCheck size={20} />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-black tracking-wider block">
                  {locale === 'bn' ? 'অর্ডারের অবস্থা' : 'Order Status'}
                </span>
                <span className="text-sm font-bold text-foreground capitalize">
                  {orderStatusDisplay}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-black tracking-wider block">
                  {locale === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isCOD
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {paymentStatusDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items List */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground font-serif flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary" />
                <span>{locale === 'bn' ? 'অর্ডারের পণ্যসমূহ' : 'Ordered Products'} ({items.length})</span>
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                Total: ৳{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {items.map((item: any, idx: number) => {
                const prod = item.product || {};
                const title = prod.title || prod.name || item.title || item.name || 'Product';
                const image = prod.productImages?.[0] || prod.image || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150';
                const unitPrice = Number(item.price) || Number(prod.salePrice) || Number(prod.price) || 0;
                const qty = Number(item.quantity) || 1;
                const itemTotal = unitPrice * qty;
                const color = item.selectedColor || item.color;
                const size = item.selectedSize || item.size;
                const sku = item.sku || prod.sku;

                return (
                  <div key={idx} className="py-3 sm:py-4 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted border border-border/80 overflow-hidden relative shrink-0">
                        <Image
                          src={image}
                          alt={title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-bold text-foreground text-xs sm:text-sm line-clamp-1 hover:text-primary transition">
                          {prod.slug ? (
                            <Link href={`/products/${prod.slug}`}>{title}</Link>
                          ) : (
                            <span>{title}</span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          {color && (
                            <span className="px-2 py-0.5 rounded bg-muted font-medium">
                              {locale === 'bn' ? `কালার: ${color}` : `Color: ${color}`}
                            </span>
                          )}
                          {size && (
                            <span className="px-2 py-0.5 rounded bg-muted font-medium">
                              {locale === 'bn' ? `সাইজ: ${size}` : `Size: ${size}`}
                            </span>
                          )}
                          {sku && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              SKU: {sku}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ৳{unitPrice.toLocaleString('en-IN')} × {qty}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-foreground font-mono text-sm sm:text-base">
                        ৳{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery Address Card */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-foreground font-serif flex items-center gap-2 border-b border-border/70 pb-2.5">
              <MapPin size={16} className="text-primary" />
              <span>{locale === 'bn' ? 'ডেলিভারি ঠিকানা ও গ্রাহক তথ্য' : 'Delivery Address & Recipient'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                  <User size={12} />
                  <span>{locale === 'bn' ? 'গ্রাহক' : 'Customer'}</span>
                </span>
                <p className="font-bold text-foreground text-sm">
                  {shippingAddress.recipientName || (locale === 'bn' ? 'সম্মানিত গ্রাহক' : 'Customer')}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Phone size={12} />
                  <span>{shippingAddress.recipientPhone || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-muted/40 border border-border/60 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                  <Truck size={12} />
                  <span>{locale === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Address'}</span>
                </span>
                <p className="font-bold text-foreground text-sm">
                  {formattedAddress.street || shippingAddress.addressLine || 'Address'}
                </p>
                <p className="text-muted-foreground">
                  {[formattedAddress.thana, formattedAddress.district || shippingAddress.district].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {order?.deliveryNotes && (
              <div className="text-xs bg-muted/30 border border-border/50 rounded-xl p-3 text-muted-foreground">
                <strong className="text-foreground">{locale === 'bn' ? 'ডেলিভারি নোট:' : 'Delivery Note:'}</strong>{' '}
                {order.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Price Calculation & Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-4 sticky top-20">
            <h2 className="text-sm font-bold text-foreground font-serif border-b border-border/70 pb-3">
              {locale === 'bn' ? 'অর্ডার হিসাব বিবরণী' : 'Order Summary'}
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{locale === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-bold text-foreground font-mono">৳{subTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>{locale === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                <span className="font-bold text-foreground font-mono">+৳{deliveryCharge.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{locale === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                  <span className="font-bold font-mono">-৳{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-border/70 pt-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-foreground">{locale === 'bn' ? 'সর্বমোট মূল্য' : 'Total Amount'}</span>
                <span className="font-extrabold text-foreground font-mono text-base">
                  ৳{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {advanceAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{locale === 'bn' ? 'অগ্রিম পরিশোধ' : 'Advance Paid'}</span>
                  <span className="font-bold font-mono">-৳{advanceAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[11px] font-bold text-foreground block">
                    {advanceAmount > 0
                      ? (locale === 'bn' ? 'বকেয়া ক্যাশ অন ডেলিভারি' : 'Due on Delivery (COD)')
                      : (locale === 'bn' ? 'ক্যাশ অন ডেলিভারিতে প্রদেয়' : 'Pay on Delivery (Full COD)')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {locale === 'bn' ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন' : 'Pay when you receive the parcel'}
                  </span>
                </div>
                <span className="text-base font-black text-primary font-mono">
                  ৳{(advanceAmount > 0 ? dueCOD : totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Invoice Download Button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownloadInvoice}
                className="w-full py-3 px-4 bg-primary hover:bg-[#b0842e] text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Download size={15} />
                <span>{locale === 'bn' ? 'ইনভয়েস ডাউনলোড (PDF)' : 'Download Invoice (PDF)'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>{locale === 'bn' ? 'প্রিন্ট করুন' : 'Print Order'}</span>
              </button>
            </div>

            {/* Help & Support Info */}
            <div className="pt-2 border-t border-border/70 text-center text-[11px] text-muted-foreground space-y-1">
              <p>{locale === 'bn' ? 'যেকোনো সহায়তায় কল করুন:' : 'For support or assistance:'}</p>
              <a
                href="tel:01620556299"
                className="font-bold text-foreground hover:text-primary transition font-mono block text-xs"
              >
                01620-556299
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
