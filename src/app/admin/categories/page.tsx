'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '@/store/api/productApi';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { useGetAttributesQuery } from '@/store/api/attributeApi';
import { triggerOnDemandRevalidation } from '@/utils/revalidateHelper';
import { useRole } from '@/hooks/useRole';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  FolderTree,
  CheckCircle2,
  AlertCircle,
  Upload,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';

interface CategoryForm {
  parentCategory: string; // '' for None (Level 0), or parent category _id
  name: string;
  nameBn: string;
  slug: string;
  order: number;
  description: string;
  image: string;
  attributes: string[];
  isActive: boolean;
}

const initialForm: CategoryForm = {
  parentCategory: '',
  name: '',
  nameBn: '',
  slug: '',
  order: 1,
  description: '',
  image: '',
  attributes: [],
  isActive: true
};

const DEFAULT_PRESET_ATTRIBUTES = [
  'Capacity',
  'Color',
  'Length',
  'Material',
  'RAM',
  'Screen Size',
  'Size',
  'Storage',
  'Volume',
  'Watt',
  'Weight',
  "Year's"
];

export default function AdminCategoriesPage() {
  const { isSuperAdmin } = useRole();
  const { data: categoriesRes, isLoading, refetch } = useGetCategoriesQuery({});
  const { data: attributesRes } = useGetAttributesQuery({});
  
  const allMasterAttributes = useMemo(() => {
    const dbAttrs = attributesRes?.data?.attributes || attributesRes?.data || attributesRes?.attributes || [];
    const dbAttrNames = Array.isArray(dbAttrs) ? dbAttrs.map((a: any) => typeof a === 'string' ? a : a.name) : [];
    const merged = Array.from(new Set([...DEFAULT_PRESET_ATTRIBUTES, ...dbAttrNames]));
    return merged.sort((a, b) => a.localeCompare(b));
  }, [attributesRes]);
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [isReordering, setIsReordering] = useState(false);

  const rawCategories = useMemo(() => {
    const list = categoriesRes?.data?.categories || categoriesRes?.data || categoriesRes?.categories || [];
    return Array.isArray(list) ? list : [];
  }, [categoriesRes]);

  // Group into Parents (Level 0) and Subcategories (Level 1)
  const { parentCategories, subcategoriesByParent, allParentsList } = useMemo(() => {
    const parents: any[] = [];
    const subs: any[] = [];

    rawCategories.forEach((cat: any) => {
      if (cat.level === 0 || !cat.parentCategory) {
        parents.push(cat);
      } else {
        subs.push(cat);
      }
    });

    parents.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || ''));
    subs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.name || '').localeCompare(b.name || ''));

    const subMap: Record<string, any[]> = {};
    subs.forEach((sub: any) => {
      const parentRef = sub.parentCategory;
      const pid = typeof parentRef === 'object' && parentRef !== null
        ? String(parentRef._id || parentRef.slug || '')
        : String(parentRef || '');
      const pslug = typeof parentRef === 'object' && parentRef !== null
        ? String(parentRef.slug || '')
        : '';

      if (pid) {
        if (!subMap[pid]) subMap[pid] = [];
        subMap[pid].push(sub);
      }
      if (pslug && pslug !== pid) {
        if (!subMap[pslug]) subMap[pslug] = [];
        subMap[pslug].push(sub);
      }
    });

    return {
      parentCategories: parents,
      subcategoriesByParent: subMap,
      allParentsList: parents
    };
  }, [rawCategories]);

  // Expand all parents by default on initial load
  useEffect(() => {
    if (parentCategories.length > 0 && Object.keys(expandedParents).length === 0) {
      const initial: Record<string, boolean> = {};
      parentCategories.forEach((p: any) => {
        initial[String(p._id)] = true;
        if (p.slug) initial[String(p.slug)] = true;
      });
      setExpandedParents(initial);
    }
  }, [parentCategories]);

  const toggleParent = (pId: string, pSlug?: string) => {
    setExpandedParents(prev => {
      const current = prev[pId] || (pSlug ? prev[pSlug] : false);
      const next = !current;
      return {
        ...prev,
        [pId]: next,
        ...(pSlug ? { [pSlug]: next } : {})
      };
    });
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    parentCategories.forEach((p: any) => {
      next[String(p._id)] = true;
      if (p.slug) next[String(p.slug)] = true;
    });
    setExpandedParents(next);
  };

  const handleCollapseAll = () => {
    setExpandedParents({});
  };

  // Image Upload handler
  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('ফাইলের সাইজ সর্বোচ্চ ১MB হতে হবে (Max file size: 1MB)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const url = res?.data?.url || res?.url;
      if (url) {
        let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.charulatalifestyle.com/api/v1';
        if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
          baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
        }
        const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
        setForm(prev => ({ ...prev, image: fullUrl }));
        toast.success('Category icon uploaded!');
      }
    } catch {
      // Fallback: Read file as base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Str = reader.result as string;
          setForm(prev => ({ ...prev, image: base64Str }));
          toast.success('Category icon ready to save!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!editId && form.name) {
      const generatedSlug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.name, editId]);

  // Open modal for Top-Level Parent
  const handleOpenAddParent = () => {
    setEditId(null);
    const nextOrder = parentCategories.length > 0 
      ? Math.max(...parentCategories.map(p => Number(p.order) || 0)) + 1 
      : 1;
    setForm({
      ...initialForm,
      parentCategory: '',
      order: nextOrder
    });
    setIsModalOpen(true);
  };

  // Open modal for Subcategory under a specific parent
  const handleOpenAddSubcategory = (parent: any) => {
    setEditId(null);
    const parentId = String(parent._id);
    const childSubs = subcategoriesByParent[parentId] || subcategoriesByParent[parent.slug] || [];
    const nextOrder = childSubs.length > 0 
      ? Math.max(...childSubs.map(s => Number(s.order) || 0)) + 1 
      : 1;

    setForm({
      ...initialForm,
      parentCategory: parentId,
      order: nextOrder
    });
    setIsModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEdit = (cat: any) => {
    setEditId(cat._id);
    const pRef = cat.parentCategory;
    const parentId = typeof pRef === 'object' && pRef !== null ? (pRef._id || pRef.slug || '') : (pRef || '');

    setForm({
      parentCategory: parentId ? String(parentId) : '',
      name: cat.name || '',
      nameBn: cat.nameBn || '',
      slug: cat.slug || '',
      order: Number(cat.order) || 1,
      description: cat.description || '',
      image: cat.image || '',
      attributes: Array.isArray(cat.attributes) ? cat.attributes : [],
      isActive: cat.isActive !== undefined ? !!cat.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameBn.trim()) {
      toast.error('ক্যাটাগরির ইংরেজি নাম (English Name) এবং বাংলা নাম (Bengali Name) উভয়ই পূরণ করা বাধ্যতামূলক!');
      return;
    }

    try {
      const payload: any = {
        name: form.name.trim(),
        nameBn: form.nameBn.trim(),
        slug: form.slug.trim(),
        order: Number(form.order) || 1,
        description: form.description.trim(),
        image: form.image,
        attributes: form.attributes,
        isActive: form.isActive,
        parentCategory: form.parentCategory || null
      };

      if (editId) {
        await updateCategory({ id: editId, categoryData: payload }).unwrap();
        toast.success('Category updated successfully!');
      } else {
        await createCategory(payload).unwrap();
        toast.success('Category created successfully!');
      }

      // Instant Revalidation
      triggerOnDemandRevalidation({
        tags: ['categories', 'landing', 'products', payload.slug ? `category-${payload.slug}` : ''],
        paths: ['/', '/search', payload.slug ? `/category/${payload.slug}` : '']
      });

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (cat: any) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin ক্যাটাগরি ডিলিট করতে পারবেন');
      return;
    }
    const isParent = cat.level === 0 || !cat.parentCategory;
    const subCount = isParent ? (subcategoriesByParent[String(cat._id)] || []).length : 0;
    const confirmMessage = subCount > 0
      ? `"${cat.name}" ক্যাটাগরিটি ডিলিট করতে চান? এর অধীনে ${subCount}টি সাবক্যাটাগরি রয়েছে!`
      : `Are you sure you want to delete "${cat.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteCategory(cat._id).unwrap();
      toast.success('Category deleted successfully!');

      triggerOnDemandRevalidation({
        tags: ['categories', 'landing', 'products', cat.slug ? `category-${cat.slug}` : ''],
        paths: ['/', '/search', cat.slug ? `/category/${cat.slug}` : '']
      });

      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete category.');
    }
  };

  // Reordering: Move Up or Down
  const handleMove = async (item: any, direction: 'up' | 'down', siblingList: any[]) => {
    if (isReordering) return;
    const currentIndex = siblingList.findIndex(x => String(x._id) === String(item._id));
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblingList.length) return;

    const otherItem = siblingList[targetIndex];
    const currentOrder = Number(item.order) || (currentIndex + 1);
    const otherOrder = Number(otherItem.order) || (targetIndex + 1);

    let newCurrentOrder = otherOrder;
    let newOtherOrder = currentOrder;

    if (newCurrentOrder === newOtherOrder) {
      if (direction === 'up') {
        newCurrentOrder = Math.max(1, otherOrder - 1);
      } else {
        newCurrentOrder = otherOrder + 1;
      }
    }

    try {
      setIsReordering(true);
      await Promise.all([
        updateCategory({ id: item._id, categoryData: { order: newCurrentOrder } }).unwrap(),
        updateCategory({ id: otherItem._id, categoryData: { order: newOtherOrder } }).unwrap()
      ]);
      toast.success('Order updated successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update order.');
    } finally {
      setIsReordering(false);
    }
  };

  // Filter Categories by search and status
  const filteredParents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return parentCategories.filter((parent: any) => {
      const parentNameEn = (parent.name || '').toLowerCase();
      const parentNameBn = (parent.nameBn || '').toLowerCase();
      const parentSlug = (parent.slug || '').toLowerCase();
      const childSubs = subcategoriesByParent[String(parent._id)] || subcategoriesByParent[parent.slug] || [];

      // Check status
      if (statusFilter === 'active' && parent.isActive === false) return false;
      if (statusFilter === 'inactive' && parent.isActive !== false) return false;

      if (!q) return true;

      // Matches parent
      if (parentNameEn.includes(q) || parentNameBn.includes(q) || parentSlug.includes(q)) {
        return true;
      }

      // Or matches any child
      return childSubs.some((sub: any) => {
        const subEn = (sub.name || '').toLowerCase();
        const subBn = (sub.nameBn || '').toLowerCase();
        const subSlug = (sub.slug || '').toLowerCase();
        return subEn.includes(q) || subBn.includes(q) || subSlug.includes(q);
      });
    });
  }, [parentCategories, subcategoriesByParent, search, statusFilter]);

  const totalCategories = rawCategories.length;
  const activeCount = rawCategories.filter((c: any) => c.isActive !== false).length;
  const inactiveCount = totalCategories - activeCount;

  const isFormSubcategory = Boolean(form.parentCategory && form.parentCategory !== '');

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif tracking-tight">Categories</h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20 font-mono">
              {totalCategories} Total
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage store product collections, custom URLs, descriptions, and visibility.
          </p>
        </div>
        
        <button
          onClick={handleOpenAddParent}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
        >
          <Plus size={16} />
          <span>Create Category</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Categories</p>
            <p className="text-lg sm:text-2xl font-black text-foreground mt-1 font-serif">{totalCategories}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <FolderTree size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">L0 Departments</p>
            <p className="text-lg sm:text-2xl font-black text-primary mt-1 font-serif">{parentCategories.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Items</p>
            <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-serif">{activeCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">Inactive Items</p>
            <p className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-serif">{inactiveCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-3.5 sm:p-4 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories or subcategories by name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 pl-10 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters & Expand All */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1 bg-muted border border-border p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                statusFilter === 'active' ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-card text-rose-600 dark:text-rose-400 shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inactive
            </button>
          </div>

          <button
            type="button"
            onClick={handleExpandAll}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Expand All +
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Collapse All -
          </button>
        </div>

      </div>

      {/* Main Hierarchy Category Cards */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-2xl shadow-xs">
          <Loader2 className="animate-spin text-primary inline h-6 w-6 mr-2" />
          <span className="text-xs font-bold">Loading store categories...</span>
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-2xl shadow-xs space-y-3">
          <p className="text-sm font-bold text-foreground">No categories found matching your search</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredParents.map((parent: any, pIdx: number) => {
            const pId = String(parent._id);
            const pSlug = String(parent.slug || '');
            const isOpen = Boolean(expandedParents[pId] || expandedParents[pSlug]);
            const childSubs = subcategoriesByParent[pId] || subcategoriesByParent[pSlug] || [];
            const hasSubs = childSubs.length > 0;
            const parentImage = parent.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100';

            return (
              <div
                key={parent._id || parent.slug}
                className="bg-card border border-border hover:border-primary/30 rounded-2xl p-4 sm:p-5 shadow-xs transition-all space-y-3.5"
              >
                {/* L0 Parent Header Row */}
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Chevron + Avatar + Title & Bengali Name */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleParent(pId, pSlug)}
                      aria-label="Toggle Subcategories"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition cursor-pointer shrink-0"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-200 stroke-[2.5] ${isOpen ? 'rotate-0 text-primary' : '-rotate-90 text-muted-foreground'}`}
                      />
                    </button>

                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border border-border shrink-0 bg-muted shadow-2xs">
                      <Image
                        src={parentImage}
                        alt={parent.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground font-serif truncate">
                        {parent.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                        {parent.nameBn || parent.name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Order Up/Down, Edit, Delete */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* Reorder Up/Down */}
                    <div className="flex items-center border border-border bg-muted/40 rounded-xl shadow-2xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleMove(parent, 'up', parentCategories)}
                        disabled={pIdx === 0 || isReordering}
                        title="Move Up"
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-card transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-r border-border"
                      >
                        <ArrowUp size={14} className="stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(parent, 'down', parentCategories)}
                        disabled={pIdx === parentCategories.length - 1 || isReordering}
                        title="Move Down"
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-card transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ArrowDown size={14} className="stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(parent)}
                      title="Edit Category"
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(parent)}
                      title="Delete Category"
                      className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-border rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>

                {/* Metadata Row: L0 Parent Badge, slug, order, Active Status, and + Subcategory Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wide border border-primary/20 font-mono">
                      L0 PARENT
                    </span>
                    <span className="text-muted-foreground">slug: <strong className="text-foreground">{parent.slug}</strong></span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">order: <strong className="text-foreground">#{parent.order ?? (pIdx + 1)}</strong></span>
                    <span className="text-muted-foreground">•</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      parent.isActive !== false
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {parent.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* + Subcategory Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddSubcategory(parent)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-extrabold transition cursor-pointer border border-primary/20 shadow-2xs"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>+ Subcategory</span>
                  </button>
                </div>

                {/* Indented Child Subcategories (L1) */}
                {isOpen && (
                  <div className="pl-4 sm:pl-8 space-y-2.5 pt-2 border-t border-border/60 animate-in fade-in slide-in-from-top-1 duration-150">
                    {hasSubs ? (
                      childSubs.map((sub: any, sIdx: number) => {
                        const subImage = sub.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100';

                        return (
                          <div
                            key={sub._id || sub.slug}
                            className="bg-card border border-border/80 hover:border-primary/40 rounded-xl p-3 sm:p-3.5 shadow-2xs transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            {/* Left: Avatar + L1 badge + Name + Bengali + slug/order */}
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                                <Image
                                  src={subImage}
                                  alt={sub.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                                    L1
                                  </span>
                                  <span className="text-xs sm:text-sm font-bold text-foreground font-serif truncate">
                                    {sub.name}
                                  </span>
                                  {sub.nameBn && (
                                    <span className="text-xs text-muted-foreground font-medium truncate">
                                      ({sub.nameBn})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] font-mono text-muted-foreground">
                                  <span>slug: <strong className="text-foreground">{sub.slug}</strong></span>
                                  <span>•</span>
                                  <span>order: <strong className="text-foreground">#{sub.order ?? (sIdx + 1)}</strong></span>
                                  <span>•</span>
                                  <span className={`font-bold ${sub.isActive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Reorder Up/Down, Edit, Delete */}
                            <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                              <div className="flex items-center border border-border bg-muted/40 rounded-lg overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleMove(sub, 'up', childSubs)}
                                  disabled={sIdx === 0 || isReordering}
                                  title="Move Up"
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-card transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-r border-border"
                                >
                                  <ArrowUp size={13} className="stroke-[2.5]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(sub, 'down', childSubs)}
                                  disabled={sIdx === childSubs.length - 1 || isReordering}
                                  title="Move Down"
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-card transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <ArrowDown size={13} className="stroke-[2.5]" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(sub)}
                                title="Edit Subcategory"
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border rounded-lg transition cursor-pointer shadow-2xs"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(sub)}
                                title="Delete Subcategory"
                                className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-border rounded-lg transition cursor-pointer shadow-2xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 px-5 text-center bg-muted/30 border border-dashed border-border rounded-xl">
                        <p className="text-xs text-muted-foreground font-medium">
                          No subcategories under this parent yet. Click <strong className="text-primary hover:underline cursor-pointer" onClick={() => handleOpenAddSubcategory(parent)}>+ Subcategory</strong> to add one.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog (Create / Edit Category) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground font-serif">
                    {editId ? 'Edit Category' : 'Create Category'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isFormSubcategory
                      ? 'Creating/Editing Subcategory (Level 1)'
                      : 'Creating/Editing Top-Level Parent Category (Level 0)'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* PARENT CATEGORY DROPDOWN */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90">
                  Parent Category
                </label>
                <select
                  value={form.parentCategory}
                  onChange={(e) => setForm(prev => ({ ...prev, parentCategory: e.target.value }))}
                  className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:bg-background focus:outline-none transition cursor-pointer"
                >
                  <option value="">None — Top Level Category (Level 0)</option>
                  {allParentsList.map((p: any) => {
                    // Do not allow picking itself as parent
                    if (editId && String(p._id) === String(editId)) return null;
                    return (
                      <option key={p._id || p.slug} value={String(p._id)}>
                        {p.name} {p.nameBn ? `(${p.nameBn})` : ''} — Level 0 Parent
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Select "None" for a primary menu department (e.g. Men's Fashion). Select a parent to make this a subcategory (e.g. Panjabi).
                </p>
              </div>

              {/* TWO COLUMN ROW: ENGLISH NAME & BENGALI NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90 mb-1.5">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panjabi or Shoes"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90 mb-1.5">
                    Bengali Name (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পাঞ্জাবী বা জুতা"
                    value={form.nameBn}
                    onChange={(e) => setForm(prev => ({ ...prev, nameBn: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
                  />
                </div>
              </div>

              {/* TWO COLUMN ROW: URL SLUG & DISPLAY ORDER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90 mb-1.5">
                    Display Order #
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={form.order}
                    onChange={(e) => setForm(prev => ({ ...prev, order: Number(e.target.value) || 1 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
                  />
                </div>
              </div>

              {/* CATEGORY ICON (PNG, JPG, WEBP ≤ 1MB) */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90">
                  Category Icon (PNG, JPG, WEBP ≤ 1MB)
                </label>
                <div className="flex items-center space-x-3">
                  {/* Thumbnail Preview Box */}
                  <div className="relative h-14 w-14 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {form.image ? (
                      <>
                        <Image src={form.image} alt="Icon Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
                          title="Remove icon"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon size={22} className="text-muted-foreground/60" />
                    )}
                  </div>

                  {/* Upload Icon Button */}
                  <label className="px-4 py-2.5 bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center space-x-2 shadow-2xs">
                    {isUploading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Upload size={15} />
                    )}
                    <span>Upload Icon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Or paste URL */}
                  <input
                    type="url"
                    placeholder="Or paste image URL..."
                    value={form.image}
                    onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Max file size: 1MB. High-contrast PNG or SVG icon recommended.
                </p>
              </div>

              {/* ALLOWED ATTRIBUTES FOR PRODUCTS */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground opacity-90">
                    Allowed Attributes for Products
                  </label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md font-mono">
                    {form.attributes.length} Selected
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Select attributes (e.g. Size, Color, Year's) to enable when creating products in this category.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allMasterAttributes.map((attrName: string) => {
                    const isSelected = form.attributes.includes(attrName);
                    return (
                      <button
                        key={attrName}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setForm(prev => ({ ...prev, attributes: prev.attributes.filter(a => a !== attrName) }));
                          } else {
                            setForm(prev => ({ ...prev, attributes: [...prev.attributes, attrName] }));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center space-x-1.5 border shadow-2xs ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs font-black'
                            : 'bg-muted/60 text-foreground/80 border-border hover:border-primary/40 hover:text-primary hover:bg-muted'
                        }`}
                      >
                        <Tag size={12} className={isSelected ? 'text-white' : 'text-primary'} />
                        <span>{attrName}</span>
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE STATUS */}
              <div className="pt-2 border-t border-border">
                <label className="flex items-start space-x-3 p-3 bg-muted/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Active Status</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Inactive categories and their products will be hidden from customer navigation.
                    </span>
                  </div>
                </label>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-extrabold transition disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{editId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
