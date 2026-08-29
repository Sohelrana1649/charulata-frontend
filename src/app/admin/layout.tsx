'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { 
  useGetNotificationsQuery, 
  useGetAdminOrdersQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation
} from '@/store/api/adminApi';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Grid3X3,
  Users,
  Star,
  Ticket,
  Image as ImageIcon,
  Truck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  User,
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCheck,
  Trash2,
  Eye,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders
} from 'lucide-react';
import Image from '@/components/SafeImage';

// Role hierarchy: super_admin(4) > admin(3) > staff(2) > customer(1)
const allSidebarSections = [
  {
    title: 'OVERVIEW',
    links: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, minRole: 2 },
    ]
  },
  {
    title: 'STORE & ORDERS',
    links: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, badge: true, minRole: 2 },
      { label: 'Products', href: '/admin/products', icon: Package, minRole: 2 },
      { label: 'Categories', href: '/admin/categories', icon: Grid3X3, minRole: 2 },
      { label: 'Attributes', href: '/admin/attributes', icon: Sliders, minRole: 2 },
      { label: 'Delivery', href: '/admin/delivery', icon: Truck, minRole: 3 },
    ]
  },
  {
    title: 'CUSTOMERS & COMMUNITY',
    links: [
      { label: 'Customers', href: '/admin/customers', icon: Users, minRole: 3 },
      { label: 'Reviews', href: '/admin/reviews', icon: Star, minRole: 2 },
    ]
  },
  {
    title: 'MARKETING & PROMO',
    links: [
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket, minRole: 3 },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon, minRole: 3 },
      { label: 'Campaigns', href: '/admin/campaigns', icon: Sparkles, minRole: 3 },
    ]
  },
  {
    title: 'ANALYTICS & SYSTEM',
    links: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, minRole: 3 },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell, badge: true, minRole: 2 },
      { label: 'Settings', href: '/admin/settings', icon: Settings, minRole: 4 },
    ]
  }
];

