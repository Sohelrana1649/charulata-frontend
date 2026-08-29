'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetAdminOrdersQuery,
  useGetSubscribersQuery,
  useGetContactMessagesQuery,
  useMarkContactMessageReadMutation,
  useDeleteContactMessageMutation,
  useSendPromotionalEmailMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useCreateAdminUserMutation
} from '@/store/api/adminApi';
import { useRegisterMutation } from '@/store/api/authApi';
import { 
  Loader2, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Check, 
  Trash2, 
  Globe, 
  Send, 
  UserCheck, 
  ShieldAlert, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  ChevronDown, 
  X, 
  UserCog, 
  AlertTriangle,
  UserPlus,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  Upload
} from 'lucide-react';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { getFallbackAvatarUrl, defaultTeamAvatars } from '@/utils/avatarHelper';
import { toast } from 'react-toastify';
import { useRole } from '@/hooks/useRole';
import RoleGuard from '@/components/admin/RoleGuard';

export default function AdminCustomersPage() {
  const { isSuperAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<'ordering' | 'subscribers' | 'contacts' | 'users' | 'team'>('ordering');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmRoleModal, setConfirmRoleModal] = useState<{
    isOpen: boolean;
    user: { _id: string; name: string; email: string; role: string } | null;
    targetRole: string;
  }>({
    isOpen: false,
    user: null,
    targetRole: ''
  });
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: '',
    profileImage: '',
  });
  const [createAdminUser, { isLoading: isCreatingTeamMember }] = useCreateAdminUserMutation();
  const [uploadImage, { isLoading: isUploadingPhoto }] = useUploadImageMutation();
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  React.useEffect(() => {
    if (!isSuperAdmin && (activeTab === 'users' || activeTab === 'team')) {
      setActiveTab('ordering');
    }
  }, [isSuperAdmin, activeTab]);

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');

  // Current logged in user info
  const currentUser = useSelector((state: any) => state.auth.user);

  // 1. Ordering Customers Data
  const { data: ordersResponse, isLoading: ordersLoading } = useGetAdminOrdersQuery({});
  const orders = ordersResponse?.data?.orders || ordersResponse?.orders || ordersResponse?.data || [];

  // 2. Newsletter Subscribers Data
  const { data: subscribersResponse, isLoading: subscribersLoading } = useGetSubscribersQuery({}, { skip: activeTab !== 'subscribers' });
  const subscribers = subscribersResponse?.data?.subscribers || subscribersResponse?.subscribers || [];

  // 3. Contact Messages Data
  const { data: contactsResponse, isLoading: contactsLoading } = useGetContactMessagesQuery({}, { skip: activeTab !== 'contacts' });
  const contacts = contactsResponse?.data?.messages || contactsResponse?.messages || [];

  // 4. Registered Users Data
  const { data: usersResponse, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery({}, { skip: !isSuperAdmin });
  const users = usersResponse?.data?.users || usersResponse?.users || [];
  const teamMembers = users.filter((u: any) => ['staff', 'admin', 'super_admin'].includes(u.role));
  const registeredCustomers = users.filter((u: any) => !['staff', 'admin', 'super_admin'].includes(u.role) || u.role === 'customer');

  // Mutations
  const [markAsRead] = useMarkContactMessageReadMutation();
  const [deleteContact] = useDeleteContactMessageMutation();
  const [sendPromotion, { isLoading: isSendingPromo }] = useSendPromotionalEmailMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  // Aggregate unique customers from order history
  const customerMap: Record<string, any> = {};
  if (Array.isArray(orders)) {
    orders.forEach((order: any) => {
      const phone = order.shippingAddress?.recipientPhone;
      if (!phone) return;
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: order.shippingAddress?.recipientName || order.customer?.name || 'Unknown Customer',
          phone: phone,
          district: order.shippingAddress?.district || 'N/A',
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt
        };
      }
      customerMap[phone].orderCount += 1;
      customerMap[phone].totalSpent += order.totalAmount || 0;
      if (new Date(order.createdAt) > new Date(customerMap[phone].lastOrderDate)) {
        customerMap[phone].lastOrderDate = order.createdAt;
      }
    });
  }

  const customersList = Object.values(customerMap);

  const getUserAvatar = (user: any) => {
    return getFallbackAvatarUrl(user);
  };

  // Search filter logic
  const getFilteredData = () => {
    const term = search.toLowerCase().trim();
    if (activeTab === 'ordering') {
      return customersList.filter((c: any) =>
        c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.district.toLowerCase().includes(term)
      );
    }
    if (activeTab === 'subscribers') {
      return subscribers.filter((s: any) =>
        (s.email || '').toLowerCase().includes(term)
      );
    }
    if (activeTab === 'contacts') {
      return contacts.filter((c: any) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.message || '').toLowerCase().includes(term)
      );
    }
    if (activeTab === 'users') {
      return users.filter((u: any) =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.phone || '').includes(term) ||
        (u.role || '').toLowerCase().includes(term)
      );
    }
    if (activeTab === 'team') {
      return teamMembers.filter((u: any) =>
        (u.name || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.phone || '').includes(term) ||
        (u.role || '').toLowerCase().includes(term)
      );
    }
    return [];
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success('Marked query as read!');
    } catch (err) {
      toast.error('Failed to mark message as read');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin মেসেজ ডিলিট করতে পারবেন');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this contact query?')) return;
    try {
      await deleteContact(id).unwrap();
      toast.success('Message deleted!');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleInitiateRoleChange = (user: any, newRole: string) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin রোল পরিবর্তন করতে পারেন');
      return;
    }
    if (currentUser?._id === user._id) {
      toast.error("You can't change your own role");
      return;
    }
    if (user.role === newRole) return;
    setConfirmRoleModal({
      isOpen: true,
      user,
      targetRole: newRole
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!confirmRoleModal.user || !confirmRoleModal.targetRole) return;
    const targetUserId = confirmRoleModal.user._id;
    const targetRole = confirmRoleModal.targetRole;
    try {
      setUpdatingUserId(targetUserId);
      await updateUserRole({ userId: targetUserId, role: targetRole }).unwrap();
      toast.success(`Role for ${confirmRoleModal.user.name} changed to ${targetRole}!`);
      setConfirmRoleModal({ isOpen: false, user: null, targetRole: '' });
      refetchUsers();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const [rtkRegister, { isLoading: isRegistering }] = useRegisterMutation();

  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim() || !newTeamMember.password.trim()) {
      toast.error('Name, email, and password are required.');
      return;
    }
    if (newTeamMember.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      let createdUserId: string | null = null;

      // 1. Try dedicated admin creation endpoint first
      try {
        const directRes: any = await createAdminUser(newTeamMember).unwrap();
        createdUserId = directRes?.data?._id || directRes?._id;
      } catch (directErr: any) {
        // If /users/admin/create is not implemented on backend (404), fallback to /auth/register + role patch
        if (directErr?.status === 404 || directErr?.data?.message?.includes("Can't find")) {
          const registerRes: any = await rtkRegister({
            name: newTeamMember.name.trim(),
            identifier: newTeamMember.email.toLowerCase().trim(),
            password: newTeamMember.password,
          }).unwrap();

          createdUserId = registerRes?.data?.user?._id || registerRes?.data?._id || registerRes?.user?._id || registerRes?._id;

          // If role is staff, admin, or super_admin, patch role now
          if (newTeamMember.role !== 'customer') {
            if (createdUserId) {
              await updateUserRole({ userId: createdUserId, role: newTeamMember.role }).unwrap();
            } else {
              const refreshed = await refetchUsers();
              const found = (refreshed.data?.data?.users || refreshed.data?.users || []).find(
                (u: any) => u.email?.toLowerCase() === newTeamMember.email.toLowerCase().trim()
              );
              if (found?._id) {
                await updateUserRole({ userId: found._id, role: newTeamMember.role }).unwrap();
              }
            }
          }
        } else {
          throw directErr;
        }
      }

      toast.success(`New ${newTeamMember.role.toUpperCase()} account created successfully!`);
      setShowAddTeamModal(false);
      setNewTeamMember({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        password: '',
        profileImage: '',
      });
      refetchUsers();
    } catch (err: any) {
      console.error('Failed to create team member:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to create team member');
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject || !campaignMessage) return;
    try {
      const res = await sendPromotion({ subject: campaignSubject, message: campaignMessage }).unwrap();
      toast.success(res?.message || 'Promotional campaign email sent!');
      setCampaignSubject('');
      setCampaignMessage('');
      setShowCampaignForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send campaign email.');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Customer Hub & Inbox</h1>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Manage store buyers, email subscribers, contact queries, and user roles.
          </p>
        </div>

        {activeTab === 'subscribers' && (
          <button
            onClick={() => setShowCampaignForm(!showCampaignForm)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
          >
            <Send size={15} />
            <span>Send Email Campaign</span>
          </button>
        )}

        {activeTab === 'team' && isSuperAdmin && (
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
          >
            <UserPlus size={15} />
            <span>+ Add Team Member</span>
          </button>
        )}
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ordering', label: `Ordering Clients (${customersList.length})`, icon: <ShoppingBag size={14} /> },
          { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: <Globe size={14} /> },
          { id: 'contacts', label: `Contact Queries (${contacts.length})`, icon: <MessageSquare size={14} /> },
          ...(isSuperAdmin ? [
            { id: 'users', label: `Registered Accounts (${users.length})`, icon: <Users size={14} /> },
            { id: 'team', label: `Team & Staff (${teamMembers.length})`, icon: <ShieldCheck size={14} /> },
          ] : []),
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearch(''); }}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder={
              activeTab === 'ordering' 
                ? 'Search clients by name, phone number, or district...' 
                : activeTab === 'subscribers' 
                  ? 'Search by subscriber email address...' 
                  : activeTab === 'contacts'
                    ? 'Search by sender name, email, or message content...'
                    : 'Search registered accounts by name, email, or role...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 pl-10 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
          />
        </div>
      </div>

      {/* Promotional Campaign Drawer Form */}
      {showCampaignForm && activeTab === 'subscribers' && (
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-extrabold text-foreground font-serif">Compose Promotional Newsletter</h3>
            <button onClick={() => setShowCampaignForm(false)} className="text-muted-foreground hover:text-foreground">
              <Trash2 size={16} />
            </button>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Email Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Exclusive Eid Festival Collection 20% Discount!"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1">Email Message Content</label>
              <textarea
                rows={4}
                required
                placeholder="Write campaign announcement, discount codes, or promotional details..."
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSendingPromo}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white text-xs font-extrabold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSendingPromo ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Send size={14} />}
                <span>Send Campaign to All Subscribers</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        
        {/* Tab 1: Ordering Clients */}
        {activeTab === 'ordering' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Client Name</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Phone Number</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">District</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Total Orders</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Total Spend</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                      <span>Loading ordering clients...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">No ordering clients found.</td>
                  </tr>
                ) : (
                  paginatedData.map((client: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-bold text-foreground font-serif text-sm">
                        {client.name}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-mono font-bold text-primary">
                        {client.phone}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        <span className="inline-flex items-center space-x-1">
                          <MapPin size={12} className="text-muted-foreground" />
                          <span>{client.district}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-extrabold">
                        {client.orderCount} {client.orderCount === 1 ? 'order' : 'orders'}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-black text-foreground">
                        ৳{client.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        {new Date(client.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Newsletter Subscribers */}
        {activeTab === 'subscribers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Subscriber Email</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Subscribed Date</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {subscribersLoading ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                      <span>Loading newsletter subscribers...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-muted-foreground">No subscribers found.</td>
                  </tr>
                ) : (
                  paginatedData.map((sub: any) => (
                    <tr key={sub._id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-bold text-foreground font-serif text-sm">
                        {sub.email}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          <Check size={10} />
                          <span>Subscribed</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Contact Messages Inbox */}
        {activeTab === 'contacts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Sender Info</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Subject & Message</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Date</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {contactsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                      <span>Loading contact queries...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">No contact messages found.</td>
                  </tr>
                ) : (
                  paginatedData.map((msg: any) => (
                    <tr key={msg._id} className={`transition ${msg.isRead ? 'hover:bg-muted/30' : 'bg-primary/5 font-bold'}`}>
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground font-serif text-sm">{msg.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{msg.email} {msg.phone ? `· ${msg.phone}` : ''}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 max-w-sm whitespace-normal">
                        <p className="font-extrabold text-foreground text-xs">{msg.subject}</p>
                        <p className="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">{msg.message}</p>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          msg.isRead 
                            ? 'bg-muted text-muted-foreground border-border' 
                            : 'bg-primary/10 text-primary border-primary/20 animate-pulse'
                        }`}>
                          {msg.isRead ? 'Read' : 'New Query'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!msg.isRead && (
                            <button
                              onClick={() => handleMarkRead(msg._id)}
                              className="p-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg border border-primary/20 transition cursor-pointer"
                              title="Mark as Read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <RoleGuard allowedRoles={['super_admin']}>
                            <button
                              onClick={() => handleDeleteContact(msg._id)}
                              className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                              title="Delete Query"
                            >
                              <Trash2 size={14} />
                            </button>
                          </RoleGuard>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: System User Accounts (Read-Only) */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">User Name</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Email</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Phone</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Current Role</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                      <span>Loading registered users...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">No user accounts found.</td>
                  </tr>
                ) : (
                  paginatedData.map((u: any) => (
                    <tr key={u._id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-bold text-foreground font-serif text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            <img
                              src={getUserAvatar(u)}
                              alt={u.name || 'User'}
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover border border-border shadow-2xs bg-muted"
                              onError={(e: any) => {
                                const bg = u.role === 'super_admin' ? 'f43f5e' : (u.role === 'admin' ? 'f59e0b' : (u.role === 'staff' ? '3b82f6' : '64748b'));
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=${bg}&color=fff&size=128&bold=true`;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground font-serif text-sm truncate">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-mono">
                        {u.email}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-mono text-muted-foreground">
                        {u.phone || 'N/A'}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          u.role === 'super_admin'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : u.role === 'staff'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
                        }`}>
                          {u.role ? u.role.replace('_', ' ').toUpperCase() : 'CUSTOMER'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right text-muted-foreground font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Team & Staff Management (Super Admin Exclusive) */}
        {activeTab === 'team' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Team Member</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Email & Phone</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Current Role</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Joined Date</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                      <span>Loading team & staff members...</span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">No team or staff members found.</td>
                  </tr>
                ) : (
                  paginatedData.map((u: any) => (
                    <tr key={u._id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-bold text-foreground font-serif text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            <img
                              src={getUserAvatar(u)}
                              alt={u.name || 'Team Member'}
                              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-border shadow-2xs bg-muted"
                              onError={(e: any) => {
                                const bg = u.role === 'super_admin' ? 'f43f5e' : (u.role === 'admin' ? 'f59e0b' : (u.role === 'staff' ? '3b82f6' : '64748b'));
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=${bg}&color=fff&size=128&bold=true`;
                              }}
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                                u.role === 'super_admin'
                                  ? 'bg-rose-500 ring-1 ring-rose-500/20'
                                  : u.role === 'admin'
                                  ? 'bg-amber-500 ring-1 ring-amber-500/20'
                                  : 'bg-blue-500 ring-1 ring-blue-500/20'
                              }`}
                              title={`Role: ${u.role || 'staff'}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground font-serif text-sm truncate">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-mono text-xs">
                        <div>{u.email}</div>
                        {u.phone && <div className="text-[10px] opacity-75">{u.phone}</div>}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          u.role === 'super_admin'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : u.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : u.role === 'staff'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
                        }`}>
                          {u.role ? u.role.replace('_', ' ').toUpperCase() : 'STAFF'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                        {currentUser?._id === u._id ? (
                          <span 
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/20 rounded-xl cursor-default"
                            title="You can't change your own role"
                          >
                            <ShieldCheck size={13} />
                            <span>You (Active Super Admin)</span>
                          </span>
                        ) : isSuperAdmin ? (
                          <div className="flex items-center justify-end space-x-2">
                            {/* Quick Switch Button */}
                            <button
                              onClick={() => handleInitiateRoleChange(u, u.role === 'admin' ? 'staff' : 'admin')}
                              disabled={updatingUserId === u._id}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer disabled:opacity-50"
                              title={`Switch to ${u.role === 'admin' ? 'Staff' : 'Admin'}`}
                            >
                              {updatingUserId === u._id ? (
                                <Loader2 size={13} className="animate-spin text-primary" />
                              ) : (
                                <UserCheck size={13} />
                              )}
                              <span>Switch to {u.role === 'admin' ? 'Staff' : 'Admin'}</span>
                            </button>

                            {/* Dropdown for All Roles */}
                            <div className="relative inline-flex items-center">
                              <select
                                value={u.role || 'staff'}
                                onChange={(e) => handleInitiateRoleChange(u, e.target.value)}
                                disabled={updatingUserId === u._id}
                                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs disabled:opacity-50"
                                title="Change role"
                              >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="customer">Demote to Customer</option>
                              </select>
                              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <ChevronDown size={13} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic flex items-center justify-end gap-1">
                            <Lock size={12} />
                            <span>Super Admin Only</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm text-center sm:text-left min-w-0 w-full">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Showing {paginatedData.length} of {filteredData.length} entries · Page {page} of {totalPages}
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

      {/* Role Change Confirmation Modal */}
      {confirmRoleModal.isOpen && confirmRoleModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground font-serif">Confirm Role Change</h3>
                  <p className="text-xs text-muted-foreground">Admin panel access permissions</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmRoleModal({ isOpen: false, user: null, targetRole: '' })}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center space-x-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
                <img
                  src={getUserAvatar(confirmRoleModal.user)}
                  alt={confirmRoleModal.user.name}
                  className="h-10 w-10 rounded-xl object-cover border border-border shadow-2xs bg-muted"
                />
                <div className="min-w-0">
                  <p className="font-extrabold text-foreground text-sm font-serif truncate">{confirmRoleModal.user.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{confirmRoleModal.user.email}</p>
                </div>
              </div>

              <p className="text-foreground leading-relaxed">
                Are you sure you want to change this member&apos;s role from{' '}
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-md bg-muted border border-border">
                  {confirmRoleModal.user.role || 'customer'}
                </span>{' '}
                to{' '}
                <span className="font-extrabold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {confirmRoleModal.targetRole}
                </span>
                ?
              </p>
              <p className="text-[11px] text-muted-foreground">
                This will immediately update their dashboard permissions and access privileges.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRoleModal({ isOpen: false, user: null, targetRole: '' })}
                className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={updatingUserId !== null}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {updatingUserId !== null ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Confirm & Update Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Member Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground font-serif">Add New Team Member</h3>
                  <p className="text-xs text-muted-foreground">Create a staff or admin account with dashboard access</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div className="flex items-center space-x-4 p-3 bg-muted/40 border border-border rounded-2xl">
                <img
                  src={newTeamMember.profileImage || defaultTeamAvatars[0]}
                  alt="Preview"
                  className="h-12 w-12 rounded-xl object-cover border border-border shadow-xs bg-muted"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Member Photo (Optional)</p>
                  <label className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer mt-0.5">
                    {isUploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    <span>{isUploadingPhoto ? 'Uploading photo...' : 'Upload custom photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingPhoto}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
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
                            setNewTeamMember(prev => ({ ...prev, profileImage: fullUrl }));
                            toast.success('Photo uploaded!');
                          }
                        } catch (err) {
                          toast.error('Failed to upload photo');
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Hasan"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="staff@charulata.com"
                      value={newTeamMember.email}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Phone Number <span className="text-muted-foreground text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="017XXXXXXXX"
                      value={newTeamMember.phone}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>

              {/* Role & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Assign Role <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <UserCog size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                      className="w-full pl-9 pr-8 py-2.5 text-xs font-bold bg-muted/30 border border-border rounded-xl text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                    >
                      <option value="staff">Staff (Orders & Products)</option>
                      <option value="admin">Admin (Store Manager)</option>
                      <option value="super_admin">Super Admin (Full Access)</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Login Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newTeamMember.password}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, password: e.target.value })}
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-muted/30 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTeamMember || isRegistering}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isCreatingTeamMember || isRegistering ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
