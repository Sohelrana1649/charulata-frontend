'use client';

import React, { useState } from 'react';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation
} from '@/store/api/adminApi';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Ticket, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRole } from '@/hooks/useRole';
import RoleGuard from '@/components/admin/RoleGuard';

const MAX_DISCOUNT = Number(process.env.NEXT_PUBLIC_MAX_DISCOUNT) || 25;

interface CouponForm {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  expiryDate: string;
  usageLimit: number;
  isActive: boolean;
}

const initialForm: CouponForm = {
  code: '',
  discountType: 'percentage',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  expiryDate: '',
  isActive: true,
  usageLimit: 100
};

export default function AdminCouponsPage() {
  const { isSuperAdmin } = useRole();
  const { data: couponsRes, isLoading, refetch } = useGetCouponsQuery({});
  
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(initialForm);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = couponsRes?.data?.coupons || couponsRes?.data || couponsRes?.coupons || [];

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: any) => {
    setEditId(coupon._id);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().substring(0, 10) : '',
      usageLimit: coupon.usageLimit || 0,
      isActive: coupon.isActive !== undefined ? !!coupon.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied coupon code ${code}!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.expiryDate) {
      toast.error('Expiry date is required.');
      return;
    }
    if (form.discountType === 'percentage' && Number(form.discountValue) > MAX_DISCOUNT) {
      toast.error(`ডিসকাউন্ট শতকরা সর্বোচ্চ ${MAX_DISCOUNT}% হতে পারে (Max Discount Cap: ${MAX_DISCOUNT}%)`);
      return;
    }
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined
    };

    try {
      if (editId) {
        await updateCoupon({ id: editId, couponData: payload }).unwrap();
        toast.success('Coupon updated successfully!');
      } else {
        await createCoupon(payload).unwrap();
        toast.success('Coupon created successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin কুপন ডিলিট করতে পারবেন');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this coupon code?')) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success('Coupon deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete coupon.');
    }
  };

  const filteredCoupons = coupons.filter((c: any) => {
    const matchesSearch = c.code?.toLowerCase().includes(search.toLowerCase().trim());
    const isCurrentlyActive = c.isActive && new Date(c.expiryDate) > new Date();

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return isCurrentlyActive;
    if (statusFilter === 'expired') return !isCurrentlyActive;
    return true;
  });

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalCoupons = coupons.length;
  const activeCount = coupons.filter((c: any) => c.isActive && new Date(c.expiryDate) > new Date()).length;
  const expiredCount = totalCoupons - activeCount;

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Coupons & Promo Codes</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalCoupons} Active
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Create discount vouchers, percentage off deals, usage caps, and expiration limits.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Summary Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Coupons</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalCoupons}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Ticket size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Active Deals</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">{activeCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Expired / Inactive</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 font-serif">{expiredCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search by promo code (e.g. EID2026, SUMMER50)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 pl-10 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="bg-muted/60 border border-border text-foreground rounded-xl px-3.5 py-2 text-xs font-semibold focus:border-primary focus:outline-none cursor-pointer"
        >
          <option value="all">All Coupons</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired Only</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Promo Code</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Discount Rate</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Min Spend</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Max Cap</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Expiry Date</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Usage Count</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-muted-foreground">
                    <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                    <span>Loading coupon rules...</span>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    No coupons match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedCoupons.map((coupon: any) => {
                  const isCurrentlyActive = coupon.isActive && new Date(coupon.expiryDate) > new Date();

                  return (
                    <tr key={coupon._id} className="hover:bg-muted/30 transition">
                      
                      {/* Code */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 text-muted-foreground hover:text-primary transition cursor-pointer"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Discount Rate */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-extrabold text-foreground text-sm">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `৳${coupon.discountValue} OFF`}
                      </td>

                      {/* Min Order */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-medium">
                        ৳{(coupon.minOrderAmount || 0).toLocaleString()}
                      </td>

                      {/* Max Cap */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-medium">
                        {coupon.maxDiscountAmount ? `৳${coupon.maxDiscountAmount.toLocaleString()}` : 'No limit'}
                      </td>

                      {/* Expiry */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry'}
                      </td>

                      {/* Usage */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-extrabold">
                        {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isCurrentlyActive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {isCurrentlyActive ? 'Active' : 'Expired'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit3 size={14} />
                          </button>
                          <RoleGuard allowedRoles={['super_admin']}>
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                          </RoleGuard>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm text-center sm:text-left min-w-0 w-full">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Showing {paginatedCoupons.length} of {filteredCoupons.length} coupons · Page {page} of {totalPages}
          </p>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-foreground bg-muted border border-border rounded-xl hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pg = startPage + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 text-[11px] sm:text-xs font-bold rounded-xl border transition cursor-pointer ${
                    page === pg
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'text-foreground bg-muted border border-border hover:bg-primary hover:text-white'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-foreground bg-muted border border-border rounded-xl hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground font-serif">
                  {editId ? 'Edit Coupon Code' : 'Create New Coupon'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set promo code name, discount rate, and validity
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026 or CHARU10"
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono uppercase tracking-wider placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e: any) => setForm(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={form.discountType === 'percentage' ? '15 (% off)' : '500 (৳ off)'}
                    value={form.discountValue}
                    onChange={(e) => setForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Min Spend & Max Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Min Order Spend (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Max Cap (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional max limit"
                    value={form.maxDiscountAmount || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, maxDiscountAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Expiry Date & Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Max Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={form.usageLimit || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, usageLimit: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">Active (Usable in Checkout)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Check size={15} />
                  )}
                  <span>{editId ? 'Update Coupon' : 'Save Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
