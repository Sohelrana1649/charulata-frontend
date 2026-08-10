'use client';

import React, { useState } from 'react';
import {
  useGetOverviewStatsQuery,
  useGetSalesChartDataQuery,
  useGetCategoryDistributionQuery,
  useGetRecentOrdersQuery,
  useUpdateOrderStatusMutation,
  useLazyExportAnalyticsQuery,
} from '@/store/api/adminApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Loader2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Plus,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  RefreshCw,
  FileText,
  Sparkles,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

const PIE_COLORS = ['#e11d48', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

const TIMEFRAME_LABELS: Record<string, string> = {
  '2days': 'Last 2 Days / Today',
  '7days': 'Last 7 Days (Weekly)',
  '14days': 'Last 14 Days',
  '30days': 'Last 30 Days (Monthly)',
  '90days': 'Last 3 Months',
  '1year': 'Last 1 Year',
  'all': 'All Time Data'
};

const mockPieData = [
  { name: 'Saree', value: 38 },
  { name: 'Panjabi', value: 22 },
  { name: 'Jewelry', value: 18 },
  { name: 'Beauty', value: 14 },
  { name: 'Gadgets', value: 8 },
];

export default function AdminDashboardPage() {
  const { data: statsResponse, isLoading: statsLoading } = useGetOverviewStatsQuery({}, { pollingInterval: 30000 });
  const [chartTimeframe, setChartTimeframe] = useState('30days');
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  
  const { data: chartResponse, isLoading: chartLoading } = useGetSalesChartDataQuery(chartTimeframe);
  const { data: catResponse } = useGetCategoryDistributionQuery({});
  const { data: ordersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useGetRecentOrdersQuery({}, { pollingInterval: 15000 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // Live Stats parsing from GET /api/v1/analytics/overview
  const statsData = statsResponse?.data || statsResponse;
  const cards = statsData?.cards || {};

  const revenueVal = cards.totalSales?.value ?? 0;
  const ordersVal = cards.totalOrders?.value ?? 0;
  const customersVal = cards.totalCustomers?.value ?? 0;
  const grossRevenue = cards.totalRevenue?.gross ?? 0;
  
  // Avg order value = gross revenue / total orders
  const avgOrderVal = ordersVal > 0 ? (grossRevenue / ordersVal) : 0;

  // Chart data parsing from GET /api/v1/analytics/sales-chart
  const rawChartData = chartResponse?.data || [];
  const chartData = Array.isArray(rawChartData) && rawChartData.length > 0
    ? rawChartData.map((d: any) => ({
        date: d.month || d.date,
        revenue: d.sales || d.revenue || 0,
        orders: d.orders || 1
      }))
    : [
        { date: 'Mon', revenue: 35000, orders: 8 },
        { date: 'Tue', revenue: 55000, orders: 12 },
        { date: 'Wed', revenue: 65000, orders: 15 },
        { date: 'Thu', revenue: 80000, orders: 18 },
        { date: 'Fri', revenue: 72000, orders: 14 },
        { date: 'Sat', revenue: 130000, orders: 25 },
        { date: 'Sun', revenue: 95000, orders: 20 }
      ];

  // Reactive Filtered Metrics for KPI Stat Cards (Calculated directly from active timeframe data)
  const filteredMetrics = React.useMemo(() => {
    if (!Array.isArray(rawChartData) || rawChartData.length === 0) {
      return {
        revenue: revenueVal,
        orders: ordersVal,
        avgOrderVal: avgOrderVal
      };
    }

    const totalRev = rawChartData.reduce((acc: number, item: any) => acc + (item.sales || item.revenue || 0), 0);
    const totalOrds = rawChartData.reduce((acc: number, item: any) => acc + (item.orders || 1), 0);
    const avgVal = totalOrds > 0 ? Math.round(totalRev / totalOrds) : 0;

    return {
      revenue: totalRev,
      orders: totalOrds,
      avgOrderVal: avgVal
    };
  }, [rawChartData, revenueVal, ordersVal, avgOrderVal]);

  // Category distribution data parsing from GET /api/v1/analytics/categories
  const rawCatData = catResponse?.data?.topCategories || catResponse?.data?.categorySales || [];
  const catData = Array.isArray(rawCatData) && rawCatData.length > 0
    ? rawCatData.map((c: any) => ({
        name: c.name,
        value: c.revenue || c.salesCount || 0
      }))
    : mockPieData;

  // Recent orders parsing from GET /api/v1/analytics/recent-orders
  const recentOrders = Array.isArray(ordersResponse?.data) ? ordersResponse?.data : [];

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      refetchOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const [triggerExport, { isFetching: isExporting }] = useLazyExportAnalyticsQuery();

  const handleExportCSV = async () => {
    try {
      const res = await triggerExport({}).unwrap();
      const data = res?.data || res;
      if (!data) {
        toast.warning('No analytics data available to export');
        return;
      }

      const csvRows: string[] = [];

      csvRows.push('CHARULATA LIFESTYLE - DASHBOARD OVERVIEW REPORT');
      csvRows.push(`Exported Date: ${new Date(data.exportTimestamp || Date.now()).toLocaleString()}`);
      csvRows.push('');

      csvRows.push('--- DASHBOARD OVERVIEW SUMMARY ---');
      csvRows.push('Metric,Value');
      if (data.dashboardSummary) {
        const s = data.dashboardSummary;
        csvRows.push(`"Total Sales Revenue","BDT ${s.totalSales?.value?.toLocaleString() || 0}"`);
        csvRows.push(`"Total Orders","${s.totalOrders?.value || 0}"`);
        csvRows.push(`"Total Customers","${s.totalCustomers?.value || 0}"`);
        csvRows.push(`"Gross Revenue","BDT ${s.totalRevenue?.gross?.toLocaleString() || 0}"`);
        csvRows.push(`"Net Revenue","BDT ${s.totalRevenue?.net?.toLocaleString() || 0}"`);
        csvRows.push(`"Total Reviews Received","${s.totalReviews?.value || 0}"`);
        csvRows.push(`"Average Customer Rating","${s.totalReviews?.averageRating || 0} / 5"`);
      }
      csvRows.push('');

      csvRows.push('--- CATEGORY SALES PERFORMANCE ---');
      csvRows.push('Category Name,Total Sales (BDT),Total Orders');
      if (Array.isArray(data.categoryPerformances)) {
        data.categoryPerformances.forEach((cat: any) => {
          csvRows.push(`"${cat.name || 'Unknown'}",${cat.revenue || 0},${cat.salesCount || 0}`);
        });
      }
      csvRows.push('');

      csvRows.push('--- TOP BEST SELLING PRODUCTS ---');
      csvRows.push('Product Name,Total Quantity Sold,Revenue Generated (BDT)');
      if (Array.isArray(data.bestSellers)) {
        data.bestSellers.forEach((prod: any) => {
          csvRows.push(`"${prod.title || 'Unknown'}",${prod.totalQty || 0},${prod.totalRevenue || 0}`);
        });
      }
      csvRows.push('');

      csvRows.push('--- REVIEWS SUMMARY ---');
      csvRows.push(`Total Reviews Received,${data.reviewsSummary?.totalReviews || 0}`);
      csvRows.push(`Average Customer Rating,${data.reviewsSummary?.avgRating || 0} / 5`);

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `charulata_dashboard_overview_${new Date().toISOString().split('T')[0]}.csv`);
      a.click();
      toast.success('CSV exported successfully!');
    } catch (err: any) {
      toast.error('Failed to export CSV analytics');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await triggerExport({}).unwrap();
      const data = res?.data || res;
      if (!data) {
        toast.warning('No analytics data available to export');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups to export PDF report.');
        return;
      }

      const s = data.dashboardSummary || {};
      const activeFilterLabel = TIMEFRAME_LABELS[chartTimeframe] || 'Filtered Summary';
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Charulata Executive Sales & Analytics Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; }
    .header { border-bottom: 2px solid #e11d48; padding-bottom: 15px; margin-bottom: 20px; }
    h1 { color: #e11d48; margin: 0; font-size: 24px; font-weight: 800; }
    .badge { display: inline-block; background: #ffe4e6; color: #e11d48; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 25px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; font-size: 13px; }
    th { background: #e11d48; color: #ffffff; font-weight: 700; }
    tr:nth-child(even) { background-color: #f8fafc; }
    h2 { font-size: 16px; margin-top: 25px; color: #1e293b; font-weight: 700; border-left: 4px solid #e11d48; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Charulata Lifestyle</h1>
    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;"><strong>Executive Sales & Inventory Analytics Report</strong></p>
    <div class="badge">Date Filter: ${activeFilterLabel}</div>
    <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Generated on: ${new Date(data.exportTimestamp || Date.now()).toLocaleString()}</p>
  </div>
  
  <h2>1. Executive KPI Summary (${activeFilterLabel})</h2>
  <table>
    <thead><tr><th>Metric Indicator</th><th>Total Calculated Value</th></tr></thead>
    <tbody>
      <tr><td>Total Sales Revenue</td><td><strong>BDT ${(s.totalSales?.value || 0).toLocaleString()}</strong></td></tr>
      <tr><td>Total Orders Processed</td><td><strong>${s.totalOrders?.value || 0} Orders</strong></td></tr>
      <tr><td>Registered Store Customers</td><td>${s.totalCustomers?.value || 0} Customers</td></tr>
      <tr><td>Gross Revenue (Before Deductions)</td><td>BDT ${(s.totalRevenue?.gross || 0).toLocaleString()}</td></tr>
      <tr><td>Net Revenue (After Deductions)</td><td>BDT ${(s.totalRevenue?.net || 0).toLocaleString()}</td></tr>
    </tbody>
  </table>

  <h2>2. Top Best Selling Collections</h2>
  <table>
    <thead><tr><th>Product Name</th><th>Units Sold</th><th>Total Revenue Generated</th></tr></thead>
    <tbody>
      ${(data.bestSellers || []).map((prod: any) => `
        <tr>
          <td>${prod.title || 'Product'}</td>
          <td>${prod.totalQty || 0} pcs</td>
          <td><strong>BDT ${(prod.totalRevenue || 0).toLocaleString()}</strong></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success('PDF report generated successfully!');
    } catch (err: any) {
      toast.error('Failed to export PDF analytics');
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">
              {greeting()}, <span className="text-primary">Admin</span>
            </h1>
            <Sparkles size={16} className="text-primary animate-pulse sm:w-5 sm:h-5" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Here is a real-time summary of Charulata store sales performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Brand Timeframe Dropdown Selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
              className="flex items-center space-x-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl px-3 py-2 text-[10px] sm:text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
            >
              <Calendar size={14} className="text-primary shrink-0" />
              <span>{TIMEFRAME_LABELS[chartTimeframe] || 'Filter Range'}</span>
              <ChevronDown size={14} className={`text-primary transition-transform duration-200 ${isTimeframeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTimeframeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsTimeframeDropdownOpen(false)} 
                />
                
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden min-w-[200px] max-w-[calc(100vw-2.5rem)] divide-y divide-border/40 animate-in fade-in slide-in-from-top-2 duration-150 p-1 space-y-0.5">
                  {[
                    { key: '2days', label: 'Last 2 Days / Today' },
                    { key: '7days', label: 'Last 7 Days (Weekly)' },
                    { key: '14days', label: 'Last 14 Days' },
                    { key: '30days', label: 'Last 30 Days (Monthly)' },
                    { key: '90days', label: 'Last 3 Months' },
                    { key: '1year', label: 'Last 1 Year' },
                    { key: 'all', label: 'All Time Data' },
                  ].map((tf) => {
                    const isSelected = chartTimeframe === tf.key;
                    return (
                      <button
                        key={tf.key}
                        type="button"
                        onClick={() => {
                          setChartTimeframe(tf.key);
                          setIsTimeframeDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-xs font-extrabold'
                            : 'text-foreground hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <span>{tf.label}</span>
                        {isSelected && <CheckCircle size={13} className="text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 group"
            title="Download store sales analytics as Excel CSV file"
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={14} className="group-hover:scale-110 transition-transform" />}
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 group"
            title="Generate printable PDF summary report"
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileText size={14} className="group-hover:scale-110 transition-transform" />}
            <span>Export PDF</span>
          </button>

          <Link
            href="/admin/products"
            className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-xl text-[10px] sm:text-xs font-bold hover:opacity-90 transition shadow-sm"
          >
            <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          {
            label: `Total Revenue (${TIMEFRAME_LABELS[chartTimeframe] || 'Filtered'})`,
            value: `৳${filteredMetrics.revenue.toLocaleString()}`,
            change: '+12.4%',
            icon: <DollarSign size={20} />,
            color: 'text-primary',
            bg: 'bg-primary/10 border-primary/20',
          },
          {
            label: `Total Orders (${TIMEFRAME_LABELS[chartTimeframe] || 'Filtered'})`,
            value: filteredMetrics.orders,
            change: '+8.2%',
            icon: <ShoppingBag size={20} />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Total Customers',
            value: customersVal.toLocaleString(),
            change: '+3.1%',
            icon: <Users size={20} />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: `Avg. Order Value (${TIMEFRAME_LABELS[chartTimeframe] || 'Filtered'})`,
            value: `৳${filteredMetrics.avgOrderVal.toLocaleString()}`,
            change: '-1.8%',
            icon: <TrendingUp size={20} />,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
          },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5 sm:space-y-1">
              <div className={`inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border ${card.bg} ${card.color}`}>
                <span className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{card.icon}</span>
              </div>
              <p className="text-base sm:text-lg lg:text-2xl font-black text-foreground mt-1 sm:mt-2 font-serif">{statsLoading ? '...' : card.value}</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight">{card.label}</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] sm:text-xs font-extrabold ${card.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ↗ {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Revenue Timeline Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Revenue Timeline</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Sales performance analytics (BDT)</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-muted border border-border rounded-xl p-1">
              {[
                { key: '2days', label: '2 Days' },
                { key: '7days', label: '7 Days' },
                { key: '14days', label: '14 Days' },
                { key: '30days', label: '30 Days' },
                { key: '90days', label: '3 Months' },
                { key: '1year', label: '1 Year' },
                { key: 'all', label: 'All Time' },
              ].map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setChartTimeframe(tf.key)}
                  className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    chartTimeframe === tf.key ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 sm:h-64">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                <Loader2 className="animate-spin text-primary mr-2 h-4 w-4" />
                Loading timeline chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px', color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--muted-foreground)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5} fill="url(#colorRevDash)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Sales Pie Chart */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Category Sales</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Distribution across top collections</p>
          </div>

          <div className="h-36 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {catData.map((_: any, idx: number) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 pt-2 border-t border-border">
            {catData.slice(0, 6).map((c: any, i: number) => (
              <div key={i} className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
                <span className="text-foreground ml-auto font-bold">{c.value ? c.value.toLocaleString() : '0'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Recent Operations</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Latest {recentOrders.length} customer orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-bold text-primary hover:underline transition"
          >
            <span>View All</span>
            <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold">
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5">Order ID</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5">Customer</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 hidden sm:table-cell">Date</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5">Total</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 hidden md:table-cell">Payment</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5">Status</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 text-right hidden lg:table-cell">Update</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
              {ordersLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="animate-spin text-primary inline mr-2 h-4 w-4" /> Loading operations...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">No recent orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
                  const orderId = order.orderId || `#${(order.id || order._id)?.slice(-8)}`;
                  const orderStatus = order.deliveryStatus || 'Pending';

                  return (
                    <tr key={order.id || order._id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 font-mono font-extrabold text-primary text-[10px] sm:text-xs">{orderId}</td>
                      
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 font-bold text-foreground">
                        {order.customerName || order.shippingAddress?.recipientName || 'Guest Customer'}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 text-muted-foreground hidden sm:table-cell">
                        {order.orderDate || order.createdAt ? new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 font-extrabold text-foreground">৳{(order.totalAmount || 0).toLocaleString()}</td>
                      
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 text-muted-foreground capitalize font-semibold hidden md:table-cell">{order.codStatus || order.paymentMethod || 'COD'}</td>
                      
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5">
                        <span className={`inline-flex items-center border rounded-full px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold ${statusColors[orderStatus] || 'bg-muted text-muted-foreground border-border'}`}>
                          {orderStatus}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-5 text-right hidden lg:table-cell">
                        <select
                          value={orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id || order._id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-muted border border-border text-foreground rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold focus:border-primary outline-none cursor-pointer"
                        >
                          {['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                            <option key={s} value={s} className="bg-card text-foreground">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
