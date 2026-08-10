'use client';

import React, { useState } from 'react';
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useBulkUpdateOrderStatusMutation,
} from '@/store/api/adminApi';
import {
  Loader2,
  Search,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  X,
  FileText,
  ShoppingBag,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  TrendingUp,
  Check,
  Copy,
  Printer,
  User,
  Phone,
  MapPin,
  CreditCard,
  Tag,
  Package,
  Truck,
  Calendar,
  AlertCircle,
  Mail,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
const ORDER_STEPS = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  const { data: ordersResponse, isLoading, refetch } = useGetAdminOrdersQuery({
    status: activeTab,
    search: searchQuery,
    page,
    limit: 50
  });
  
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] = useBulkUpdateOrderStatusMutation();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<any>(null);

  const allOrders = ordersResponse?.data?.orders || ordersResponse?.orders || ordersResponse?.data || [];
  const orders = Array.isArray(allOrders) ? allOrders : [];
  const totalOrders = ordersResponse?.total || ordersResponse?.data?.total || orders.length;
  const totalPages = ordersResponse?.pages || ordersResponse?.data?.pages || 1;

  const filteredOrders = orders;

  const isAllSelected = filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o: any) => o._id));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBulkUpdateStatus = async (targetStatus: string) => {
    if (selectedOrderIds.length === 0) return;
    try {
      const res = await bulkUpdateStatus({
        orderIds: selectedOrderIds,
        status: targetStatus
      }).unwrap();
      
      const count = res.data?.updatedCount || selectedOrderIds.length;
      toast.success(`${count} order(s) updated to ${targetStatus}!`);
      setSelectedOrderIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update selected orders');
    }
  };

  const awaitingCount = orders.filter((o: any) => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled').length;
  const deliveredCount = orders.filter((o: any) => o.deliveryStatus === 'Delivered').length;
  const totalRevenue = orders
    .filter((o: any) => o.deliveryStatus !== 'Cancelled')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handlePrintInvoice = (order: any) => {
    if (!order) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      toast.error('Could not open print window. Please allow popups.');
      return;
    }

    const recipientName = order.shippingAddress?.recipientName || order.customer?.name || 'Guest Customer';
    const recipientPhone = order.shippingAddress?.recipientPhone || order.customer?.phone || 'N/A';
    const address = `${order.shippingAddress?.addressLine || ''}, ${order.shippingAddress?.district || ''}`;
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';

    const itemsHtml = (order.items || []).map((item: any, idx: number) => {
      const title = item.product?.title || `Product Item #${idx + 1}`;
      const sku = item.product?.sku ? `SKU: ${item.product.sku}` : '';
      const size = item.selectedSize || item.size || '-';
      const color = item.selectedColor || item.color || '-';
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const total = price * qty;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #0f172a;">${title}</strong>
            ${sku ? `<br><span style="font-size: 11px; color: #64748b;">${sku}</span>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">
              ${size}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            <span style="background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; font-size: 11px;">
              ${color}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">
            ${qty}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            ৳${price.toLocaleString()}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #0f172a;">
            ৳${total.toLocaleString()}
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderId || 'Order'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 35px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 25px; }
            .logo { font-size: 26px; font-weight: 900; color: #e11d48; letter-spacing: 1px; font-family: Georgia, serif; }
            .tagline { font-size: 11px; color: #64748b; margin-top: 3px; font-weight: 500; }
            .meta { text-align: right; font-size: 12px; color: #64748b; }
            .meta-id { font-size: 18px; font-weight: 800; color: #e11d48; margin-top: 3px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; font-size: 13px; }
            .card-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .totals { margin-left: auto; width: 320px; font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { border-top: 2px solid #e11d48; font-size: 16px; font-weight: 800; color: #e11d48; padding-top: 10px; margin-top: 6px; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 18px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">CHARULATA LIFESTYLE</div>
              <div class="tagline">Premium Bangladeshi Heritage & Contemporary Fashion</div>
            </div>
            <div class="meta">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">OFFICIAL INVOICE</div>
              <div class="meta-id">${order.orderId || 'CL-ORDER'}</div>
              <div>Date: ${dateStr}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Customer & Delivery Info</div>
              <strong style="font-size: 14px; color: #0f172a;">${recipientName}</strong><br>
              <strong>Phone:</strong> ${recipientPhone}<br>
              ${order.customer?.email ? `<strong>Email:</strong> ${order.customer.email}<br>` : ''}
              <strong>Address:</strong> ${address}<br>
              ${order.deliveryNotes ? `<div style="margin-top:8px; padding:6px 10px; background:#fef3c7; color:#92400e; border-radius:6px; font-size:11px;"><strong>Delivery Note:</strong> ${order.deliveryNotes}</div>` : ''}
            </div>

            <div class="card">
              <div class="card-title">Payment & Status</div>
              <strong>Payment Method:</strong> ${(order.paymentMethod || 'COD').toUpperCase()}<br>
              <strong>Payment Status:</strong> ${order.paymentStatus || 'Pending'}<br>
              ${order.paymentSenderNumber ? `<strong>Sender Number:</strong> ${order.paymentSenderNumber}<br>` : ''}
              ${order.transactionId ? `<strong>TrxID:</strong> <span style="font-family:monospace; font-weight:bold; color:#e11d48;">${order.transactionId}</span><br>` : ''}
              <strong>Delivery Status:</strong> <span style="text-transform:uppercase; font-weight:bold; color:#2563eb;">${order.deliveryStatus || 'Pending'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Size</th>
                <th style="text-align: center;">Color</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span> <span>৳${(order.subTotal || 0).toLocaleString()}</span></div>
            <div><span>Shipping Charge:</span> <span>৳${(order.shippingCharge || 0).toLocaleString()}</span></div>
            ${order.discount ? `<div style="color:#10b981;"><span>Coupon Discount:</span> <span>-৳${order.discount.toLocaleString()}</span></div>` : ''}
            <div><span>Total Order Value:</span> <span>৳${(order.totalAmount || 0).toLocaleString()}</span></div>
            ${Number(order.advanceAmount || order.advancePayment || 0) > 0 ? `
              <div style="color:#10b981; font-weight: bold;">
                <span>Advance Paid (${(order.paymentMethod || 'BKASH').toUpperCase()}):</span> 
                <span>-৳${Number(order.advanceAmount || order.advancePayment).toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="grand-total">
              <span>${Number(order.advanceAmount || order.advancePayment || 0) > 0 ? 'Net Cash on Delivery (Due COD):' : 'Total Bill Payable:'}</span>
              <span>৳${Math.max(0, (order.totalAmount || 0) - Number(order.advanceAmount || order.advancePayment || 0)).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping with Charulata Lifestyle! For support or inquiries, email info@charulata.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = (ordersList: any[]) => {
    if (!ordersList || ordersList.length === 0) {
      toast.warning('No orders to export');
      return;
    }
    
    const escapeCsvCell = (val: any) => {
      const str = String(val === null || val === undefined ? '' : val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Order ID', 'Customer Name', 'Recipient Phone', 'Address', 'Date', 'Items Summary', 'Total (BDT)', 'Payment', 'Status'];
    const rows = ordersList.map(order => {
      const itemsSummary = (order.items || []).map((i: any) => 
        `${i.product?.title || 'Item'} (Size: ${i.selectedSize || i.size || '-'}, Qty: ${i.quantity || 1})`
      ).join('; ');

      return [
        escapeCsvCell(order.orderId),
        escapeCsvCell(order.shippingAddress?.recipientName || order.customer?.name || 'Guest'),
        escapeCsvCell(order.shippingAddress?.recipientPhone || 'N/A'),
        escapeCsvCell(`${order.shippingAddress?.addressLine || ''}, ${order.shippingAddress?.district || ''}`),
        escapeCsvCell(new Date(order.createdAt).toLocaleDateString()),
        escapeCsvCell(itemsSummary),
        escapeCsvCell(order.totalAmount),
        escapeCsvCell(order.paymentMethod || 'COD'),
        escapeCsvCell(order.deliveryStatus)
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  const handleExportPDF = (ordersList: any[]) => {
    if (!ordersList || ordersList.length === 0) {
      toast.warning('No orders to export');
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups to export PDF report.');
        return;
      }

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Charulata Orders Report</title>
  <style>
    body { font-family: sans-serif; padding: 25px; color: #0f172a; }
    h1 { color: #800020; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 12px; }
    th { background: #800020; color: #fff; }
  </style>
</head>
<body>
  <h1>Charulata Lifestyle - Orders Executive Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()} | <strong>Total Orders:</strong> ${ordersList.length}</p>
  <table>
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Phone</th>
        <th>Date</th>
        <th>Items & Sizes</th>
        <th>Total</th>
        <th>Payment</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${ordersList.map(order => {
        const itemsSummary = (order.items || []).map((i: any) => 
          `${i.product?.title || 'Item'} (${i.selectedSize || i.size || 'M'}, x${i.quantity || 1})`
        ).join(', ');
        return `
          <tr>
            <td>${order.orderId}</td>
            <td>${order.shippingAddress?.recipientName || order.customer?.name || 'Guest'}</td>
            <td>${order.shippingAddress?.recipientPhone || 'N/A'}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>${itemsSummary}</td>
            <td>BDT ${(order.totalAmount || 0).toLocaleString()}</td>
            <td>${order.paymentMethod || 'COD'}</td>
            <td>${order.deliveryStatus}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success('Report generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      setStatusModalOrder(null);
      refetch();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const statusColors: Record<string, string> = {
    Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Processing: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    Packed: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Shipped: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      
      {/* Top Banner Header */}
      <div className="bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xs space-y-3 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif tracking-tight flex items-center gap-2">
              Orders Management
              <span className="bg-primary/10 text-primary text-xs font-black px-2.5 py-0.5 rounded-full border border-primary/20">
                {totalOrders} Total
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Easily view customer details, items, sizes, quantities, and update order statuses.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExportCSV(orders)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 group"
              title="Download orders list as Excel CSV spreadsheet"
            >
              <FileSpreadsheet size={15} className="group-hover:scale-110 transition-transform" />
              <span>Export CSV</span>
            </button>
            
            <button
              onClick={() => handleExportPDF(orders)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 group"
              title="Generate printable PDF orders report"
            >
              <FileText size={15} className="group-hover:scale-110 transition-transform" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-extrabold uppercase tracking-wider truncate">Total Orders</p>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <ShoppingBag size={15} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-foreground mt-1.5 font-serif truncate">{totalOrders}</p>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-extrabold uppercase tracking-wider truncate">Sales Revenue</p>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <TrendingUp size={15} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-primary mt-1.5 font-serif truncate">৳{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-extrabold uppercase tracking-wider truncate">Pending / Active</p>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Clock size={15} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5 font-serif truncate">{awaitingCount}</p>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-extrabold uppercase tracking-wider truncate">Delivered</p>
            <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 font-serif truncate">{deliveredCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 bg-card border border-border p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs min-w-0 w-full overflow-hidden">
        {/* Horizontal Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted-foreground bg-muted/60 hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, District..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 pl-9 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Glassmorphic Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="sticky top-20 z-40 w-full bg-card/95 dark:bg-card/90 backdrop-blur-xl border-2 border-primary/40 rounded-2xl p-3 sm:p-4 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Selection info */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-black shadow-xs">
                <span>✓</span>
                <span>{selectedOrderIds.length} {selectedOrderIds.length === 1 ? 'Order' : 'Orders'} Selected</span>
              </span>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="text-xs text-muted-foreground hover:text-foreground font-bold hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>

            {/* Quick Bulk Action Buttons with Lucide Icons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-muted-foreground mr-1 hidden lg:inline">Bulk Status:</span>
              
              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Confirmed')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>Confirm</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Processing')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <Clock size={14} />
                <span>Processing</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Packed')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-600 hover:text-white border border-purple-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <Package size={14} />
                <span>Packed</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Shipped')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500 text-pink-600 hover:text-white border border-pink-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <Truck size={14} />
                <span>Shipped</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Delivered')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <CheckCheck size={14} />
                <span>Deliver</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkUpdateStatus('Cancelled')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
              >
                <XCircle size={14} />
                <span>Cancel</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile & Compact Card View (Visible on Mobile < 768px) */}
      <div className="block md:hidden space-y-3 w-full">
        {isLoading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
            <span className="text-xs font-bold">Loading store orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-xs font-bold">
            No orders match your filter criteria.
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const recipientName = order.shippingAddress?.recipientName || order.customer?.name || 'Guest Customer';
            const recipientPhone = order.shippingAddress?.recipientPhone || order.customer?.phone || 'N/A';
            const district = order.shippingAddress?.district || '';
            const addressLine = order.shippingAddress?.addressLine || '';
            const total = order.totalAmount || 0;
            const orderId = order.orderId || `#${order._id?.slice(-8)}`;
            const orderStatus = order.deliveryStatus || 'Pending';
            const items = order.items || [];

            return (
              <div key={order._id} className={`bg-card border rounded-2xl p-4 shadow-xs space-y-3 min-w-0 w-full overflow-hidden transition ${selectedOrderIds.includes(order._id) ? 'border-primary bg-primary/5' : 'border-border'}`}>
                
                {/* Header: Order ID & Checkbox & Status Dropdown */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/80 min-w-0">
                  <div className="flex items-center space-x-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order._id)}
                      onChange={() => handleToggleSelectOrder(order._id)}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer shrink-0"
                    />
                    <span className="font-mono font-black text-primary text-xs truncate">
                      {orderId}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(orderId, 'Order ID')}
                      className="text-muted-foreground hover:text-primary transition p-1"
                      title="Copy Order ID"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setStatusModalOrder(order)}
                    className={`inline-flex items-center space-x-1 border rounded-full px-2.5 py-0.5 text-[10px] font-black cursor-pointer hover:opacity-80 transition shrink-0 ${statusColors[orderStatus] || 'bg-muted text-muted-foreground border-border'}`}
                  >
                    <span>{orderStatus}</span>
                    <ChevronDown size={10} />
                  </button>
                </div>

                {/* Recipient Details */}
                <div className="bg-muted/40 border border-border/60 p-2.5 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-foreground truncate">
                      <User size={12} className="text-primary shrink-0" />
                      <span className="truncate">{recipientName}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground font-mono text-[11px] shrink-0">
                      <Phone size={11} className="text-muted-foreground" />
                      <span>{recipientPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-1 text-[11px] text-muted-foreground pt-0.5">
                    <MapPin size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{addressLine}{district ? `, ${district}` : ''}</span>
                  </div>

                  {order.deliveryNotes && (
                    <div className="mt-1.5 p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] flex items-center gap-1 font-medium">
                      <AlertCircle size={12} className="shrink-0" />
                      <span className="truncate">Note: {order.deliveryNotes}</span>
                    </div>
                  )}
                </div>

                {/* Ordered Items Preview Cards */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                    Ordered Items ({items.length})
                  </p>
                  <div className="space-y-1.5">
                    {items.map((item: any, idx: number) => {
                      const itemTitle = item.product?.title || `Item #${idx + 1}`;
                      const itemImg = item.product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                      const size = item.selectedSize || item.size;
                      const color = item.selectedColor || item.color;
                      const qty = item.quantity || 1;

                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 border border-border/40 rounded-xl gap-2 min-w-0">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-muted border border-border overflow-hidden relative shrink-0">
                              <Image src={itemImg} alt={itemTitle} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{itemTitle}</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {size && (
                                  <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[9px] font-black rounded border border-primary/20">
                                    Size: {size}
                                  </span>
                                )}
                                {color && (
                                  <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded border border-blue-500/20">
                                    {color}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 bg-muted text-foreground text-[9px] font-black rounded border border-border">
                                  Qty: {qty}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-xs font-extrabold text-foreground">৳{((item.price || 0) * qty).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions & Bill Summary */}
                <div className="flex items-center justify-between pt-2.5 border-t border-border/80 text-xs gap-2">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider block">Total Bill</span>
                    <span className="font-black text-primary text-sm">৳{total.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-xl border border-border transition text-xs font-bold cursor-pointer shadow-2xs"
                    >
                      <Eye size={12} />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => handlePrintInvoice(order)}
                      className="inline-flex items-center space-x-1 px-2 py-1.5 text-muted-foreground hover:text-foreground bg-muted rounded-xl border border-border transition text-xs font-bold cursor-pointer"
                      title="Print Invoice"
                    >
                      <Printer size={12} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Desktop/Tablet Detailed Data Table (Visible on Screens >= 768px) */}
      <div className="hidden md:block bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    title={isAllSelected ? 'Deselect All' : 'Select All Orders'}
                  />
                </th>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Ordered Items & Sizes</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment Info</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-xs text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-muted-foreground">
                    <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                    <span>Loading store orders...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => {
                  const recipientName = order.shippingAddress?.recipientName || order.customer?.name || 'Guest Customer';
                  const recipientPhone = order.shippingAddress?.recipientPhone || order.customer?.phone || 'N/A';
                  const district = order.shippingAddress?.district || '';
                  const total = order.totalAmount || 0;
                  const orderStatus = order.deliveryStatus || 'Pending';
                  const orderId = order.orderId || `#${order._id?.slice(-8)}`;
                  const items = order.items || [];

                  return (
                    <tr key={order._id} className={`hover:bg-muted/30 transition ${selectedOrderIds.includes(order._id) ? 'bg-primary/5' : ''}`}>
                      
                      {/* Checkbox Column */}
                      <td className="py-3.5 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order._id)}
                          onChange={() => handleToggleSelectOrder(order._id)}
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1">
                            <span className="font-mono font-black text-primary text-xs">
                              {orderId}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(orderId, 'Order ID')}
                              className="text-muted-foreground hover:text-primary transition p-0.5"
                              title="Copy Order ID"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[180px]">
                          <span className="font-bold text-foreground text-xs truncate">{recipientName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">{recipientPhone}</span>
                          {district && <span className="text-[10px] text-muted-foreground truncate">{district}</span>}
                        </div>
                      </td>

                      {/* Ordered Items & Prominent Sizes */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-xs">
                          {items.slice(0, 2).map((item: any, idx: number) => {
                            const size = item.selectedSize || item.size;
                            const color = item.selectedColor || item.color;
                            const qty = item.quantity || 1;
                            const title = item.product?.title || `Item #${idx + 1}`;
                            const img = item.product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';

                            return (
                              <div key={idx} className="flex items-center space-x-2 text-xs">
                                <div className="h-7 w-7 rounded bg-muted border border-border relative overflow-hidden shrink-0">
                                  <Image src={img} alt={title} fill className="object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground truncate text-[11px] max-w-[160px]">{title}</p>
                                  <div className="flex items-center gap-1">
                                    {size && (
                                      <span className="px-1.5 py-0.2 bg-primary/10 text-primary text-[9px] font-black rounded border border-primary/20">
                                        Size: {size}
                                      </span>
                                    )}
                                    {color && (
                                      <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded border border-blue-500/20">
                                        {color}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground font-black">x{qty}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {items.length > 2 && (
                            <p className="text-[10px] text-muted-foreground font-extrabold italic">
                              + {items.length - 2} more item(s)...
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Total Amount & Due COD */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const advPaid = Number(order.advanceAmount || order.advancePayment || 0);
                          const due = Math.max(0, total - advPaid);
                          return (
                            <div className="flex flex-col">
                              <span className="font-black text-foreground text-sm">৳{total.toLocaleString()}</span>
                              {advPaid > 0 ? (
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  Adv: -৳{advPaid.toLocaleString()} | Due: ৳{due.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-muted-foreground">Full COD</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-extrabold capitalize px-2 py-0.5 rounded text-[10px] border inline-block w-fit ${
                            order.paymentMethod === 'bkash' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
                            order.paymentMethod === 'nagad' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                            order.paymentMethod === 'rocket' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                            'bg-muted text-muted-foreground border-border'
                          }`}>
                            {order.paymentMethod || 'COD'}
                          </span>
                          {order.transactionId && (
                            <span className="font-mono text-[9px] text-primary font-bold truncate max-w-[100px]">
                              Trx: {order.transactionId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setStatusModalOrder(order)}
                          className={`inline-flex items-center space-x-1 border rounded-full px-2.5 py-0.5 text-[10px] font-extrabold cursor-pointer hover:opacity-80 transition shadow-2xs ${statusColors[orderStatus] || 'bg-muted text-muted-foreground border-border'}`}
                          title="Click to Change Delivery Status"
                        >
                          <span>{orderStatus}</span>
                          <ChevronDown size={11} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                            title="View Invoice & Full Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer size={14} />
                          </button>

                          <button
                            onClick={() => setStatusModalOrder(order)}
                            className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                            title="Change Delivery Status"
                          >
                            <MoreHorizontal size={14} />
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 sm:px-5 py-3 bg-card border border-border rounded-xl sm:rounded-2xl shadow-xs text-center sm:text-left min-w-0 w-full">
          <p className="text-xs text-muted-foreground font-semibold">
            Showing {orders.length} of {totalOrders} orders · Page {page} of {totalPages}
          </p>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 text-xs font-bold text-foreground bg-muted border border-border rounded-lg hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pg = startPage + i;
              if (pg > totalPages) return null;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    page === pg
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'text-foreground bg-muted border-border hover:bg-primary hover:text-white'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 text-xs font-bold text-foreground bg-muted border border-border rounded-lg hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detailed Order Summary & Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 sm:pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-xl font-extrabold text-foreground font-serif">Order Summary & Invoice</h3>
                  <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-[10px] font-black ${statusColors[selectedOrder.deliveryStatus] || ''}`}>
                    {selectedOrder.deliveryStatus || 'Pending'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Grid Sections: Customer Info + Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Customer & Shipping Information */}
              <div className="bg-muted/40 border border-border/70 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <User size={12} className="text-primary" />
                    <span>Customer & Delivery</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Recipient Name:</span>
                    <span className="font-extrabold text-foreground text-xs">{selectedOrder.shippingAddress?.recipientName || selectedOrder.customer?.name || 'Guest Customer'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Recipient Phone:</span>
                      <span className="font-bold text-foreground font-mono text-xs">{selectedOrder.shippingAddress?.recipientPhone || 'N/A'}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(selectedOrder.shippingAddress?.recipientPhone, 'Phone')}
                      className="p-1 text-muted-foreground hover:text-primary transition"
                      title="Copy Phone Number"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  {selectedOrder.customer?.email && (
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Customer Email:</span>
                      <span className="font-medium text-foreground text-xs">{selectedOrder.customer.email}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-muted-foreground text-[10px] block">Delivery Address:</span>
                    <span className="font-medium text-foreground text-xs">
                      {selectedOrder.shippingAddress?.addressLine}, <strong className="text-primary">{selectedOrder.shippingAddress?.district}</strong>
                    </span>
                  </div>

                  {selectedOrder.deliveryNotes && (
                    <div className="pt-1">
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[10px] block">Special Instructions / Notes:</span>
                      <p className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-2 rounded-lg text-[11px] font-medium mt-0.5">
                        {selectedOrder.deliveryNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Order Meta Details */}
              <div className="bg-muted/40 border border-border/70 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <CreditCard size={12} className="text-primary" />
                    <span>Payment & Invoice Info</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Order Identifier:</span>
                      <span className="font-mono font-black text-primary text-xs">{selectedOrder.orderId}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(selectedOrder.orderId, 'Order ID')}
                      className="p-1 text-muted-foreground hover:text-primary transition"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[10px] block">Payment Method:</span>
                    <span className={`inline-block font-extrabold uppercase px-2 py-0.5 rounded text-[10px] border mt-0.5 ${
                      selectedOrder.paymentMethod === 'bkash' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
                      selectedOrder.paymentMethod === 'nagad' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                      selectedOrder.paymentMethod === 'rocket' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                      'bg-muted text-foreground border-border'
                    }`}>
                      {selectedOrder.paymentMethod || 'COD'}
                    </span>
                  </div>

                  {selectedOrder.paymentSenderNumber && (
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Sender Mobile No:</span>
                      <span className="font-bold font-mono text-foreground text-xs">{selectedOrder.paymentSenderNumber}</span>
                    </div>
                  )}

                  {selectedOrder.transactionId && (
                    <div className="flex items-center justify-between pt-0.5">
                      <div>
                        <span className="text-muted-foreground text-[10px] block">Transaction ID (TrxID):</span>
                        <span className="font-mono font-black text-primary text-xs tracking-wider uppercase">{selectedOrder.transactionId}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(selectedOrder.transactionId, 'TrxID')}
                        className="p-1 text-muted-foreground hover:text-primary transition"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  )}

                  <div>
                    <span className="text-muted-foreground text-[10px] block">Payment Status:</span>
                    <span className="font-bold text-foreground text-xs">{selectedOrder.paymentStatus || 'Pending'}</span>
                  </div>

                  {Number(selectedOrder.advanceAmount || selectedOrder.advancePayment || 0) > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Advance Paid:</span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ৳{Number(selectedOrder.advanceAmount || selectedOrder.advancePayment).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-primary font-bold">Courier Due (COD):</span>
                        <span className="font-mono font-black text-primary">
                          ৳{Math.max(0, (selectedOrder.totalAmount || 0) - Number(selectedOrder.advanceAmount || selectedOrder.advancePayment)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Delivery Progress Timeline Tracker */}
            <div className="bg-muted/30 border border-border/60 p-3 sm:p-4 rounded-2xl space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1">
                <Truck size={13} className="text-primary" />
                <span>Delivery Timeline Tracker</span>
              </p>
              
              <div className="flex items-center justify-between overflow-x-auto pb-1 pt-1 gap-2 scrollbar-none">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = ORDER_STEPS.indexOf(selectedOrder.deliveryStatus || 'Pending');
                  const isCompleted = idx <= currentIdx && selectedOrder.deliveryStatus !== 'Cancelled';
                  const isCurrent = step === selectedOrder.deliveryStatus;

                  return (
                    <div key={step} className="flex flex-col items-center min-w-[70px] text-center shrink-0">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border transition ${
                        isCurrent ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20' :
                        isCompleted ? 'bg-emerald-500 text-white border-emerald-500' :
                        'bg-muted text-muted-foreground border-border'
                      }`}>
                        {isCompleted ? <Check size={12} /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-extrabold mt-1 ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Purchased Items List (Enriched with Prominent Sizes) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Package size={13} className="text-primary" />
                  <span>Purchased Items ({selectedOrder.items?.length || 0})</span>
                </p>
                <span className="text-xs font-bold text-muted-foreground">Unit & Line Total</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const itemTitle = item.product?.title || `Product Item #${idx + 1}`;
                  const itemImg = item.product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                  const size = item.selectedSize || item.size;
                  const color = item.selectedColor || item.color;
                  const qty = item.quantity || 1;
                  const price = item.price || 0;
                  const sku = item.product?.sku;

                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 border border-border/60 rounded-xl gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-card border border-border overflow-hidden relative shrink-0">
                          <Image src={itemImg} alt={itemTitle} fill className="object-cover" />
                        </div>
                        
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">{itemTitle}</p>
                          {sku && <p className="text-[10px] text-muted-foreground font-mono">SKU: {sku}</p>}
                          
                          {/* Prominent Attributes: Size & Color Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {size ? (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-black rounded-md border border-primary/20">
                                Size: {size}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded border border-border">
                                Size: Standard
                              </span>
                            )}

                            {color && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold rounded-md border border-blue-500/20">
                                Color: {color}
                              </span>
                            )}

                            <span className="px-2 py-0.5 bg-muted text-foreground text-[10px] sm:text-xs font-black rounded-md border border-border">
                              Qty: {qty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-black text-foreground">৳{(price * qty).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">৳{price.toLocaleString()} / item</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Bill Calculation Summary */}
            {(() => {
              const advAmount = Number(selectedOrder.advanceAmount || selectedOrder.advancePayment || 0);
              const dueAmount = Math.max(0, (selectedOrder.totalAmount || 0) - advAmount);

              return (
                <div className="border-t border-border pt-3 space-y-1.5 text-xs bg-muted/20 p-3.5 rounded-2xl">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({selectedOrder.items?.length || 0} items)</span>
                    <span className="font-bold text-foreground font-mono">৳{(selectedOrder.subTotal || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Charge ({selectedOrder.shippingAddress?.district || 'Standard'})</span>
                    <span className="font-bold text-foreground font-mono">৳{(selectedOrder.shippingCharge || 0).toLocaleString()}</span>
                  </div>

                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Coupon Discount ({selectedOrder.couponCode})</span>
                      <span className="font-mono">-৳{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-foreground font-bold pt-1.5 border-t border-border/60">
                    <span>Total Order Value</span>
                    <span className="font-black font-mono">৳{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>

                  {advAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Advance Paid ({selectedOrder.paymentMethod ? selectedOrder.paymentMethod.toUpperCase() : 'Advance'})</span>
                      <span className="font-mono">-৳{advAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm sm:text-base font-black border-t-2 border-primary/30 pt-2 text-foreground bg-primary/5 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl">
                    <div>
                      <p className="text-xs font-black uppercase text-primary tracking-wider">
                        {advAmount > 0 ? 'Net Cash on Delivery (Due COD)' : 'Total Bill Payable (COD)'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {advAmount > 0 ? 'Courier COD Amount to Collect' : 'Full COD Amount to Collect'}
                      </p>
                    </div>
                    <span className="text-primary font-mono text-xl sm:text-2xl font-black">
                      ৳{(advAmount > 0 ? dueAmount : (selectedOrder.totalAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                onClick={() => setStatusModalOrder(selectedOrder)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <span>Update Status</span>
                <ChevronDown size={13} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Centered Quick Status Update Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in" onClick={() => setStatusModalOrder(null)}>
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground font-serif">
                  Update Delivery Status
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Order ID: <span className="font-mono font-bold text-primary">{statusModalOrder.orderId || `#${statusModalOrder._id?.slice(-8)}`}</span>
                </p>
              </div>
              
              <button
                onClick={() => setStatusModalOrder(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Recipient summary */}
            <div className="bg-muted/50 border border-border/60 p-3 rounded-xl flex items-center justify-between text-xs min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Customer Recipient</p>
                <p className="font-bold text-foreground mt-0.5 truncate">{statusModalOrder.shippingAddress?.recipientName || statusModalOrder.customer?.name || 'Guest Customer'}</p>
                <p className="text-muted-foreground font-mono text-[10px] truncate">{statusModalOrder.shippingAddress?.recipientPhone || 'N/A'}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Current Status</p>
                <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[9px] font-extrabold mt-1 ${statusColors[statusModalOrder.deliveryStatus] || ''}`}>
                  {statusModalOrder.deliveryStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* Status Options Grid */}
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">Select New Status</p>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {STATUS_TABS.filter(s => s !== 'All').map((s) => {
                  const isSelected = (statusModalOrder.deliveryStatus || 'Pending') === s;
                  return (
                    <button
                      key={s}
                      onClick={async () => {
                        await handleUpdateStatus(statusModalOrder._id, s);
                        setStatusModalOrder(null);
                      }}
                      disabled={isUpdating}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-muted/50 border-border text-foreground hover:bg-muted hover:border-primary/50'
                      }`}
                    >
                      <span>{s}</span>
                      {isSelected && <Check size={14} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border pt-3 flex items-center justify-end">
              <button
                onClick={() => setStatusModalOrder(null)}
                className="px-3.5 py-1.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
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
