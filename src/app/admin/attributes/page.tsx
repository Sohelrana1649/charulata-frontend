'use client';

import React, { useState } from 'react';
import {
  useGetAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useAddAttributeValueMutation,
  useRemoveAttributeValueMutation,
  useDeleteAttributeMutation
} from '@/store/api/attributeApi';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  Check,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRole } from '@/hooks/useRole';
import RoleGuard from '@/components/admin/RoleGuard';

interface AttributeForm {
  name: string;
  values: string[];
  isActive: boolean;
}

const initialForm: AttributeForm = {
  name: '',
  values: [],
  isActive: true
};

export default function AdminAttributesPage() {
  const { isSuperAdmin } = useRole();
  const { data: attributesRes, isLoading, refetch } = useGetAttributesQuery({});

  const [createAttribute, { isLoading: isCreating }] = useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] = useUpdateAttributeMutation();
  const [addAttributeValue] = useAddAttributeValueMutation();
  const [removeAttributeValue] = useRemoveAttributeValueMutation();
  const [deleteAttribute, { isLoading: isDeleting }] = useDeleteAttributeMutation();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AttributeForm>(initialForm);
  const [newValueInput, setNewValueInput] = useState('');

  // Inline value adding state
  const [inlineAddId, setInlineAddId] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState('');

  const attributes = attributesRes?.data?.attributes || attributesRes?.data || attributesRes?.attributes || [];

  const filteredAttributes = attributes.filter((attr: any) =>
    (attr.name || '').toLowerCase().includes(search.toLowerCase().trim())
  );

  const totalAttributes = attributes.length;
  const activeCount = attributes.filter((a: any) => a.isActive !== false).length;
  const inactiveCount = totalAttributes - activeCount;

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setNewValueInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attr: any) => {
    setEditId(attr._id);
    setForm({
      name: attr.name || '',
      values: attr.values || [],
      isActive: attr.isActive !== undefined ? !!attr.isActive : true
    });
    setNewValueInput('');
    setIsModalOpen(true);
  };

  const handleAddValueChip = () => {
    const rawVal = newValueInput.trim();
    if (!rawVal) return;

    // Split by comma in case user pastes or types "Red, Blue, Green" or "S, M, L, XL"
    const items = rawVal
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    setForm(prev => {
      const existing = new Set(prev.values);
      const newValues = [...prev.values];

      items.forEach(item => {
        if (!existing.has(item)) {
          existing.add(item);
          newValues.push(item);
        }
      });

      return { ...prev, values: newValues };
    });

    setNewValueInput('');
  };

  const handleRemoveValueChip = (val: string) => {
    setForm(prev => ({ ...prev, values: prev.values.filter(v => v !== val) }));
  };

  const handleValueInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValueChip();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Attribute name is required');
      return;
    }
    try {
      if (editId) {
        await updateAttribute({ id: editId, data: form }).unwrap();
        toast.success('Attribute updated successfully!');
      } else {
        await createAttribute(form).unwrap();
        toast.success('Attribute created successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save attribute.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin অ্যাট্রিবিউট ডিলিট করতে পারবেন');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this attribute? This cannot be undone.')) return;
    try {
      await deleteAttribute(id).unwrap();
      toast.success('Attribute deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete attribute.');
    }
  };

  const handleInlineAddValue = async (attrId: string) => {
    const val = inlineValue.trim();
    if (!val) return;
    try {
      await addAttributeValue({ id: attrId, value: val }).unwrap();
      toast.success(`Value "${val}" added!`);
      setInlineAddId(null);
      setInlineValue('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add value.');
    }
  };

  const handleRemoveValue = async (attrId: string, value: string) => {
    if (!window.confirm(`Remove "${value}" from this attribute?`)) return;
    try {
      await removeAttributeValue({ id: attrId, value }).unwrap();
      toast.success(`Value "${value}" removed!`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove value.');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Attributes</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalAttributes} Total
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Manage reusable product attributes like Color, Size, Volume, etc. Assign them to categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Attribute</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Attributes</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalAttributes}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Sliders size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Active Attributes</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">{activeCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Inactive Attributes</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 font-serif">{inactiveCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-4 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search attributes by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 pl-10 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Attributes Table */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-primary inline h-6 w-6 mr-2" />
          <span className="text-xs font-bold">Loading attributes...</span>
        </div>
      ) : filteredAttributes.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm space-y-3">
          <p className="text-sm font-bold text-foreground">No attributes found</p>
          <p className="text-xs text-muted-foreground">Create your first attribute to get started.</p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Attribute</span>
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Attribute Name</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Values</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Count</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {filteredAttributes.map((attr: any) => (
                  <tr key={attr._id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                          <Tag size={14} />
                        </div>
                        <span className="font-bold text-foreground font-serif text-sm">{attr.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <div className="flex flex-wrap gap-1">
                        {(attr.values || []).slice(0, 8).map((val: string) => (
                          <span
                            key={val}
                            className="group inline-flex items-center space-x-1 bg-muted text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-border"
                          >
                            <span>{val}</span>
                            <button
                              onClick={() => handleRemoveValue(attr._id, val)}
                              className="text-muted-foreground hover:text-rose-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                              title={`Remove "${val}"`}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                        {(attr.values || []).length > 8 && (
                          <span className="text-[10px] text-muted-foreground font-semibold px-1.5 py-0.5">
                            +{attr.values.length - 8} more
                          </span>
                        )}

                        {/* Inline Add Value */}
                        {inlineAddId === attr._id ? (
                          <div className="inline-flex items-center space-x-1">
                            <input
                              type="text"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); handleInlineAddValue(attr._id); }
                                if (e.key === 'Escape') { setInlineAddId(null); setInlineValue(''); }
                              }}
                              placeholder="New value..."
                              className="bg-muted/60 border border-primary rounded-lg px-2 py-0.5 text-[10px] w-20 focus:outline-none"
                            />
                            <button
                              onClick={() => handleInlineAddValue(attr._id)}
                              className="text-primary hover:text-primary/80 cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => { setInlineAddId(null); setInlineValue(''); }}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setInlineAddId(attr._id); setInlineValue(''); }}
                            className="inline-flex items-center space-x-0.5 text-[10px] text-primary font-bold hover:underline cursor-pointer px-1.5 py-0.5"
                          >
                            <Plus size={10} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-muted-foreground">{(attr.values || []).length}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        attr.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {attr.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(attr)}
                          className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                          title="Edit Attribute"
                        >
                          <Edit3 size={14} />
                        </button>
                        <RoleGuard allowedRoles={['super_admin']}>
                          <button
                            onClick={() => handleDelete(attr._id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Delete Attribute"
                          >
                            <Trash2 size={14} />
                          </button>
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground font-serif">
                  {editId ? 'Edit Attribute' : 'Create New Attribute'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editId ? 'Update attribute details and values' : 'Define a reusable attribute with its allowed values'}
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Attribute Name */}
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                  Attribute Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Color, Size, Volume, RAM"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                />
              </div>

              {/* Values Tag Input */}
              <div>
                <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                  Values
                </label>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Type values separated by commas (e.g. Red, Blue, Green or S, M, L, XL) and press Add or Enter.
                </p>

                {/* Current values as chips */}
                {form.values.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {form.values.map(val => (
                      <span
                        key={val}
                        className="inline-flex items-center space-x-1 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-xl border border-primary/20"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValueChip(val)}
                          className="text-primary/60 hover:text-rose-500 transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input for new value */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Red, XL, 128GB..."
                    value={newValueInput}
                    onChange={(e) => setNewValueInput(e.target.value)}
                    onKeyDown={handleValueInputKeyDown}
                    className="flex-1 bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-[11px] sm:text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddValueChip}
                    className="px-3 py-2 bg-muted text-foreground border border-border rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Status Checkbox */}
              <div className="pt-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-foreground">Active (Available for category assignment)</span>
                </label>
              </div>

              {/* Action Buttons */}
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
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Check size={15} />
                  )}
                  <span>{editId ? 'Update Attribute' : 'Create Attribute'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
