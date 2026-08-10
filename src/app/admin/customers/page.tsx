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
  useUpdateUserRoleMutation
} from '@/store/api/adminApi';
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
  MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState<'ordering' | 'subscribers' | 'contacts' | 'users'>('ordering');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search, activeTab]);
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
  const { data: usersResponse, isLoading: usersLoading, refetch: refetchUsers } = useGetUsersQuery({}, { skip: activeTab !== 'users' });
  const users = usersResponse?.data?.users || usersResponse?.users || [];

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
    if (!window.confirm('Are you sure you want to delete this contact query?')) return;
    try {
      await deleteContact(id).unwrap();
      toast.success('Message deleted!');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change user role to ${newRole}?`)) return;
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      toast.success(`User role updated to ${newRole}!`);
      refetchUsers();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user role');
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
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ordering', label: `Ordering Clients (${customersList.length})`, icon: <ShoppingBag size={14} /> },
          { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: <Globe size={14} /> },
          { id: 'contacts', label: `Contact Queries (${contacts.length})`, icon: <MessageSquare size={14} /> },
          { id: 'users', label: `Registered Accounts (${users.length})`, icon: <Users size={14} /> },
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
                          <button
                            onClick={() => handleDeleteContact(msg._id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Delete Query"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: System User Accounts & Roles */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">User Name</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Email</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Phone</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Current Role</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
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
                        {u.name}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-mono">
                        {u.email}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-mono text-muted-foreground">
                        {u.phone || 'N/A'}
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          u.role === 'admin' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {u.role || 'customer'}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                        {currentUser?._id !== u._id && (
                          <button
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            disabled={isUpdatingRole}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                          >
                            <UserCheck size={13} />
                            <span>Switch to {u.role === 'admin' ? 'Customer' : 'Admin'}</span>
                          </button>
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
    </div>
  );
}