const ADMIN_ROLES = ['super_admin', 'admin', 'staff'];
const roleRankMap: Record<string, number> = { super_admin: 4, admin: 3, staff: 2, customer: 1 };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Filter sidebar sections and links based on the logged-in user's role rank
  const userRank = roleRankMap[user?.role || 'customer'] || 1;
  const sidebarSections = useMemo(() => 
    allSidebarSections.map(sec => ({
      ...sec,
      links: sec.links.filter(link => userRank >= link.minRole)
    })).filter(sec => sec.links.length > 0),
    [userRank]
  );

  useEffect(() => {
    const activeTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const { data: ordersResponse } = useGetAdminOrdersQuery({ status: 'Pending', limit: 1 });
  const pendingOrdersCount = ordersResponse?.total || ordersResponse?.data?.total || 0;

  const { data: notificationsResponse } = useGetNotificationsQuery({});
  const notificationsList = notificationsResponse?.data?.notifications || notificationsResponse?.notifications || [];
  const unreadNotificationsCount = Array.isArray(notificationsList)
    ? notificationsList.filter((n: any) => !n.isRead).length
    : 0;

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({}).unwrap();
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotif(id).unwrap();
      if (selectedNotif?._id === id) {
        setSelectedNotif(null);
      }
    } catch (err) {}
  };

  const handleOpenNotification = (notif: any) => {
    setSelectedNotif(notif);
    setNotificationsOpen(false);
    if (!notif.isRead) {
      handleMarkRead(notif._id);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'NewOrder':
        return {
          bg: 'bg-primary/10 text-primary border-primary/20',
          icon: <ShoppingCart size={14} />,
          label: 'New Order'
        };
      case 'StockAlert':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          icon: <AlertTriangle size={14} />,
          label: 'Stock Alert'
        };
      case 'UserActivity':
        return {
          bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          icon: <Users size={14} />,
          label: 'User Activity'
        };
      default:
        return {
          bg: 'bg-muted text-muted-foreground border-border',
          icon: <Bell size={14} />,
          label: 'System Notification'
        };
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('charulata_user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const role = user?.role || parsedUser?.role;
      if (!role || !ADMIN_ROLES.includes(role)) {
        router.push('/login?redirect=admin');
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const allLinks = useMemo(() => sidebarSections.flatMap(s => s.links), [sidebarSections]);
  const currentPageLabel = allLinks.find((l: any) => l.href === pathname)?.label || 'Dashboard';

  if (!mounted || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground font-semibold">Verifying administrative access...</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ${
          sidebarOpen ? 'w-[240px]' : 'w-[72px]'
        } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-sm`}
      >
        {/* Logo & Desktop Collapse Toggle Header */}
        <div className="flex items-center justify-between h-16 sm:h-20 px-3.5 sm:px-4 border-b border-border shrink-0 bg-card/80 backdrop-blur-md">
          <Link href="/admin" className="flex items-center space-x-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 border-2 border-primary/30 overflow-hidden relative flex items-center justify-center shrink-0 shadow-md ring-2 ring-primary/20">
              <Image 
                src="/logo.png" 
                alt="Charulata Logo" 
                fill 
                className="object-cover" 
                priority
              />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-[13px] sm:text-sm font-extrabold text-foreground font-serif truncate leading-tight">Charulata</p>
                <p className="text-[9px] sm:text-[10px] text-primary uppercase tracking-widest font-black mt-0.5">Admin Suite</p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            aria-label="Toggle Sidebar width"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* Nav Links Grouped by Section */}
        <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 sm:px-2.5 space-y-4 scrollbar-thin">
          {sidebarSections.map((section, idx) => (
            <div key={section.title || idx} className="space-y-1">
              {sidebarOpen ? (
                <p className="px-3 text-[9px] font-black uppercase tracking-wider text-muted-foreground/70 mb-1.5 font-mono">
                  {section.title}
                </p>
              ) : (
                <div className="h-[1px] bg-border/60 my-2 mx-2" />
              )}

              {section.links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                const Icon = link.icon;
                const count = link.label === 'Orders' ? pendingOrdersCount : link.label === 'Notifications' ? unreadNotificationsCount : 0;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={!sidebarOpen ? link.label : undefined}
                    className={`group relative flex items-center ${sidebarOpen ? 'space-x-3 px-3.5 py-2.5' : 'justify-center p-2.5'} rounded-xl text-xs sm:text-[13px] font-extrabold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/25 font-black'
                        : 'text-foreground/80 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <Icon 
                      size={18} 
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
                      }`} 
                    />

                    {sidebarOpen && <span className="truncate tracking-wide">{link.label}</span>}

                    {/* Badge Count */}
                    {link.badge && count > 0 && (
                      <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs ${
                        sidebarOpen ? 'ml-auto' : 'absolute -top-1 -right-1'
                      } ${
                        isActive ? 'bg-white text-primary font-black' : 'bg-primary text-white'
                      }`}>
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Admin Profile Card & Back to Store */}
        <div className="border-t border-border p-2 sm:p-3 shrink-0 bg-muted/20 space-y-2">
          {/* Admin Profile Mini Card */}
          {sidebarOpen && (
            <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-card border border-border/80 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0 font-serif">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Admin User'}</p>
                <span className="inline-block text-[9px] font-extrabold text-primary uppercase tracking-wider bg-primary/10 px-1.5 py-0.2 rounded-md border border-primary/20">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </span>
              </div>
            </div>
          )}

          {sidebarOpen && (
            <div className="text-[10px] text-center text-muted-foreground/80 font-medium py-0.5">
              Developed by{' '}
              <a
                href="https://www.linkedin.com/in/shipon-chowdhury/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:underline transition-all"
              >
                Shipon Chowdhury
              </a>
            </div>
          )}

          {/* Back to Live Store Front */}
          <Link
            href="/"
            className={`flex items-center ${sidebarOpen ? 'space-x-2.5 px-3 py-2' : 'justify-center p-2.5'} text-xs font-bold text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-200 group border border-transparent hover:border-primary/20`}
            title={!sidebarOpen ? 'Back to Store' : undefined}
          >
            <ExternalLink size={16} className="group-hover:scale-110 transition-transform text-muted-foreground group-hover:text-primary shrink-0" />
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-x-hidden transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[72px]'
        }`}
      >
        {/* Topbar Header */}
        <header className="h-16 sm:h-20 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-3.5 sm:px-6 lg:px-8 shrink-0 z-40 shadow-2xs sticky top-0">
          
          {/* Left: Sidebar Toggle & Page Breadcrumb */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setMobileSidebarOpen(!mobileSidebarOpen);
                else setSidebarOpen(!sidebarOpen);
              }}
              className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center bg-primary hover:opacity-90 text-white rounded-xl shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
              title="Toggle Menu"
            >
              <Menu size={22} className="text-white" />
            </button>
            
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                {user.role.replace('_', ' ')}
              </span>
              <span className="hidden sm:inline text-muted-foreground/40 text-sm">/</span>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-foreground font-serif leading-tight truncate">
                {currentPageLabel}
              </p>
            </div>
          </div>

          {/* Right: Quick Actions (Store Preview, Theme, Notification, Profile) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Quick 1-Tap Visit Store Button */}
            <Link
              href="/"
              target="_blank"
              className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-muted-foreground hover:text-primary rounded-xl bg-muted/50 hover:bg-muted border border-border/60 transition cursor-pointer shadow-2xs"
              title="Visit Live Store Front"
            >
              <ExternalLink size={20} />
            </Link>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl bg-muted/50 hover:bg-muted border border-border/60 transition cursor-pointer shadow-2xs"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>

            {/* Notifications Popover Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl bg-muted/50 hover:bg-muted border border-border/60 transition cursor-pointer shadow-2xs"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-[9px] font-mono font-black text-white-force border-2 border-card flex items-center justify-center shadow-xs animate-pulse z-10">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown Window */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setNotificationsOpen(false)} />
                  <div className="fixed sm:absolute top-16 left-3 right-3 sm:top-full sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-80 md:w-88 max-w-[360px] mx-auto sm:mx-0 bg-card border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden divide-y divide-border animate-in fade-in duration-150">
                    
                    {/* Popover Header */}
                    <div className="p-3.5 flex items-center justify-between bg-muted/40">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-extrabold text-foreground font-serif">Notifications</span>
                        {unreadNotificationsCount > 0 && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {unreadNotificationsCount} unread
                          </span>
                        )}
                      </div>

                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-extrabold text-primary hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Popover List Feed */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border scrollbar-thin">
                      {notificationsList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No new notifications at this time.
                        </div>
                      ) : (
                        notificationsList.map((notif: any) => {
                          const config = getTypeConfig(notif.type);
                          return (
                            <div
                              key={notif._id}
                              onClick={() => handleOpenNotification(notif)}
                              className={`p-3.5 flex items-start space-x-3 hover:bg-muted/50 cursor-pointer transition ${
                                notif.isRead ? 'opacity-70 bg-transparent' : 'bg-primary/5'
                              }`}
                            >
                              <div className={`p-2 rounded-xl border shrink-0 ${config.bg}`}>
                                {config.icon}
                              </div>

                              <div className="min-w-0 space-y-0.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <span className="h-2 w-2 bg-primary rounded-full shrink-0" />
                                  )}
                                </div>
                                
                                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[200px]">
                                  {notif.message}
                                </p>
                                
                                <p className="text-[9px] text-muted-foreground font-medium pt-0.5">
                                  {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Popover Footer */}
                    <div className="p-2.5 text-center bg-muted/30">
                      <Link
                        href="/admin/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="inline-flex items-center space-x-1 text-xs font-extrabold text-primary hover:underline transition"
                      >
                        <span>View All Notifications</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Button */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-border/60 hover:opacity-85 transition text-left focus:outline-none cursor-pointer"
              >
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 border-2 border-primary/40 overflow-hidden relative flex items-center justify-center shrink-0 shadow-2xs">
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                  ) : (
                    <span className="text-xs font-black text-primary font-serif">{initials}</span>
                  )}
                </div>

                <div className="hidden lg:block">
                  <p className="text-xs font-extrabold text-foreground leading-tight truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider leading-none mt-0.5">{user.role.replace('_', ' ')}</p>
                </div>
                <ChevronDown size={14} className="text-muted-foreground hidden lg:block" />
              </button>

              {/* Profile Dropdown Window */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5 animate-in fade-in">
                    
                    {/* User Info Header */}
                    <div className="px-3.5 py-2.5 border-b border-border bg-muted/40 rounded-xl mb-1">
                      <p className="text-xs font-extrabold text-foreground truncate font-serif">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    {/* Links */}
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition cursor-pointer"
                    >
                      <Settings size={14} className="text-muted-foreground" />
                      <span>Admin Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition cursor-pointer"
                    >
                      <ExternalLink size={14} className="text-muted-foreground" />
                      <span>Visit Online Store</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer border-t border-border mt-1 pt-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-4 lg:p-6 space-y-3 sm:space-y-6 w-full max-w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
