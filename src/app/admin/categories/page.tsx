'use client';

import React, { useState, useEffect } from 'react';
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
import RoleGuard from '@/components/admin/RoleGuard';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Folder,
  Grid,
  List,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';

interface CategoryForm {
  name: string;
  nameBn: string;
  slug: string;
  description: string;
  image: string;
  attributes: string[];
  isActive: boolean;
}

const initialForm: CategoryForm = {
  name: '',
  nameBn: '',
  slug: '',
  description: '',
  image: '',
  attributes: [],
  isActive: true
};

export default function AdminCategoriesPage() {
  const { isSuperAdmin } = useRole();
  const { data: categoriesRes, isLoading, refetch } = useGetCategoriesQuery({});
  const { data: attributesRes } = useGetAttributesQuery({});
  
  const allMasterAttributes = attributesRes?.data?.attributes || attributesRes?.data || attributesRes?.attributes || [];
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);

  const categories = categoriesRes?.data?.categories || categoriesRes?.data || categoriesRes?.categories || [];

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setForm(prev => ({ ...prev, image: fullUrl }));
        toast.success('Category image uploaded!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload category image.');
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

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditId(cat._id);
    setForm({
      name: cat.name || '',
      nameBn: cat.nameBn || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      attributes: cat.attributes || [],
      isActive: cat.isActive !== undefined ? !!cat.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nameBn.trim()) {
      toast.error('ক্যাটাগরির ইংরেজি নাম এবং বাংলা নাম উভয়ই পূরণ করা বাধ্যতামূলক!');
      return;
    }
    try {
      const currentCatSlug = form.slug;
      if (editId) {
        await updateCategory({ id: editId, categoryData: form }).unwrap();
        toast.success('Category updated successfully!');
      } else {
        await createCategory(form).unwrap();
        toast.success('Category created successfully!');
      }

      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['categories', 'landing', 'products', currentCatSlug ? `category-${currentCatSlug}` : ''],
        paths: ['/', '/search', currentCatSlug ? `/category/${currentCatSlug}` : '']
      });

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSuperAdmin) {
      toast.error('শুধুমাত্র Super Admin ক্যাটাগরি ডিলিট করতে পারবেন');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    const catToDelete = categories.find((c: any) => c._id === id);
    const catSlug = catToDelete?.slug;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted successfully!');

      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['categories', 'landing', 'products', catSlug ? `category-${catSlug}` : ''],
        paths: ['/', '/search', catSlug ? `/category/${catSlug}` : '']
      });

      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete category.');
    }
  };

  // Filter Categories by search and status
  const filteredCategories = categories.filter((cat: any) => {
    const matchesSearch = 
      (cat.name || '').toLowerCase().includes(search.toLowerCase().trim()) ||
      (cat.slug || '').toLowerCase().includes(search.toLowerCase().trim()) ||
      (cat.description || '').toLowerCase().includes(search.toLowerCase().trim());
      
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return cat.isActive === true;
    if (statusFilter === 'inactive') return cat.isActive === false;

    return true;
  });

  const totalCategories = categories.length;
  const activeCount = categories.filter((c: any) => c.isActive !== false).length;
  const inactiveCount = totalCategories - activeCount;

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Categories</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalCategories} Total
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Manage store product collections, custom URLs, descriptions, and visibility.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Categories</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalCategories}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <FolderTree size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Active Categories</p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 sm:mt-1 font-serif">{activeCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Inactive Categories</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 font-serif">{inactiveCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border p-4 rounded-xl sm:rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 sm:top-3 text-muted-foreground sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search categories by name, slug..."
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

        {/* Filters & View Modes */}
        <div className="flex items-center space-x-3">
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

          <div className="flex items-center space-x-1 bg-muted border border-border p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Main Category List */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-primary inline h-6 w-6 mr-2" />
          <span className="text-xs font-bold">Loading store categories...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm space-y-3">
          <p className="text-sm font-bold text-foreground">No categories found</p>
          <p className="text-xs text-muted-foreground">Try adjusting search query or active status filters.</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW LAYOUT */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedCategories.map((cat: any) => (
            <div 
              key={cat._id}
              className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Category Image Header */}
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-muted border border-border overflow-hidden relative shrink-0 flex items-center justify-center">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <Folder size={20} className="text-primary/70" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground font-serif text-sm truncate">{cat.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">/{cat.slug}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                {cat.description || 'No description provided.'}
              </p>

              {/* Footer Bar */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  cat.isActive !== false
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}>
                  {cat.isActive !== false ? 'Active' : 'Inactive'}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <RoleGuard allowedRoles={['super_admin']}>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </RoleGuard>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW LAYOUT */
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Image</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Category Name</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">URL Slug</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Description</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {paginatedCategories.map((cat: any) => (
                  <tr key={cat._id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <div className="h-10 w-10 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center relative">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                        ) : (
                          <Folder size={18} className="text-primary/70" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-foreground font-serif text-sm">
                      {cat.name}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground border border-border/50">
                        /{cat.slug}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {cat.description || '—'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        cat.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {cat.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit3 size={14} />
                        </button>
                        <RoleGuard allowedRoles={['super_admin']}>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                            title="Delete Category"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm text-center sm:text-left min-w-0 w-full">
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">
            Showing {paginatedCategories.length} of {filteredCategories.length} categories · Page {page} of {totalPages}
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
                      : 'text-foreground bg-muted border-border hover:bg-primary hover:text-white'
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

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                  <FolderTree size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground font-serif">
                    {editId ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editId ? 'Update category details, images, and attribute mappings' : 'Add a new product collection to store navigation'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Preset Buttons (for New Category) */}
            {!editId && (
              <div className="bg-muted/40 p-3 rounded-2xl border border-border/60 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  ⚡ Quick Suggestions (1-Click Fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { en: "Women's Fashion", bn: "নারীর ফ্যাশন" },
                    { en: "Men's Fashion", bn: "পুরুষের ফ্যাশন" },
                    { en: "Jamdani & Silk Sarees", bn: "জামদানি ও সিল্ক শাড়ি" },
                    { en: "Premium Panjabis", bn: "প্রিমিয়াম পাঞ্জাবী" },
                    { en: "Designer Kurtis", bn: "ডিজাইনার কুর্তি" },
                    { en: "Premium Jewelry", bn: "প্রিমিয়াম জুয়েলারি" },
                    { en: "Attar & Beauty", bn: "আতর ও বিউটি" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, name: preset.en, nameBn: preset.bn }))}
                      className="px-2.5 py-1 bg-card hover:bg-primary hover:text-white text-foreground text-xs font-semibold rounded-lg border border-border transition cursor-pointer shadow-2xs"
                    >
                      {preset.en} ({preset.bn})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Form Grid */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1: Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border pb-1">
                    1. Basic Information
                  </h4>

                  {/* Category Name English */}
                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                      Category Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jamdani & Silk Sarees"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition font-medium"
                    />
                  </div>

                  {/* Category Name Bangla */}
                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                      ক্যাটাগরির নাম (বাংলা) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: জামদানি ও সিল্ক শাড়ি"
                      value={form.nameBn}
                      onChange={(e) => setForm(prev => ({ ...prev, nameBn: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition font-medium"
                    />
                  </div>

                  {/* URL Slug */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                        URL Slug *
                      </label>
                      <span className="text-[10px] text-muted-foreground font-mono">Auto-generated from name</span>
                    </div>
                    <div className="flex items-center bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 focus-within:border-primary transition">
                      <span className="text-xs text-muted-foreground font-mono mr-1">/</span>
                      <input
                        type="text"
                        required
                        placeholder="jamdani-silk-sarees"
                        value={form.slug}
                        onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full bg-transparent text-xs font-mono text-foreground outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of products in this category..."
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition resize-none font-medium"
                    ></textarea>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="pt-2">
                    <label className="flex items-center space-x-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-foreground block">Active Visibility</span>
                        <span className="text-[10px] text-muted-foreground block">Visible in store navbar strip & search filters</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* COLUMN 2: Banner Image & Attributes */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary border-b border-border pb-1">
                    2. Image & Attributes
                  </h4>

                  {/* Category Image URL / File Upload */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                      Category Banner Image
                    </label>

                    {/* Image Preview Box */}
                    {form.image ? (
                      <div className="h-32 w-full rounded-2xl bg-muted border border-border overflow-hidden relative shadow-sm group">
                        <Image src={form.image} alt="Category Banner Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                            className="p-2 bg-rose-600 text-white rounded-xl transition cursor-pointer shadow-md font-bold text-xs flex items-center space-x-1"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/30 hover:bg-muted/50 transition">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-foreground">Upload category banner image</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WebP up to 5MB</p>

                        <div className="mt-3 flex items-center justify-center space-x-2">
                          <label className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-xs inline-flex items-center space-x-1">
                            {isUploading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Upload size={13} />
                                <span>Browse File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCategoryImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Paste URL Input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        placeholder="Or paste HTTP Image URL..."
                        value={form.image}
                        onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-[11px] text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Category Attributes Chip Selector */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider">
                        Category Attributes
                      </label>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {form.attributes.length} Selected
                      </span>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Select attributes applicable to products in this category:
                    </p>

                    {allMasterAttributes.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-border">
                        No attributes defined. Add master attributes in Attributes section.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-muted/30 border border-border rounded-xl">
                        {allMasterAttributes.map((attr: any) => {
                          const isChecked = form.attributes.includes(attr.name);
                          return (
                            <button
                              key={attr._id || attr.name}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  setForm(prev => ({ ...prev, attributes: prev.attributes.filter(a => a !== attr.name) }));
                                } else {
                                  setForm(prev => ({ ...prev, attributes: [...prev.attributes, attr.name] }));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 border ${
                                isChecked
                                  ? 'bg-primary text-white border-primary shadow-xs'
                                  : 'bg-card text-foreground/80 border-border hover:border-primary/40 hover:text-foreground'
                              }`}
                            >
                              <span>{attr.name}</span>
                              {isChecked && <Check size={12} className="stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
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
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
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
