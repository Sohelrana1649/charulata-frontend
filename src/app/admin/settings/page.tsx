'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  Settings, 
  User, 
  Lock, 
  Truck, 
  ShieldCheck, 
  Loader2,
  Check,
  Eye,
  EyeOff,
  Edit,
  X,
  Phone,
  Mail,
  Store,
  CreditCard,
  ImageIcon,
  FileText,
  Save,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useUpdateProfileMutation } from '@/store/api/authApi';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/store/api/settingsApi';
import { updateUser } from '@/store/authSlice';
import Image from '@/components/SafeImage';

export default function AdminSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const { data: settingsData, isLoading: isSettingsLoading, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  
  const [activeTab, setActiveTab] = useState<'advance' | 'logos' | 'shipping' | 'store' | 'profile'>('advance');

  // Form states for Store Settings
  const [settingsForm, setSettingsForm] = useState({
    navbarLogo: '/logo.png',
    footerLogo: '/logo.png',
    storeName: 'Charulata Lifestyle',
    storePhone: '+880 1620-556299',
    storeEmail: 'support@charulatalifestyle.com',
    storeAddress: 'Banani, Dhaka - 1213, Bangladesh',
    facebookUrl: 'https://facebook.com/charulatalifestyle',
    advancePaymentAmount: 200,
    requireAdvancePayment: true,
    paymentPhoneNumber: '01620-556299',
    bkashNumber: '01620-556299',
    nagadNumber: '01620-556299',
    rocketNumber: '01620-556299',
    enableBkash: true,
    enableNagad: true,
    enableRocket: true,
    enableCOD: true,
    paymentInstructions: 'বিকাশ, নগদ বা রকেটের মাধ্যমে নির্ধারিত অগ্রিম টাকা সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।',
    paymentMethodsInfo: '(বিকাশ/নগদ/রকেট পার্সোনাল)',
    prepaymentNoticeTitle: 'অর্ডার করার নিয়ম',
    prepaymentRule1: 'প্রতিটি পণ্য অর্ডার করতে অগ্রিম হিসেবে আমাদের ২০০ টাকা সেন্ড মানি করতে হবে। এই টাকাটা টোটাল বিল থেকে বাদ দেওয়া হবে।',
    prepaymentRule2: 'দ্রুত ডেলিভারি নিশ্চিত করার জন্য সঠিক ভাবে আপনার ঠিকানা লিখুন (থানা এবং জেলা উল্লেখ করুন)।',
    prepaymentRule3: 'টাকা পাঠানোর পর পেমেন্ট নম্বর এবং Transaction ID (TrxID) নিচের ফর্মে লিখুন।',
    prepaymentHelpText: 'যেকোনো সমস্যার জন্য আমাদের 01620-556299 নম্বরে ফোন করুন।',
    insideDhakaCharge: 70,
    outsideDhakaCharge: 130,
    freeShippingMinAmount: 3000,
  });

  // Load existing settings when API returns
  useEffect(() => {
    if (settingsData?.data) {
      setSettingsForm((prev) => ({
        ...prev,
        ...settingsData.data,
        requireAdvancePayment: settingsData.data.requireAdvancePayment !== false,
      }));
    }
  }, [settingsData]);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });

  const handleOpenEditModal = () => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
    });
    setShowEditModal(true);
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetKey: 'navbarLogo' | 'footerLogo') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, [targetKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm).unwrap();
      refetchSettings();
      toast.success('Store settings updated successfully! 🎉');
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      toast.error(err?.data?.message || 'Failed to update store settings');
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfile({
        name: editForm.name,
        phone: editForm.phone,
        profileImage: editForm.profileImage,
      }).unwrap();
      if (res?.data || res) {
        dispatch(updateUser((res.data?.user || res.data || res.user || res) as any));
      }
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Failed to update profile details');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsChangingPass(true);
    try {
      const token = localStorage.getItem('charulata_token');
      let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
      if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
        baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
      }
      const res = await fetch(`${baseApiUrl}/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Store Settings</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              Admin Control Panel
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Manage advance payment rules, navbar/footer logos, delivery charges, and store contact info.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar Tabs */}
        <div className="md:col-span-1 space-y-1">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-sm space-y-1">
            {[
              { id: 'advance', label: 'Advance & Order Rules', icon: <CreditCard size={16} /> },
              { id: 'logos', label: 'Navbar & Footer Logos', icon: <ImageIcon size={16} /> },
              { id: 'shipping', label: 'Default Delivery Rates', icon: <Truck size={16} /> },
              { id: 'store', label: 'Store Contact Info', icon: <Store size={16} /> },
              { id: 'profile', label: 'Security & Profile', icon: <ShieldCheck size={16} /> },
            ].map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB 1: ADVANCE PAYMENT & ORDER RULES */}
          {activeTab === 'advance' && (
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-border pb-4">
                <CreditCard className="text-primary h-5 w-5" />
                <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">
                  Advance Payment Amount & Order Instructions ("অর্ডার করার নিয়ম")
                </h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                
                {/* Advance Payment Master Toggle Switch Card */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xs sm:text-sm text-foreground">
                        Require Advance Payment (bKash / Nagad / Rocket)
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        settingsForm.requireAdvancePayment
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}>
                        {settingsForm.requireAdvancePayment ? 'Advance Payment Enabled' : 'Cash on Delivery Only (Free)'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {settingsForm.requireAdvancePayment
                        ? 'Customers must send advance payment (e.g. ৳200) via bKash/Nagad/Rocket and provide TrxID at checkout.'
                        : 'Advance payment requirement is disabled. Customers can place orders directly with Cash on Delivery without advance payment.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, requireAdvancePayment: !settingsForm.requireAdvancePayment })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settingsForm.requireAdvancePayment ? 'bg-primary' : 'bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        settingsForm.requireAdvancePayment ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                      Advance Payment Amount (BDT ৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={settingsForm.advancePaymentAmount === 0 ? '' : settingsForm.advancePaymentAmount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, advancePaymentAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-bold focus:border-primary outline-none transition"
                      placeholder="e.g. 200 (or 0 for no advance)"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Set ৳0 if no advance is required. Set ৳100, ৳200, ৳300, ৳500 etc. for required advance.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                      Master Help Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.paymentPhoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymentPhoneNumber: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-bold focus:border-primary outline-none transition"
                      placeholder="01620-556299"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Default fallback help & payment phone number.
                    </p>
                  </div>
                </div>

                {/* Individual Payment Numbers */}
                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Manual Payment Numbers (bKash / Nagad / Rocket)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">bKash Number</label>
                      <input
                        type="text"
                        value={settingsForm.bkashNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono font-bold focus:border-primary outline-none transition"
                        placeholder="01620-556299"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Nagad Number</label>
                      <input
                        type="text"
                        value={settingsForm.nagadNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono font-bold focus:border-primary outline-none transition"
                        placeholder="01620-556299"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Rocket Number</label>
                      <input
                        type="text"
                        value={settingsForm.rocketNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono font-bold focus:border-primary outline-none transition"
                        placeholder="01620-556299"
                      />
                    </div>
                  </div>
                </div>

                {/* Enable / Disable Payment Methods Toggles */}
                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Payment Method Status (Enable / Disable)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* bKash Toggle */}
                    <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">bKash</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableBkash !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableBkash: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                    </div>
                    {/* Nagad Toggle */}
                    <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Nagad</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableNagad !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableNagad: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                    </div>
                    {/* Rocket Toggle */}
                    <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Rocket</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableRocket !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableRocket: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                    </div>
                    {/* COD Toggle */}
                    <div className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">COD</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableCOD !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableCOD: e.target.checked })}
                        className="h-4 w-4 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Instructions Textarea */}
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                    Payment Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.paymentInstructions || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, paymentInstructions: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    placeholder="bKash/Nagad/Rocket instructions shown at checkout..."
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Order Rules Steps ("অর্ডার করার নিয়ম")
                  </h3>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground mb-1">
                      Section Header Title
                    </label>
                    <input
                      type="text"
                      value={settingsForm.prepaymentNoticeTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaymentNoticeTitle: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold focus:border-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground mb-1">
                      Rule Step 1 Text
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.prepaymentRule1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaymentRule1: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground mb-1">
                      Rule Step 2 Text
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.prepaymentRule2}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaymentRule2: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground mb-1">
                      Rule Step 3 Text
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.prepaymentRule3}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaymentRule3: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-foreground mb-1">
                      Helpline Call Support Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.prepaymentHelpText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, prepaymentHelpText: e.target.value })}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingSettings}
                    className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isUpdatingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Save size={15} />}
                    <span>Save Advance & Order Rules Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LOGOS & BRANDING */}
          {activeTab === 'logos' && (
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 border-b border-border pb-4">
                <ImageIcon className="text-primary h-5 w-5" />
                <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Navbar & Footer Branding Logos</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Navbar Logo Field & Preview */}
                <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Navbar Brand Logo
                    </label>
                    <span className="text-[10px] text-muted-foreground font-semibold">Used on Top Navigation Header</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-16 w-48 bg-zinc-900 rounded-xl border border-border p-2 flex items-center justify-center shrink-0">
                      {settingsForm.navbarLogo ? (
                        <Image src={settingsForm.navbarLogo} alt="Navbar Logo Preview" width={180} height={50} className="max-h-full w-auto object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No logo set</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={settingsForm.navbarLogo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, navbarLogo: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:border-primary outline-none transition"
                        placeholder="Image URL (e.g. /images/newlogo.png)"
                      />
                      <label className="block text-[11px] text-primary font-bold cursor-pointer hover:underline">
                        Or select logo file from PC
                        <input type="file" accept="image/*" onChange={(e) => handleLogoFileUpload(e, 'navbarLogo')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Logo Field & Preview */}
                <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Footer Brand Logo
                    </label>
                    <span className="text-[10px] text-muted-foreground font-semibold">Used on Footer Section</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-16 w-48 bg-zinc-950 rounded-xl border border-border p-2 flex items-center justify-center shrink-0">
                      {settingsForm.footerLogo ? (
                        <Image src={settingsForm.footerLogo} alt="Footer Logo Preview" width={180} height={50} className="max-h-full w-auto object-contain brightness-110" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No logo set</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={settingsForm.footerLogo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, footerLogo: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:border-primary outline-none transition"
                        placeholder="Image URL (e.g. /images/newlogo.png)"
                      />
                      <label className="block text-[11px] text-primary font-bold cursor-pointer hover:underline">
                        Or select logo file from PC
                        <input type="file" accept="image/*" onChange={(e) => handleLogoFileUpload(e, 'footerLogo')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdatingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Save size={15} />}
                  <span>Save Logos Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Shipping Defaults */}
          {activeTab === 'shipping' && (
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-border pb-4">
                <Truck className="text-primary h-5 w-5" />
                <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Default Shipping & Delivery Rates</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Inside Dhaka Charge (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={settingsForm.insideDhakaCharge === 0 ? '' : settingsForm.insideDhakaCharge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, insideDhakaCharge: e.target.value === '' ? 0 : Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Outside Dhaka Charge (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={settingsForm.outsideDhakaCharge === 0 ? '' : settingsForm.outsideDhakaCharge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, outsideDhakaCharge: e.target.value === '' ? 0 : Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Free Shipping Minimum Spend (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={settingsForm.freeShippingMinAmount === 0 ? '' : settingsForm.freeShippingMinAmount}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingMinAmount: e.target.value === '' ? 0 : Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdatingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                  <span>Save Shipping Preferences</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Store Contact & Branding Info */}
          {activeTab === 'store' && (
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-border pb-4">
                <Store className="text-primary h-5 w-5" />
                <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Store Contact Information</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Store Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-serif font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Customer Support Phone *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storePhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storePhone: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Customer Support Email *</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.storeEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeEmail: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Physical Store Address</label>
                  <textarea
                    rows={2}
                    value={settingsForm.storeAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Facebook Page URL</label>
                  <input
                    type="url"
                    value={settingsForm.facebookUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdatingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                  <span>Save Store Information</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: Profile & Security */}
          {activeTab === 'profile' && (
            <div className="space-y-3 sm:space-y-6">
              
              {/* Profile Card */}
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center space-x-2">
                    <User className="text-primary h-5 w-5" />
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Administrative Profile</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-muted hover:bg-primary hover:text-white rounded-xl border border-border transition cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Edit Details</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="h-20 w-20 rounded-full bg-muted border-2 border-primary/40 overflow-hidden relative flex items-center justify-center shrink-0 shadow-md">
                    {user?.profileImage ? (
                      <Image src={user.profileImage} alt={user.name} fill className="object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-primary font-serif">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full text-[11px] sm:text-xs">
                    <div className="bg-muted/50 border border-border/60 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Full Name</p>
                      <p className="text-xs text-foreground font-bold mt-0.5">{user?.name || 'Store Admin'}</p>
                    </div>

                    <div className="bg-muted/50 border border-border/60 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Email Address</p>
                      <p className="text-xs text-foreground font-mono font-bold mt-0.5">{user?.email || 'admin@charulata.com'}</p>
                    </div>

                    <div className="bg-muted/50 border border-border/60 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Phone Number</p>
                      <p className="text-xs text-foreground font-mono font-bold mt-0.5">{user?.phone || 'Not Provided'}</p>
                    </div>

                    <div className="bg-muted/50 border border-border/60 p-3 rounded-xl">
                      <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">Access Role</p>
                      <span className="inline-block mt-0.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {user?.role || 'administrator'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-border pb-4">
                  <Lock className="text-primary h-5 w-5" />
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground font-serif">Security & Password</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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

                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Confirm New Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isChangingPass ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground font-serif">Edit Admin Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfileDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="+8801700000000"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Avatar Image URL / Upload</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editForm.profileImage}
                  onChange={(e) => setEditForm(prev => ({ ...prev, profileImage: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none transition"
                />

                <div className="mt-2">
                  <label className="block text-[10px] text-muted-foreground font-bold cursor-pointer hover:underline">
                    Or select file from PC
                    <input type="file" accept="image/*" onChange={handleModalFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isUpdatingProfile ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
