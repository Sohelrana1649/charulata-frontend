'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout, updateUser } from '@/store/authSlice';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { getUserAvatarUrl, getFallbackAvatarUrl, saveUserAvatarLocally } from '@/utils/avatarHelper';
import { useGetOrderHistoryQuery } from '@/store/api/orderApi';
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useGetNotificationsQuery,
  useChangePasswordMutation
} from '@/store/api/userApi';
import {
  User as UserIcon,
  History,
  MapPin,
  Heart,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Edit,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Eye,
  EyeOff,
  ChevronRight,
  Upload,
  UploadCloud,
  Camera,
  X,
  Calendar,
  Sparkles,
  DollarSign,
  Download,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { downloadInvoicePdf } from '@/utils/invoicePdf';
import Image from '@/components/SafeImage';

interface Address {
  id: string;
  label: string;
  details: string;
  isDefault?: boolean;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  // Active Tab State (sync with URL if provided)
  const tabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Auth Redux selectors
  const { isAuthenticated, user: reduxUser } = useSelector((state: RootState) => state.auth);

  // Queries & Mutations
  const { data: profileResponse, isLoading: isProfileLoading } = useGetProfileQuery({}, { skip: !isAuthenticated });
  const { data: ordersResponse, isLoading: isOrdersLoading } = useGetOrderHistoryQuery({}, { skip: !isAuthenticated });
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadImage, { isLoading: isUploadingAvatar }] = useUploadImageMutation();

  // User API Hooks
  const { data: wishlistResponse } = useGetWishlistQuery({}, { skip: !isAuthenticated });
  const { data: notificationsResponse } = useGetNotificationsQuery({}, { skip: !isAuthenticated });
  const [addAddressMutation] = useAddAddressMutation();
  const [deleteAddressMutation] = useDeleteAddressMutation();
  const [removeFromWishlistMutation] = useRemoveFromWishlistMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const rawUser = profileResponse?.data?.user || profileResponse?.user || reduxUser;
  const user = useMemo(() => {
    if (!rawUser) return rawUser;
    const avatarUrl = getUserAvatarUrl(rawUser) || rawUser.profileImage || rawUser.avatar || '';
    return {
      ...rawUser,
      profileImage: avatarUrl,
      avatar: avatarUrl,
    };
  }, [rawUser]);
  const orders = ordersResponse?.data?.orders || ordersResponse?.data || ordersResponse || [];
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  // Profile Form Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    profileImage: '',
    dateOfBirth: '',
    gender: 'male'
  });

  useEffect(() => {
    if (user) {
      let dobString = '';
      if (user.dateOfBirth) {
        try {
          dobString = new Date(user.dateOfBirth).toISOString().split('T')[0];
        } catch (e) {
          dobString = '';
        }
      }
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: getUserAvatarUrl(user),
        dateOfBirth: dobString,
        gender: user.gender || 'male'
      });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const url = res?.data?.url || res?.url;
      if (url) {
        let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
        if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
          baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
        }
        const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
        setProfileForm(prev => ({ ...prev, profileImage: fullUrl }));
        saveUserAvatarLocally(user, fullUrl);

        // Auto-save to MongoDB profile immediately
        const payload: any = {
          name: (user?.name || profileForm.name || '').trim(),
          phone: (user?.phone || profileForm.phone || '').trim(),
          profileImage: fullUrl,
          avatar: fullUrl,
          avatarUrl: fullUrl,
          image: fullUrl,
          photo: fullUrl,
        };

        try {
          const updateRes = await updateProfile(payload).unwrap();
          const updatedUser = updateRes?.data?.user || updateRes?.data || updateRes?.user || updateRes;
          if (updatedUser) {
            dispatch(updateUser(updatedUser));
          } else {
            dispatch(updateUser({ ...user, ...payload }));
          }
        } catch {
          dispatch(updateUser({ ...user, ...payload }));
        }

        toast.success('Profile photo updated successfully! 🎉');
      }
    } catch (err: any) {
      // Fallback to local FileReader if upload endpoint error
      const reader = new FileReader();
      reader.onloadend = () => {
        const localData = reader.result as string;
        setProfileForm(prev => ({
          ...prev,
          profileImage: localData
        }));
        saveUserAvatarLocally(user, localData);
        dispatch(updateUser({ ...user, profileImage: localData, avatar: localData }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Real MongoDB Addresses from User Profile
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    recipientName: '',
    recipientPhone: '',
    district: '',
    addressLine: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setNewAddress(prev => ({
        ...prev,
        recipientName: prev.recipientName || user.name || '',
        recipientPhone: prev.recipientPhone || user.phone || ''
      }));
    }
  }, [user]);

  // Map Backend Saved Addresses from Mongo User Profile
  const activeAddresses = useMemo(() => {
    return (user?.savedAddresses || []).map((addr: any) => ({
      id: addr._id || addr.id,
      label: (addr.addressType || 'Home').toUpperCase(),
      recipientName: addr.recipientName || user?.name || '',
      recipientPhone: addr.recipientPhone || user?.phone || '',
      district: addr.district || '',
      addressLine: addr.addressLine || '',
      isDefault: !!addr.isDefault
    }));
  }, [user]);

  // Wishlist state
  const [wishlist, setWishlist] = useState([
    {
      id: 'wish-1',
      title: 'Katan Banarasi Crimson',
      price: 18900,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500'
    },
    {
      id: 'wish-2',
      title: 'Monsoon Diamond Pendant',
      price: 24500,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'
    },
    {
      id: 'wish-3',
      title: 'Rose Attar Luxe 50ml',
      price: 4250,
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500'
    }
  ]);

  // Map Backend Wishlist if available
  const wishlistArray = Array.isArray(wishlistResponse?.data?.products)
    ? wishlistResponse.data.products
    : Array.isArray(wishlistResponse?.products)
      ? wishlistResponse.products
      : Array.isArray(wishlistResponse?.data)
        ? wishlistResponse.data
        : Array.isArray(wishlistResponse)
          ? wishlistResponse
          : null;

  const dbWishlist = wishlistArray ? wishlistArray.map((w: any) => {
    const p = w.productId || w;
    return {
      id: p._id || p.id || w._id,
      slug: p.slug || p._id || p.id,
      title: p.title || 'Charulata Item',
      price: p.salePrice || p.price || 12000,
      image: p.productImages?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500'
    };
  }) : null;
  const activeWishlist = dbWishlist !== null ? dbWishlist : wishlist;

  // Map Real Backend Notifications
  const notificationsArray = useMemo(() => {
    return Array.isArray(notificationsResponse?.data?.notifications)
      ? notificationsResponse.data.notifications
      : Array.isArray(notificationsResponse?.notifications)
        ? notificationsResponse.notifications
        : Array.isArray(notificationsResponse?.data)
          ? notificationsResponse.data
          : Array.isArray(notificationsResponse)
            ? notificationsResponse
            : [];
  }, [notificationsResponse]);

  const activeNotifications = useMemo(() => {
    return notificationsArray.map((n: any) => {
      const createdAt = n.createdAt ? new Date(n.createdAt) : null;
      let timeStr = 'Just now';
      if (createdAt) {
        const diffMs = Date.now() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) timeStr = 'Just now';
        else if (diffMins < 60) timeStr = `${diffMins}m ago`;
        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
        else if (diffDays === 1) timeStr = 'Yesterday';
        else if (diffDays < 7) timeStr = `${diffDays}d ago`;
        else timeStr = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return {
        id: n._id || n.id,
        title: n.title || 'Charulata Alert',
        desc: n.message || n.desc || 'Status update on your account.',
        time: timeStr,
        createdAt: n.createdAt,
        isRead: !!n.isRead
      };
    });
  }, [notificationsArray]);

  // Settings state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Computations
  const completedOrders = orders.filter((o: any) => o.deliveryStatus === 'Delivered');
  const lifetimeSpend = completedOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);
  const ordersCount = orders.length;

  const handleDownloadPDFInvoice = (order: any) => {
    downloadInvoicePdf(order);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    const imgUrl = profileForm.profileImage ? profileForm.profileImage.trim() : '';
    if (imgUrl) {
      saveUserAvatarLocally(user, imgUrl);
    }
    const payload: any = {
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      profileImage: imgUrl,
      avatar: imgUrl,
      avatarUrl: imgUrl,
      image: imgUrl,
      photo: imgUrl,
      gender: profileForm.gender.toLowerCase(),
    };
    if (profileForm.dateOfBirth) {
      payload.dateOfBirth = profileForm.dateOfBirth;
    }

    try {
      const res = await updateProfile(payload).unwrap();
      const updatedUser = res?.data?.user || res?.data || res?.user || res;
      if (updatedUser) {
        dispatch(updateUser(updatedUser));
      } else {
        dispatch(updateUser({ ...user, ...payload }));
      }
      setIsEditing(false);
      toast.success('Profile updated successfully! 🎉');
    } catch (err: any) {
      console.warn('Update profile fallback applied:', err);
      dispatch(updateUser({ 
        ...user, 
        ...payload
      }));
      setIsEditing(false);
      toast.success('Profile saved!');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine.trim()) {
      toast.error('Please enter delivery address details.');
      return;
    }
    if (!newAddress.district.trim()) {
      toast.error('Please enter district name.');
      return;
    }

    try {
      await addAddressMutation({
        addressType: newAddress.label.toLowerCase(),
        recipientName: newAddress.recipientName.trim() || user?.name || 'Customer',
        recipientPhone: newAddress.recipientPhone.trim() || user?.phone || '',
        district: newAddress.district.trim(),
        addressLine: newAddress.addressLine.trim(),
        isDefault: newAddress.isDefault || activeAddresses.length === 0
      }).unwrap();

      toast.success('Address added successfully!');
      setShowAddAddressModal(false);
      setNewAddress({
        label: 'Home',
        recipientName: user?.name || '',
        recipientPhone: user?.phone || '',
        district: '',
        addressLine: '',
        isDefault: false
      });
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || 'Failed to add address.';
      toast.error(errMsg);
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await deleteAddressMutation(id).unwrap();
      toast.success('Address removed successfully');
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.message || 'Failed to remove address';
      toast.error(errMsg);
    }
  };

  const handleRemoveWishlist = async (id: string) => {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      setWishlist(wishlist.filter(w => w.id !== id));
      toast.success('Item removed from wishlist');
      return;
    }
    try {
      await removeFromWishlistMutation(id).unwrap();
      toast.success('Item removed from wishlist');
    } catch (err) {
      setWishlist(wishlist.filter(w => w.id !== id));
      toast.success('Item removed from wishlist');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.currentPassword && passwordForm.newPassword) {
      try {
        await changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }).unwrap();
        setPasswordForm({ currentPassword: '', newPassword: '' });
        toast.success('Password updated successfully!');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to update password');
      }
    } else {
      toast.warning('Please fill in all fields.');
    }
  };

  if (isProfileLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-background text-muted-foreground">
        <Loader2 className="h-9 w-9 animate-spin text-primary mb-2" />
        <p className="text-sm font-semibold">Loading account profile...</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CU';

  // Synchronized Avatar across banner, form, and header
  const currentAvatar = profileForm.profileImage || getUserAvatarUrl(user) || getFallbackAvatarUrl(user);

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
    <div className="flex-1 w-full bg-background text-foreground min-h-screen py-8 sm:py-12 font-sans overflow-x-hidden">
      
      {/* Top Banner Header */}
      <div className="max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mb-6 sm:mb-8">
        <div className="bg-card border border-border p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative group shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 border-2 border-primary/40 overflow-hidden relative flex items-center justify-center shadow-md bg-muted">
                <img
                  src={currentAvatar}
                  alt={user?.name || 'User'}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Direct Quick Upload / Change Photo Camera Badge */}
              <label
                className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-xl shadow-lg border-2 border-card hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Click to upload/change photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingAvatar}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif tracking-tight">
                  Welcome back, {user.name?.split(' ')[0] || 'Customer'}
                </h1>
                <Sparkles size={20} className="text-primary animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {['super_admin', 'admin', 'staff'].includes(user?.role || '') && (
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition shadow-md"
              >
                <Sparkles size={14} />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm">
          <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider px-2">
            Account Navigation
          </p>

          <nav className="flex flex-col space-y-1">
            {[
              { id: 'profile', label: 'My Profile', icon: UserIcon },
              { id: 'orders', label: 'My Orders', icon: History, count: ordersCount },
              { id: 'addresses', label: 'Addresses', icon: MapPin, count: activeAddresses.length },
              { id: 'wishlist', label: 'Wishlist', icon: Heart, count: activeWishlist.length },
              { id: 'notifications', label: 'Notifications', icon: Bell, count: activeNotifications.length },
              { id: 'settings', label: 'Security & Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/profile?tab=${tab.id}`);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-muted-foreground'} />
                    <span>{tab.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {tab.count !== undefined && (
                      <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full transition-all ${
                        isActive 
                          ? 'bg-white/25 text-white border border-white/30 shadow-xs' 
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    <ChevronRight size={14} className="opacity-40" />
                  </div>
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors mt-3 border-t border-border pt-3 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out Account</span>
            </button>
          </nav>
        </aside>

        {/* Right Tab Content */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-serif">Personal Profile Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your personal information and profile picture</p>
                </div>

                {isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-md"
                  >
                    {isUpdatingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Save Changes</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-muted text-foreground hover:bg-primary hover:text-white rounded-xl text-xs font-bold border border-border transition cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Full Name *</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                  ) : (
                    <p className="font-bold text-foreground bg-muted/50 border border-border/60 p-3 rounded-xl">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Email Address</label>
                  <p className="font-mono font-bold text-muted-foreground bg-muted/50 border border-border/60 p-3 rounded-xl">{user.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                    />
                  ) : (
                    <p className="font-mono font-bold text-foreground bg-muted/50 border border-border/60 p-3 rounded-xl">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Gender</label>
                  {isEditing ? (
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="font-bold capitalize text-foreground bg-muted/50 border border-border/60 p-3 rounded-xl">{user.gender || 'Not specified'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="col-span-2 space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                        Profile Photo
                      </label>
                      {profileForm.profileImage && (
                        <button
                          type="button"
                          onClick={() => setProfileForm(prev => ({ ...prev, profileImage: '' }))}
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>

                    {/* Drag & Drop / Click to Upload Box */}
                    <div className="relative group">
                      <label className={`relative flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                        profileForm.profileImage
                          ? 'bg-primary/5 border-primary/40 hover:border-primary'
                          : 'bg-muted/40 hover:bg-muted/60 border-border hover:border-primary/50'
                      }`}>
                        <div className="flex items-center space-x-4">
                          {/* Avatar Thumbnail */}
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden border-2 border-border shadow-xs bg-muted shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {currentAvatar ? (
                              <img
                                src={currentAvatar}
                                alt="Profile Preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Camera size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            )}

                            {isUploadingAvatar && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                                <Loader2 size={20} className="animate-spin text-white" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-foreground text-xs sm:text-sm">
                                {isUploadingAvatar
                                  ? 'Uploading your photo...'
                                  : profileForm.profileImage
                                  ? 'Photo selected & ready'
                                  : 'Upload profile photo'}
                              </span>
                              {profileForm.profileImage && !isUploadingAvatar && (
                                <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <Check size={10} className="mr-1" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Click to choose image from your computer (JPG, PNG, WebP up to 5MB)
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-0">
                          <span className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-extrabold rounded-xl shadow-md hover:opacity-90 transition group-active:scale-95">
                            {isUploadingAvatar ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <UploadCloud size={14} />
                            )}
                            <span>{isUploadingAvatar ? 'Uploading...' : 'Browse PC File'}</span>
                          </span>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingAvatar}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Optional direct URL input */}
                    <details className="text-[11px] text-muted-foreground group">
                      <summary className="cursor-pointer font-bold hover:text-foreground inline-flex items-center space-x-1 py-1">
                        <span>🔗 Or paste image URL directly</span>
                      </summary>
                      <div className="pt-2">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={profileForm.profileImage}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, profileImage: e.target.value }))}
                          className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:border-primary outline-none transition"
                        />
                      </div>
                    </details>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-serif">My Order History</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Track purchase history, delivery statuses, and invoices</p>
                </div>
              </div>

              {isOrdersLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="animate-spin text-primary h-8 w-8 mr-2" />
                  <span className="text-xs font-bold text-muted-foreground">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-bold text-foreground">No orders placed yet</p>
                  <Link href="/search" className="inline-flex items-center px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => {
                    const orderId = order.orderId || `#${order._id?.slice(-8)}`;
                    const total = order.totalAmount || 0;
                    const itemsCount = order.items?.length || 0;
                    const advPaid = Number(order.advanceAmount || order.advancePayment || 0);
                    const dueCOD = Math.max(0, total - advPaid);

                    return (
                      <div key={order._id} className="bg-muted/40 border border-border p-5 rounded-2xl space-y-4 hover:border-primary/40 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
                          <div>
                            <span className="font-mono font-extrabold text-primary text-sm">{orderId}</span>
                            <span className="text-xs text-muted-foreground ml-3">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[order.deliveryStatus] || 'bg-muted text-muted-foreground border-border'}`}>
                              {order.deliveryStatus}
                            </span>
                            
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold text-foreground bg-card hover:bg-muted rounded-lg border border-border transition cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Invoice</span>
                            </button>

                            <button
                              onClick={() => handleDownloadPDFInvoice(order)}
                              className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-lg shadow-xs transition cursor-pointer"
                            >
                              <Download size={13} />
                              <span>PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-foreground">{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'} Purchased</p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[11px] text-muted-foreground">Payment:</span>
                              <span className="font-bold text-foreground uppercase text-[11px] bg-muted border border-border px-1.5 py-0.2 rounded">
                                {order.paymentMethod || 'COD'}
                              </span>
                              {advPaid > 0 && (
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                                  Adv: ৳{advPaid.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-extrabold block">
                              {advPaid > 0 ? 'Due on Delivery (COD)' : 'Total Amount'}
                            </span>
                            <span className="text-base font-extrabold text-primary font-mono">
                              ৳{(advPaid > 0 ? dueCOD : total).toLocaleString()}
                            </span>
                            {advPaid > 0 && (
                              <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                                Total Bill: ৳{total.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-serif">Saved Delivery Addresses</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage home & office shipping locations</p>
                </div>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add New Address</span>
                </button>
              </div>

              {activeAddresses.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Saved Delivery Addresses</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    You haven't saved any shipping locations yet. Add a new address or place an order to save your delivery details automatically.
                  </p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAddresses.map((addr: any) => (
                    <div key={addr.id} className="bg-card border border-border p-5 rounded-2xl space-y-2.5 relative group hover:border-primary/40 transition shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Remove Address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-0.5 pt-1">
                        <p className="text-xs font-bold text-foreground">{addr.recipientName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono font-medium">{addr.recipientPhone}</p>
                        <p className="text-xs text-foreground/90 font-medium leading-relaxed pt-1">{addr.addressLine}, <span className="font-bold">{addr.district}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-serif">Saved Wishlist Collection</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeWishlist.length} items saved for later</p>
                </div>
              </div>

              {activeWishlist.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm font-bold text-foreground">Your wishlist is empty</p>
                  <Link href="/search" className="inline-flex items-center px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition">
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeWishlist.map((item: any) => (
                    <div key={item.id} className="bg-muted/30 border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-primary/40 transition">
                      <div className="h-44 bg-muted relative">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                        <button
                          onClick={() => handleRemoveWishlist(item.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-background/80 text-rose-500 rounded-full border border-border hover:bg-rose-500 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="text-xs font-bold text-foreground font-serif line-clamp-1">{item.title}</h3>
                        <p className="text-sm font-extrabold text-primary">৳{(item.price || 0).toLocaleString()}</p>
                        
                        <Link
                          href={`/products/${item.slug || item.id}`}
                          className="w-full inline-flex items-center justify-center space-x-1 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition"
                        >
                          <ShoppingBag size={14} />
                          <span>View Product</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground font-serif">Account Notifications</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Order updates, special promotions, and alerts</p>
                </div>
              </div>

              {activeNotifications.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
                    <Bell className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">No Account Notifications</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    You have no notifications right now. Order confirmations, status updates, and account alerts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeNotifications.map((notif: any) => (
                    <div key={notif.id} className="bg-card border border-border p-4 rounded-2xl flex items-start space-x-3.5 hover:border-primary/40 transition shadow-2xs">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <Bell size={16} />
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground">{notif.title}</p>
                          <span className="text-[10px] text-muted-foreground font-mono font-bold">{notif.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{notif.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-extrabold text-foreground font-serif">Account Security Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Update your password and login credentials</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isChangingPassword ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                  <span>Change Password</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground font-serif">Add New Shipping Address</h3>
              <button onClick={() => setShowAddAddressModal(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Address Label</label>
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition cursor-pointer"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka, Cumilla..."
                    value={newAddress.district}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newAddress.recipientName}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01700000000"
                    value={newAddress.recipientPhone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Full Delivery Address *</label>
                <textarea
                  rows={2.5}
                  required
                  placeholder="House #, Road #, Area name, Landmarks..."
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none transition resize-none font-medium"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary border-border cursor-pointer h-4 w-4"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-foreground cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition cursor-pointer shadow-md"
                >
                  <Check size={15} />
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-foreground font-serif">Order Summary & Invoice</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/50 border border-border/60 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-0.5">Order ID</p>
                  <p className="text-sm font-mono font-extrabold text-primary">{selectedOrder.orderId}</p>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-0.5">Status</p>
                  <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${statusColors[selectedOrder.deliveryStatus] || ''}`}>
                    {selectedOrder.deliveryStatus}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-0.5">Recipient Name</p>
                  <p className="text-xs text-foreground font-bold">{selectedOrder.shippingAddress?.recipientName || user.name}</p>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-0.5">Recipient Phone</p>
                  <p className="text-xs text-foreground font-mono font-bold">{selectedOrder.shippingAddress?.recipientPhone || user.phone || 'N/A'}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-0.5">Delivery Address</p>
                  <p className="text-xs text-foreground font-medium">{selectedOrder.shippingAddress?.addressLine}, {selectedOrder.shippingAddress?.district}</p>
                </div>
              </div>

              {/* Purchased Items */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-2">Purchased Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const itemImg = item.product?.productImages?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                    return (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0 gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden relative shrink-0">
                            <Image src={itemImg} alt="Item" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{item.product?.title || `Product #${idx + 1}`}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              Qty: {item.quantity} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-extrabold text-foreground shrink-0">৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const advPaid = Number(selectedOrder.advanceAmount || selectedOrder.advancePayment || 0);
                const dueCOD = Math.max(0, (selectedOrder.totalAmount || 0) - advPaid);

                return (
                  <div className="border-t border-border pt-4 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-bold text-foreground font-mono">৳{(selectedOrder.subTotal || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping Fee</span><span className="font-bold text-foreground font-mono">৳{(selectedOrder.shippingCharge || 0).toLocaleString()}</span></div>
                    {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold"><span>Discount</span><span className="font-mono">-৳{selectedOrder.discount.toLocaleString()}</span></div>}
                    
                    <div className="flex justify-between text-xs font-extrabold border-t border-border pt-2 text-foreground">
                      <span>Total Order Value</span>
                      <span className="font-mono font-bold">৳{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    </div>

                    {advPaid > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Advance Paid ({selectedOrder.paymentMethod?.toUpperCase() || 'ADVANCE'})</span>
                        <span className="font-mono">-৳{advPaid.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-black border-t-2 border-primary/30 pt-3 bg-primary/5 -mx-6 -mb-6 p-4 rounded-b-3xl">
                      <div>
                        <p className="text-xs font-black uppercase text-primary tracking-wider">{advPaid > 0 ? 'Due on Delivery (COD)' : 'Total Bill Payable (COD)'}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{advPaid > 0 ? 'Pay this amount to courier on delivery' : 'Pay full amount on delivery'}</p>
                      </div>
                      <span className="text-primary font-mono text-xl font-black">৳{(advPaid > 0 ? dueCOD : (selectedOrder.totalAmount || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                
                <button
                  onClick={() => handleDownloadPDFInvoice(selectedOrder)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition cursor-pointer shadow-md"
                >
                  <Download size={14} />
                  <span>Download PDF Invoice</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-background text-muted-foreground">
        <Loader2 className="h-9 w-9 animate-spin text-primary mb-2" />
        <p className="text-sm font-semibold">Loading profile...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
