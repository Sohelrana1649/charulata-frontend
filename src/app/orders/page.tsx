'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetOrderHistoryQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';
import { ClipboardList, Calendar, DollarSign, Package, MapPin, Loader2, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { downloadInvoicePdf } from '@/utils/invoicePdf';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: ordersResponse, isLoading } = useGetOrderHistoryQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawOrders = ordersResponse?.data || ordersResponse?.orders || ordersResponse;
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!mounted || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)] mr-2" />
        <span className="text-sm text-gray-400">Loading order history...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] max-w-md mx-auto">
        <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--brand)] border border-[var(--brand)]/20">
          <ClipboardList size={28} />
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)] font-serif mb-2">My Order History</h2>
        <p className="text-gray-400 text-sm mb-6">Please log in to check your order history and live delivery statuses.</p>
        <Link href="/login?redirect=orders" className="w-full bg-[var(--brand)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition text-center shadow-md shadow-amber-500/10">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)] mr-2" />
        <span className="text-sm text-gray-400">Loading order history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
      <div className="flex items-center space-x-2.5 mb-8">
        <ClipboardList className="text-[var(--brand)]" size={24} />
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] font-serif">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-400 text-sm">You have not placed any orders yet.</p>
          <Link href="/" className="mt-4 inline-flex items-center space-x-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition">
            <span>Shop Our Collection</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <div key={order._id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
                {/* Summary Header */}
                <div 
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-8 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Order ID</span>
                      <p className="font-mono text-xs sm:text-sm font-bold text-[var(--foreground)]">{order.orderId}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Date</span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total</span>
                      <p className="text-xs sm:text-sm font-extrabold text-[var(--brand)]">BDT {order.totalAmount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Items</span>
                      <p className="text-xs sm:text-sm font-semibold text-gray-400">
                        {order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      statusColors[order.deliveryStatus] || 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      {order.deliveryStatus}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] p-5 sm:p-6 bg-[var(--background)]/30 space-y-6">
                    {/* Header Details with Invoice download */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Details</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadInvoicePdf(order);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[#0B0F19] transition cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download Invoice PDF</span>
                      </button>
                    </div>

                    {/* Products details */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Items</h3>
                      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] overflow-hidden">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                            <div>
                               <p className="font-semibold text-[var(--foreground)]">{item.product?.title || 'Product'}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Qty: {item.quantity} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                              </p>
                            </div>
                            <span className="font-bold text-[var(--foreground)]">BDT {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping info */}
                      <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450 flex items-center space-x-1">
                          <MapPin size={14} className="text-[var(--brand)]" />
                          <span>Shipping Address</span>
                        </h4>
                        <div className="text-xs text-[var(--foreground)] space-y-1">
                          <p className="font-bold text-[var(--foreground)]">{order.shippingAddress?.recipientName}</p>
                          <p className="text-gray-400">Phone: {order.shippingAddress?.recipientPhone}</p>
                          <p className="text-gray-400">{order.shippingAddress?.addressLine}, {order.shippingAddress?.district}</p>
                          {order.deliveryNotes && (
                            <p className="text-gray-400 italic mt-2">Note: {order.deliveryNotes}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment info */}
                      <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450 flex items-center space-x-1">
                          <DollarSign size={14} className="text-[var(--brand)]" />
                          <span>Payment Information</span>
                        </h4>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Method</span>
                            <span className="font-semibold text-[var(--foreground)]">
                              {order.paymentMethod === 'bkash' ? 'bKash (Send Money)' : 
                               order.paymentMethod === 'nagad' ? 'Nagad (Send Money)' : 
                               order.paymentMethod === 'rocket' ? 'Rocket (Send Money)' : 
                               order.paymentMethod}
                            </span>
                          </div>
                          {order.paymentSenderNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sender Number</span>
                              <span className="font-semibold text-[var(--foreground)]">{order.paymentSenderNumber}</span>
                            </div>
                          )}
                          {order.transactionId && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Transaction ID</span>
                              <span className="font-mono font-semibold text-[var(--foreground)] uppercase">{order.transactionId}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-amber-500'}`}>{order.paymentStatus}</span>
                          </div>
                          
                          {(() => {
                            const advPaid = Number(order.advanceAmount || order.advancePayment || 0);
                            const dueCOD = Math.max(0, (order.totalAmount || 0) - advPaid);

                            if (advPaid > 0) {
                              return (
                                <>
                                  <div className="flex justify-between border-t border-[var(--border)] pt-1.5">
                                    <span className="text-gray-400">Total Order Value</span>
                                    <span className="font-semibold text-[var(--foreground)]">BDT {order.totalAmount}</span>
                                  </div>
                                  <div className="flex justify-between text-green-500 font-semibold">
                                    <span>Advance Paid ({order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ADVANCE'})</span>
                                    <span>- BDT {advPaid}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-dashed border-[var(--border)] pt-1.5 font-bold">
                                    <span className="text-[var(--foreground)]">Due COD Amount</span>
                                    <span className="text-[var(--brand)] font-bold">BDT {dueCOD}</span>
                                  </div>
                                </>
                              );
                            }

                            return (
                              <div className="flex justify-between border-t border-[var(--border)] pt-1.5 font-bold">
                                <span className="text-[var(--foreground)]">Total Bill Payable</span>
                                <span className="text-[var(--brand)] font-bold">BDT {order.totalAmount}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-4 flex items-center space-x-1">
                        <Package size={14} className="text-[var(--brand)]" />
                        <span>Delivery Timeline</span>
                      </h3>
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                        {order.timeline?.map((event: any, evIdx: number) => (
                          <div key={evIdx} className="relative">
                            <span className="absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border border-white dark:border-gray-950 bg-[var(--brand)] ring-4 ring-[var(--background)] flex items-center justify-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">{event.title}</p>
                              {event.description && <p className="text-[11px] text-gray-400 mt-0.5">{event.description}</p>}
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
          })}
        </div>
      )}
    </div>
  );
}
