'use client';

import React, { useState } from 'react';
import {
  useGetReviewsQuery,
  useModerateReviewMutation,
  useDeleteReviewMutation,
  useBulkReviewActionMutation
} from '@/store/api/adminApi';
import { 
  Check, 
  X, 
  Trash2, 
  Loader2, 
  Star, 
  Search,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ThumbsUp,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminReviewsPage() {
  const { data: reviewsRes, isLoading, refetch } = useGetReviewsQuery({});
  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [bulkReviewAction, { isLoading: isBulking }] = useBulkReviewActionMutation();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [search, statusFilter]);

  const reviews = reviewsRes?.data?.reviews || reviewsRes?.data || reviewsRes?.reviews || [];

  const handleModerate = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await moderateReview({ id, status }).unwrap();
      toast.success(`Review successfully ${status.toLowerCase()}!`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to moderate review.');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModalId(id);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    try {
      await deleteReview(deleteModalId).unwrap();
      toast.success('Review deleted successfully!');
      setDeleteModalId(null);
      setSelectedIds(prev => prev.filter(i => i !== deleteModalId));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete review.');
    }
  };

  const filteredReviews = reviews.filter((rev: any) => {
    const matchesSearch = 
      (rev.customer?.name || '').toLowerCase().includes(search.toLowerCase().trim()) ||
      (rev.product?.title || '').toLowerCase().includes(search.toLowerCase().trim()) ||
      (rev.comment || '').toLowerCase().includes(search.toLowerCase().trim());
    
    const matchesStatus = statusFilter === 'All' || rev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const isAllSelected = paginatedReviews.length > 0 && paginatedReviews.every((r: any) => selectedIds.includes(r._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = paginatedReviews.map((r: any) => r._id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedReviews.map((r: any) => r._id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected review(s)?`)) {
        return;
      }
    }

    try {
      const res = await bulkReviewAction({ ids: selectedIds, action }).unwrap();
      toast.success(res?.data?.message || `Bulk ${action} completed successfully!`);
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to perform bulk action.');
    }
  };

  const ratingStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={13} 
            className={i < rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'} 
          />
        ))}
        <span className="text-xs font-bold text-foreground ml-1.5">{rating}.0</span>
      </div>
    );
  };

  const statusBadges: Record<string, string> = {
    Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r: any) => r.status === 'Approved').length;
  const pendingCount = reviews.filter((r: any) => r.status === 'Pending').length;

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Customer Reviews</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalReviews} Total
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Moderate product reviews, batch approve or reject feedback, inspect customer ratings and comments.
          </p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Reviews</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalReviews}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Approved Reviews</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">{approvedCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Pending Moderation</p>
            <p className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1 font-serif">{pendingCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search by customer name, product title, or comment text..."
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
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-muted/60 border border-border text-foreground rounded-xl px-3 py-2 text-xs font-semibold focus:border-primary focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Bulk Action Bar Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="bg-primary text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-bold text-foreground">
              Choose bulk action for selected reviews:
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={isBulking}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isBulking ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>Bulk Approve</span>
            </button>

            <button
              onClick={() => handleBulkAction('reject')}
              disabled={isBulking}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-600 hover:text-white rounded-xl border border-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isBulking ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={14} />}
              <span>Bulk Reject</span>
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isBulking}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isBulking ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
              <span>Bulk Delete</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted"
              title="Clear Selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded accent-primary cursor-pointer w-4 h-4"
                    title="Select All Reviews on Page"
                  />
                </th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Customer</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Product Title</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Rating</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Submitted Date</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-muted-foreground">
                    <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                    <span>Loading customer reviews...</span>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    No reviews match your search filter.
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((rev: any) => {
                  const isSelected = selectedIds.includes(rev._id);

                  return (
                    <tr key={rev._id} className={`transition ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'}`}>
                      
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(rev._id)}
                          className="rounded accent-primary cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground font-serif text-sm">{rev.customer?.name || 'Anonymous Customer'}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{rev.customer?.email || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className="font-bold text-foreground truncate max-w-xs block text-xs">{rev.product?.title || 'Product Item'}</span>
                      </td>

                      {/* Rating & Review */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 max-w-sm whitespace-normal">
                        {ratingStars(rev.rating || 5)}
                        <p className="text-muted-foreground text-xs mt-1 leading-snug line-clamp-2">{rev.comment}</p>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadges[rev.status] || 'bg-muted text-muted-foreground border-border'}`}>
                          {rev.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {rev.status !== 'Approved' && (
                            <button
                              onClick={() => handleModerate(rev._id, 'Approved')}
                              disabled={isModerating}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/20 transition cursor-pointer"
                              title="Approve Review"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                          )}

                          {rev.status !== 'Rejected' && (
                            <button
                              onClick={() => handleModerate(rev._id, 'Rejected')}
                              disabled={isModerating}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-600 hover:text-white rounded-lg border border-amber-500/20 transition cursor-pointer"
                              title="Reject Review"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(rev._id)}
                            disabled={isDeleting}
                            className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
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
            Showing {paginatedReviews.length} of {filteredReviews.length} reviews · Page {page} of {totalPages}
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

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif">
                Delete Customer Review?
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Are you sure you want to permanently delete this customer feedback? Rating metrics will be updated.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
