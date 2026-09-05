'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  useGetLeadsQuery, 
  useDeleteLeadMutation,
  ILead 
} from '@/store/api/leadApi';
import { 
  Users, 
  Phone, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  MessageCircle, 
  AlertCircle, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Eye,
  X,
  Copy,
  Check
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-toastify';

export default function AdminLeadsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'false' | 'true'>('false'); // Default to "Not Converted" for quick follow-up
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when tab changes
  const handleTabChange = (tab: 'all' | 'false' | 'true') => {
    setActiveTab(tab);
    setPage(1);
  };

  const { data: leadsResponse, isLoading, isFetching, refetch } = useGetLeadsQuery({
    page,
    limit: 20,
    converted: activeTab === 'all' ? undefined : activeTab,
    search: debouncedSearch.trim() || undefined
  });

  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

  const leads = leadsResponse?.data?.leads || [];
  const pagination = leadsResponse?.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const stats = leadsResponse?.data?.stats || { totalLeads: 0, convertedCount: 0, unconvertedCount: 0, conversionRate: '0.0' };

  const handleDelete = async (id: string, phone: string) => {
    if (!window.confirm(`Are you sure you want to delete lead for ${phone}?`)) return;
    try {
      await deleteLead(id).unwrap();
      toast.success('Lead deleted successfully');
      if (selectedLead?._id === id) setSelectedLead(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete lead');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    toast.info('Phone number copied to clipboard');
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatWhatsAppUrl = (lead: ILead) => {
    const raw = (lead.phone || '').replace(/[\s\-]/g, '');
    let clean = raw;
    if (clean.startsWith('01')) {
      clean = `880${clean.slice(1)}`;
    } else if (!clean.startsWith('88')) {
      clean = `88${clean}`;
    }

    const customerName = lead.name ? ` ${lead.name}` : '';
    const cartSummary = lead.cartSnapshot?.length 
      ? `আপনার কার্টে থাকা "${lead.cartSnapshot.map(i => i.name).slice(0, 2).join(', ')}${lead.cartSnapshot.length > 2 ? '...' : ''}" পণ্যটি সম্পর্কে কোনো তথ্য বা অর্ডার কনফার্ম করতে কোনো সাহায্য প্রয়োজন কি?`
      : 'আপনার অর্ডারে কোনো সমস্যা বা সাহায্য প্রয়োজন কি?';

    const message = `আসসালামু আলাইকুম${customerName}, চারুলতা লাইফস্টাইল (Charulata Lifestyle) থেকে নক করছি। ${cartSummary} জানালে আমরা সাহায্য করতে পারি। ধন্যবাদ!`;

    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDays = Math.floor(diffHour / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Users className="text-primary w-6 h-6" />
            <span>Customer Leads & Abandoned Cart Recovery</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time captured checkout contact info for customer follow-up and conversion recovery.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Captured */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.totalLeads.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Captured from checkout</span>
          </div>
        </div>

        {/* Pending Follow-up (Unconverted) */}
        <div className="bg-card border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Needs Follow-up</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.unconvertedCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Dropped before ordering</span>
          </div>
        </div>

        {/* Converted Orders */}
        <div className="bg-card border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Converted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.convertedCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Placed an actual order</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {stats.conversionRate}%
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Lead to order ratio</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border shadow-2xs">
        {/* Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => handleTabChange('false')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'false'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>Follow-up Needed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'false' ? 'bg-black/20 text-white' : 'bg-background text-foreground'
            }`}>
              {stats.unconvertedCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>All Leads</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'all' ? 'bg-black/20 text-white' : 'bg-background text-foreground'
            }`}>
              {stats.totalLeads}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('true')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'true'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>Converted</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'true' ? 'bg-black/20 text-white' : 'bg-background text-foreground'
            }`}>
              {stats.convertedCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Loading customer leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <Users className="w-12 h-12 opacity-30" />
            <p className="text-sm font-bold text-foreground">No leads found</p>
            <p className="text-xs text-muted-foreground max-w-sm text-center">
              {debouncedSearch 
                ? 'No leads matching your search query. Try clearing the search.'
                : activeTab === 'false'
                ? 'Great job! There are currently no pending unconverted leads.'
                : 'As soon as visitors enter their mobile number in checkout, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">WhatsApp Action</th>
                  <th className="py-3 px-4">Cart Snapshot</th>
                  <th className="py-3 px-4">Captured At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Linked Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leads.map((lead) => {
                  const itemsCount = lead.cartSnapshot?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                  const firstItem = lead.cartSnapshot?.[0];

                  return (
                    <tr 
                      key={lead._id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-[13px]">
                            {lead.name?.trim() || <span className="text-muted-foreground italic font-normal">Anonymous Customer</span>}
                          </p>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {lead.phone}
                            </span>
                            <button
                              onClick={() => copyToClipboard(lead.phone)}
                              className="text-muted-foreground hover:text-foreground transition p-0.5"
                              title="Copy phone number"
                            >
                              {copiedPhone === lead.phone ? (
                                <Check size={12} className="text-emerald-500 stroke-[3]" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp Quick Action Button */}
                      <td className="py-3.5 px-4">
                        <a
                          href={formatWhatsAppUrl(lead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 group/wa"
                          title="Open direct WhatsApp chat with this customer"
                        >
                          <MessageCircle size={14} className="fill-current" />
                          <span>WhatsApp</span>
                          <ExternalLink size={11} className="opacity-60 group-hover/wa:opacity-100" />
                        </a>
                      </td>

                      {/* Cart Snapshot */}
                      <td className="py-3.5 px-4">
                        {lead.cartSnapshot && lead.cartSnapshot.length > 0 ? (
                          <div 
                            onClick={() => setSelectedLead(lead)}
                            className="cursor-pointer group/cart inline-block"
                          >
                            <div className="flex items-center gap-2">
                              {firstItem?.image && (
                                <div className="w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 bg-muted">
                                  <SafeImage
                                    src={firstItem.image}
                                    alt={firstItem.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-foreground text-xs group-hover/cart:text-primary transition line-clamp-1 max-w-[200px]">
                                  {firstItem?.name}
                                  {lead.cartSnapshot.length > 1 && (
                                    <span className="text-muted-foreground font-normal text-[11px] ml-1">
                                      +{lead.cartSnapshot.length - 1} more
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-medium">
                                  {itemsCount} item{itemsCount > 1 ? 's' : ''} • <span className="text-primary font-bold">৳{(lead.cartTotal || 0).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">No cart snapshot</span>
                        )}
                      </td>

                      {/* Timestamps */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-foreground text-xs">
                            {formatTimeAgo(lead.updatedAt || lead.capturedAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(lead.capturedAt).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.converted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} className="stroke-[3]" />
                            <span>Converted</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock size={12} />
                            <span>Follow-up Needed</span>
                          </span>
                        )}
                      </td>

                      {/* Linked Order */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.converted && lead.orderId ? (
                          <Link
                            href={`/admin/orders?search=${lead.orderId.orderId || lead.orderId._id}`}
                            className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline"
                            title="View order in Admin"
                          >
                            <span>#{lead.orderId.orderId}</span>
                            <ExternalLink size={12} />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground text-[11px] font-medium">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {lead.cartSnapshot && lead.cartSnapshot.length > 0 && (
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition"
                              title="View cart snapshot items"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(lead._id, lead.phone)}
                            disabled={isDeleting}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete lead"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-muted-foreground">
              Showing page <strong className="text-foreground">{pagination.page}</strong> of <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} leads)
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Snapshot Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
                  <ShoppingCart className="text-primary w-4 h-4" />
                  <span>Cart Snapshot Details</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedLead.name || 'Anonymous'} • {selectedLead.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar">
              {selectedLead.cartSnapshot?.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/20"
                >
                  {item.image ? (
                    <div className="w-12 h-12 rounded-lg border border-border overflow-hidden shrink-0 bg-card">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground text-xs line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                      {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                      <span>Qty: <strong>{item.quantity}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-foreground font-mono">
                      ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ৳{item.price} each
                    </p>
                  </div>
                </div>
              ))}

              {/* Total Summary */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs sm:text-sm font-bold">
                <span>Estimated Cart Total:</span>
                <span className="text-base font-black text-primary font-mono">
                  ৳{(selectedLead.cartTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <a
                href={formatWhatsAppUrl(selectedLead)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition shadow-sm active:scale-95"
              >
                <MessageCircle size={16} className="fill-current" />
                <span>Open WhatsApp Follow-up</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
