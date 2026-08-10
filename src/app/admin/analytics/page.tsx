'use client';

import React, { useState } from 'react';
import {
  useGetOverviewStatsQuery,
  useGetSalesChartDataQuery,
  useGetCategoryDistributionQuery,
  useLazyExportAnalyticsQuery
} from '@/store/api/adminApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Loader2, 
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';

const PIE_COLORS = ['#e11d48', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];
const mockPieData = [
  { name: 'Saree', value: 38 },
  { name: 'Panjabi', value: 22 },
  { name: 'Jewelry', value: 18 },
  { name: 'Beauty', value: 14 },
  { name: 'Gadgets', value: 8 },
];

export default function AdminAnalyticsPage() {
  const { data: statsResponse, isLoading: statsLoading } = useGetOverviewStatsQuery({});
  const [timeframe, setTimeframe] = useState('30days');
  const { data: chartResponse, isLoading: chartLoading } = useGetSalesChartDataQuery(timeframe);
  const { data: catResponse } = useGetCategoryDistributionQuery({});

  const [triggerExport, { isFetching: isExporting }] = useLazyExportAnalyticsQuery();

  const statsData = statsResponse?.data || statsResponse;
  const cards = statsData?.cards || {};

  const revenueVal = cards.totalSales?.value ?? 0;
  const ordersVal = cards.totalOrders?.value ?? 0;
  const customersVal = cards.totalCustomers?.value ?? 0;
  const grossRevenue = cards.totalRevenue?.gross ?? 0;
  const avgOrderVal = ordersVal > 0 ? (grossRevenue / ordersVal) : 0;

  const rawChartData = chartResponse?.data || [];
  const chartData = Array.isArray(rawChartData) && rawChartData.length > 0
    ? rawChartData.map((d: any) => ({
        date: d.month || d.date,
        revenue: d.sales || d.revenue || 0
      }))
    : [
        { date: 'Mon', revenue: 35000 },
        { date: 'Tue', revenue: 55000 },
        { date: 'Wed', revenue: 65000 },
        { date: 'Thu', revenue: 80000 },
        { date: 'Fri', revenue: 72000 },
        { date: 'Sat', revenue: 130000 },
        { date: 'Sun', revenue: 95000 }
      ];

  const rawCatData = catResponse?.data?.topCategories || catResponse?.data?.categorySales || [];
  const catData = Array.isArray(rawCatData) && rawCatData.length > 0
    ? rawCatData.map((c: any) => ({
        name: c.name,
        value: c.revenue || c.salesCount || 0
      }))
    : mockPieData;

  const handleExportCSV = async () => {
    try {
      const res = await triggerExport({}).unwrap();
      const data = res?.data || res;
      if (!data) {
        toast.warning('No analytics data available to export');
        return;
      }

      const csvRows: string[] = [];
      csvRows.push('CHARULATA LIFESTYLE - GENERAL ANALYTICS REPORT');
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
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `charulata_general_analytics_${new Date().toISOString().split('T')[0]}.csv`);
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
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Charulata Analytics Report</title>
  <style>
    body { font-family: sans-serif; padding: 30px; color: #0f172a; }
    h1 { color: #800020; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #800020; color: #fff; }
  </style>
</head>
<body>
  <h1>Charulata Lifestyle</h1>
  <p><strong>General Analytics Report</strong> - Generated: ${new Date(data.exportTimestamp || Date.now()).toLocaleString()}</p>
  <table>
    <thead><tr><th>Metric</th><th>Current Status</th></tr></thead>
    <tbody>
      <tr><td>Total Sales Revenue</td><td>BDT ${(s.totalSales?.value || 0).toLocaleString()}</td></tr>
      <tr><td>Total Orders Placed</td><td>${s.totalOrders?.value || 0}</td></tr>
      <tr><td>Total Registered Customers</td><td>${s.totalCustomers?.value || 0}</td></tr>
      <tr><td>Gross Revenue</td><td>BDT ${(s.totalRevenue?.gross || 0).toLocaleString()}</td></tr>
    </tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success('Report generated successfully!');
    } catch (err: any) {
      toast.error('Failed to export PDF analytics');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Store Analytics & Growth</h1>
            <Sparkles size={20} className="text-primary animate-pulse" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Deep dive sales charts, order trends, product performance, and executive reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 group"
            title="Download store analytics report as Excel CSV file"
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={14} className="group-hover:scale-110 transition-transform" />}
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 group"
            title="Generate printable PDF summary report"
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileText size={14} className="group-hover:scale-110 transition-transform" />}
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: 'Total Sales Revenue', value: `৳${revenueVal.toLocaleString()}`, change: '+14.2%', icon: <DollarSign size={20} />, bg: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Total Orders', value: ordersVal, change: '+9.1%', icon: <ShoppingBag size={20} />, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
          { label: 'Total Customers', value: customersVal.toLocaleString(), change: '+5.4%', icon: <Users size={20} />, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
          { label: 'Avg Order Value', value: `৳${Math.round(avgOrderVal).toLocaleString()}`, change: '+2.8%', icon: <TrendingUp size={20} />, bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              <div className={`inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border ${card.bg}`}>
                {card.icon}
              </div>
              <p className="text-base sm:text-2xl font-black text-foreground mt-1 sm:mt-2 font-serif">{statsLoading ? '...' : card.value}</p>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight">{card.label}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                ↗ {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Revenue Timeline */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Revenue Performance Chart</h2>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Timeline analytics across sales volume</p>
            </div>

            <div className="flex bg-muted border border-border rounded-lg sm:rounded-xl p-0.5">
              {['7days', '30days', '90days'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-extrabold rounded-md sm:rounded-lg transition cursor-pointer ${
                    timeframe === tf ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf === '7days' ? '7d' : tf === '30days' ? '30d' : '90d'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 sm:h-64">
            {chartLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                <Loader2 className="animate-spin text-primary mr-2 h-4 w-4" />
                Loading analytics data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Category Sales Share</h2>
            <p className="text-[10px] text-muted-foreground">Product catalog sales distribution</p>
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

      {/* Bar Chart Section */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Sales Volume Breakdown</h2>
          <p className="text-[10px] text-muted-foreground">Comparative daily & monthly sales metrics</p>
        </div>

        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#e11d48" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
