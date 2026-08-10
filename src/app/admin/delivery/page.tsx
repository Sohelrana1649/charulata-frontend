'use client';

import React, { useState } from 'react';
import {
  useGetDeliveryZonesQuery,
  useCreateOrUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation
} from '@/store/api/adminApi';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

interface DeliveryZoneForm {
  district: string;
  shippingCharge: number;
  estimatedDeliveryTime: string;
  courierName: string;
  codAvailable: boolean;
  isActive: boolean;
}

const initialForm: DeliveryZoneForm = {
  district: '',
  shippingCharge: 0,
  estimatedDeliveryTime: '3-5 Days',
  courierName: 'Default Courier',
  codAvailable: true,
  isActive: true
};

export default function AdminDeliveryPage() {
  const { data: zonesRes, isLoading, refetch } = useGetDeliveryZonesQuery({});
  
  const [createOrUpdateZone, { isLoading: isSaving }] = useCreateOrUpdateDeliveryZoneMutation();
  const [deleteZone, { isLoading: isDeleting }] = useDeleteDeliveryZoneMutation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<DeliveryZoneForm>(initialForm);

  const zones = zonesRes?.data?.zones || zonesRes?.data || zonesRes?.zones || [];

  const handleOpenAdd = () => {
    setEditMode(false);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: any) => {
    setEditMode(true);
    setForm({
      district: zone.district || '',
      shippingCharge: zone.shippingCharge || 0,
      estimatedDeliveryTime: zone.estimatedDeliveryTime || '3-5 Days',
      courierName: zone.courierName || 'Default Courier',
      codAvailable: zone.codAvailable !== undefined ? !!zone.codAvailable : true,
      isActive: zone.isActive !== undefined ? !!zone.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.district) {
      toast.error('District name is required.');
      return;
    }
    const payload = {
      ...form,
      shippingCharge: Number(form.shippingCharge)
    };

    try {
      await createOrUpdateZone(payload).unwrap();
      toast.success('Delivery zone saved successfully!');
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save delivery zone.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      await deleteZone(id).unwrap();
      toast.success('Delivery zone deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete delivery zone.');
    }
  };

  const filteredZones = zones.filter((z: any) =>
    (z.district || '').toLowerCase().includes(search.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const paginatedZones = filteredZones.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalZones = zones.length;
  const dhakaZone = zones.find((z: any) => z.district?.toLowerCase().includes('dhaka'));
  const activeCount = zones.filter((z: any) => z.isActive !== false).length;

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Delivery & Courier Zones</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalZones} Districts
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Configure shipping fees, Cash on Delivery availability, and courier delivery windows across Bangladesh.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Delivery Zone</span>
        </button>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Configured Districts</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalZones}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Inside Dhaka Rate</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">
              ৳{dhakaZone?.shippingCharge || 70}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <MapPin size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Active Shipping Routes</p>
            <p className="text-base sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-1 font-serif">{activeCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search shipping zones by district name (e.g. Dhaka, Chittagong, Sylhet)..."
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
      </div>

      {/* Zones Table */}
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">District / Region</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Shipping Charge</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Est. Delivery Window</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Courier Partner</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Cash on Delivery</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-muted-foreground">
                    <Loader2 className="animate-spin text-primary inline mr-2 h-5 w-5" />
                    <span>Loading delivery zones...</span>
                  </td>
                </tr>
              ) : filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    No delivery zones match your search.
                  </td>
                </tr>
              ) : (
                paginatedZones.map((zone: any) => (
                  <tr key={zone._id} className="hover:bg-muted/30 transition">
                    
                    {/* District */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-bold text-foreground font-serif text-sm">
                      {zone.district}
                    </td>

                    {/* Shipping Charge */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-extrabold text-primary font-mono text-sm">
                      ৳{(zone.shippingCharge || 0).toLocaleString()}
                    </td>

                    {/* Delivery Window */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-medium">
                      <span className="inline-flex items-center space-x-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span>{zone.estimatedDeliveryTime || '2-4 Days'}</span>
                      </span>
                    </td>

                    {/* Courier Partner */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-muted-foreground font-semibold">
                      {zone.courierName || 'Steadfast / Pathao'}
                    </td>

                    {/* COD */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        zone.codAvailable !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {zone.codAvailable !== false ? 'COD Enabled' : 'Prepaid Only'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        zone.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {zone.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(zone)}
                          className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                          title="Edit Delivery Zone"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone._id)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                          title="Delete Delivery Zone"
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
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm text-center sm:text-left min-w-0 w-full">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Showing {paginatedZones.length} of {filteredZones.length} delivery zones · Page {page} of {totalPages}
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

      {/* Edit / Create Delivery Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground font-serif">
                  {editMode ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set shipping fee, courier info, and delivery window
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">District Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka or Chittagong"
                  disabled={editMode}
                  value={form.district}
                  onChange={(e) => setForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Shipping Fee (BDT) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 70 or 130"
                  value={form.shippingCharge}
                  onChange={(e) => setForm(prev => ({ ...prev, shippingCharge: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Estimated Delivery Time</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 Days"
                  value={form.estimatedDeliveryTime}
                  onChange={(e) => setForm(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">Courier Service Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Courier / Pathao"
                  value={form.courierName}
                  onChange={(e) => setForm(prev => ({ ...prev, courierName: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                />
              </div>

              <div className="pt-1 space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.codAvailable}
                    onChange={(e) => setForm(prev => ({ ...prev, codAvailable: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">Cash on Delivery (COD) Allowed</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">Active Shipping Route</span>
                </label>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Check size={15} />}
                  <span>Save Delivery Zone</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
