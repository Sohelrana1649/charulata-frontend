'use client';

import React, { useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation
} from '@/store/api/adminApi';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  Eye, 
  Info,
  Calendar,
  AlertTriangle,
  X,
  ShoppingCart,
  Users,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminNotificationsPage() {
  const { data: notifRes, isLoading, refetch } = useGetNotificationsQuery({});
  const [markRead, { isLoading: isMarking }] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [deleteNotif, { isLoading: isDeleting }] = useDeleteNotificationMutation();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const notificationsResponse = notifRes?.data?.notifications || notifRes?.data || notifRes?.notifications || [];
  const notifications = Array.isArray(notificationsResponse) ? notificationsResponse : [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const totalCount = notifications.length;

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({}).unwrap();
      toast.success('All notifications marked as read!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotif(id).unwrap();
      toast.success('Notification deleted!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete notification');
    }
  };

  const handleOpenNotification = (notif: any) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      handleMarkRead(notif._id);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'NewOrder':
        return {
          bg: 'bg-primary/10 text-primary border-primary/20',
          icon: <ShoppingCart size={18} />,
          label: 'New Order'
        };
      case 'StockAlert':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          icon: <AlertTriangle size={18} />,
          label: 'Stock Alert'
        };
      case 'UserActivity':
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: <Users size={18} />,
          label: 'User Activity'
        };
      default:
        return {
          bg: 'bg-muted text-muted-foreground border-border',
          icon: <Bell size={18} />,
          label: 'System Notification'
        };
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">System Notifications</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {unreadCount} Unread
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Real-time store operation alerts, order notifications, stock warnings, and user activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-xl text-[10px] sm:text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md shrink-0"
          >
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Alerts</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Bell size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Unread Alerts</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 font-serif">{unreadCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Read History</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">{totalCount - unreadCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="animate-spin text-primary h-8 w-8 mr-2" />
          <span className="text-sm text-muted-foreground font-medium">Loading notifications feed...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm space-y-3">
          <Info className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-bold text-foreground">No notification alerts right now</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            New customer orders, inventory stock warnings, and queries will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
          {paginatedNotifications.map((notif: any) => {
            const config = getTypeConfig(notif.type);
            return (
              <div 
                key={notif._id} 
                onClick={() => handleOpenNotification(notif)}
                className={`p-4.5 flex items-center justify-between gap-4 transition duration-200 cursor-pointer hover:bg-muted/40 ${
                  notif.isRead ? 'bg-transparent' : 'bg-primary/5'
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`p-3 rounded-2xl border shrink-0 ${config.bg}`}>
                    {config.icon}
                  </div>
                  
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-bold truncate ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 bg-primary rounded-full shrink-0 animate-pulse" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed truncate max-w-2xl">
                      {notif.message}
                    </p>

                    <p className="text-[10px] text-muted-foreground flex items-center pt-0.5">
                      <Calendar size={11} className="mr-1" />
                      {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenNotification(notif)}
                    className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      disabled={isMarking}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-500/20 transition cursor-pointer"
                      title="Mark as Read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif._id)}
                    disabled={isDeleting}
                    className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm text-center sm:text-left min-w-0 w-full">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Showing {paginatedNotifications.length} of {notifications.length} alerts · Page {page} of {totalPages}
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

      {/* Notification Modal Details */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in" onClick={() => setSelectedNotification(null)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-2xl border shrink-0 ${getTypeConfig(selectedNotification.type).bg}`}>
                  {getTypeConfig(selectedNotification.type).icon}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    {getTypeConfig(selectedNotification.type).label}
                  </span>
                  <h3 className="text-base font-bold text-foreground font-serif leading-tight mt-0.5">
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setSelectedNotification(null)} 
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Body */}
            <div className="bg-muted/50 border border-border/60 rounded-2xl p-4">
              <p className="text-xs text-foreground leading-relaxed">
                {selectedNotification.message}
              </p>
            </div>

            {/* Metadata key value list */}
            {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Notification Details</p>
                <div className="bg-muted/50 border border-border/60 rounded-2xl p-3.5 space-y-2">
                  {Object.entries(selectedNotification.metadata).map(([key, val]: [string, any]) => {
                    if (typeof val === 'object') return null;
                    return (
                      <div key={key} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-extrabold text-foreground font-mono">
                          {key === 'totalAmount' ? `৳${val.toLocaleString()}` : String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="border-t border-border pt-4 flex items-center justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
