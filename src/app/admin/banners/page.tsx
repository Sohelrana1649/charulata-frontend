'use client';

import React, { useState } from 'react';
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadImageMutation
} from '@/store/api/adminApi';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Image as ImageIcon,
  Upload,
  Layers,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  Info,
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';

interface BannerForm {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: number;
  isActive: boolean;
}

const initialForm: BannerForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  position: 0,
  isActive: true
};

export default function AdminBannersPage() {
  const { data: bannersRes, isLoading, refetch } = useGetBannersQuery({});
  
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [uploadImage] = useUploadImageMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(initialForm);
  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');

  const banners = bannersRes?.data?.banners || bannersRes?.data || bannersRes?.banners || [];
  
  const filteredBanners = banners.filter((b: any) => {
    const matchesSearch = (b.title || '').toLowerCase().includes(search.toLowerCase().trim()) ||
                          (b.subtitle || '').toLowerCase().includes(search.toLowerCase().trim());
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'active' 
        ? b.isActive !== false 
        : b.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const paginatedBanners = filteredBanners.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setImageInputMode('file');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: any) => {
    setEditId(banner._id);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      position: banner.position || 0,
      isActive: banner.isActive !== undefined ? !!banner.isActive : true
    });
    setImageInputMode('file');
    setIsModalOpen(true);
  };

  const validateBannerImageDimensions = (fileOrUrl: File | string): Promise<{ valid: boolean; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);

      img.onload = () => {
        if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = width / height;

        if (width < 800) {
          resolve({
            valid: false,
            width,
            height,
            error: `Image width (${width}px) is too small. Minimum required width for banners is 800px (Recommended: 1500x500px or 1920x640px).`
          });
          return;
        }

        if (height < 200) {
          resolve({
            valid: false,
            width,
            height,
            error: `Image height (${height}px) is too small. Minimum required height is 200px.`
          });
          return;
        }

        if (aspectRatio < 1.8 || aspectRatio > 4.2) {
          resolve({
            valid: false,
            width,
            height,
            error: `Invalid aspect ratio (${aspectRatio.toFixed(2)}:1)! Banners must be landscape format with aspect ratio between 2.0 and 4.0 (Recommended 3:1 ratio e.g. 1500x500px or 1920x640px). Your image is ${width}x${height}px.`
          });
          return;
        }

        resolve({ valid: true, width, height });
      };

      img.onerror = () => {
        if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          width: 0,
          height: 0,
          error: 'Failed to load image. Please select a valid image file or URL.'
        });
      };

      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const validation = await validateBannerImageDimensions(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid banner dimensions.');
        setIsUploading(false);
        e.target.value = '';
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const url = res?.data?.url || res?.url;
      if (url) {
        // If the URL is already a full URL (e.g. Cloudinary), use it directly
        if (url.startsWith('http://') || url.startsWith('https://')) {
          setForm(prev => ({ ...prev, image: url }));
        } else {
          // Relative path — prepend backend base URL
          let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
          if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
            baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
          }
          const fullUrl = `${baseApiUrl.replace('/api/v1', '')}${url}`;
          setForm(prev => ({ ...prev, image: fullUrl }));
        }
        toast.success(`Banner image uploaded! Validated dimensions: ${validation.width}x${validation.height}px.`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) {
      toast.error('Image URL is required.');
      return;
    }

    setIsUploading(true);
    try {
      const validation = await validateBannerImageDimensions(form.image);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid banner dimensions.');
        setIsUploading(false);
        return;
      }

      const payload = {
        ...form,
        position: Number(form.position)
      };

      if (editId) {
        await updateBanner({ id: editId, bannerData: payload }).unwrap();
        toast.success('Banner updated successfully!');
      } else {
        await createBanner(payload).unwrap();
        toast.success('Banner created successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save banner.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await deleteBanner(id).unwrap();
      toast.success('Banner deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete banner.');
    }
  };

  const handleToggleStatus = async (banner: any) => {
    try {
      await updateBanner({ 
        id: banner._id, 
        bannerData: { isActive: !banner.isActive } 
      }).unwrap();
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'hidden'} successfully!`);
      refetch();
    } catch (err: any) {
      toast.error('Failed to update status.');
    }
  };

  const totalBanners = banners.length;
  const activeBanners = banners.filter((b: any) => b.isActive !== false).length;
  const hiddenBanners = totalBanners - activeBanners;

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 border border-border p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Promotional Hero Banners</h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-0.5 rounded-full border border-primary/20">
              {activeBanners} Active Slides
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage homepage slideshow banners, promotional banners, custom URL redirects, and ordering.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-primary hover:bg-[#b0842e] text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Banners</p>
            <p className="text-2xl font-black text-foreground mt-1 font-serif">{totalBanners}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <ImageIcon size={22} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Slideshow</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-serif">{activeBanners}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Hidden Slides</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-serif">{hiddenBanners}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search banners by title or subtitle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 pl-10 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-muted p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-card text-foreground shadow-xs border border-border' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({totalBanners})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'active' 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeBanners})
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              statusFilter === 'hidden' 
                ? 'bg-amber-500 text-white shadow-xs' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hidden ({hiddenBanners})
          </button>
        </div>
      </div>

      {/* Banners Grid View */}
      {isLoading ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-2xl shadow-xs">
          <Loader2 className="animate-spin text-primary inline h-7 w-7 mr-2" />
          <span className="text-sm font-bold">Loading store banners...</span>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-2xl shadow-xs space-y-3 p-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ImageIcon size={32} />
          </div>
          <p className="text-base font-bold text-foreground">No promotional banners found</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Click &quot;Add New Banner&quot; above to upload hero slides for the homepage.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-xs"
          >
            <Plus size={16} />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {paginatedBanners.map((banner: any) => (
            <div 
              key={banner._id} 
              className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 relative"
            >
              
              {/* Image Container */}
              <div className="h-44 sm:h-52 bg-muted relative overflow-hidden shrink-0 border-b border-border">
                {banner.image ? (
                  <Image
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={32} />
                  </div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    Slot #{banner.position}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-md transition-all cursor-pointer flex items-center space-x-1 ${
                      banner.isActive !== false 
                        ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-700' 
                        : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${banner.isActive !== false ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
                    <span>{banner.isActive !== false ? 'Active' : 'Hidden'}</span>
                  </button>
                </div>
              </div>

              {/* Banner Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground font-serif leading-tight">
                    {banner.title || 'Untitled Banner Slide'}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {banner.subtitle || 'No subtitle text provided'}
                  </p>

                  {banner.link && (
                    <div className="pt-1.5">
                      <a 
                        href={banner.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
                      >
                        <ExternalLink size={13} />
                        <span className="truncate max-w-xs">{banner.link}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground">
                    Pos: #{banner.position}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-foreground bg-muted hover:bg-primary hover:text-white rounded-xl border border-border transition cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-500/20 transition cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-card border border-border rounded-2xl shadow-xs text-center sm:text-left">
          <p className="text-xs text-muted-foreground font-semibold">
            Showing {paginatedBanners.length} of {filteredBanners.length} banners · Page {page} of {totalPages}
          </p>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-bold text-foreground bg-muted border border-border rounded-xl hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                  className={`h-8 w-8 text-xs font-bold rounded-xl border transition cursor-pointer ${
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
              className="px-3 py-1.5 text-xs font-bold text-foreground bg-muted border border-border rounded-xl hover:bg-primary hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit / Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-foreground font-serif">
                    {editId ? 'Edit Hero Banner Slide' : 'Add New Promotional Banner'}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure high-resolution slide image, promotional title, and destination link.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Live Banner Preview Box */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Live Banner Card Preview</span>
                <span className="text-[10px] text-primary font-bold">3:1 Landscape Format</span>
              </label>
              
              <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-border bg-muted flex flex-col justify-end p-4 sm:p-6 shadow-inner group">
                {form.image ? (
                  <Image src={form.image} alt="Live Banner Preview" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/80 p-4 text-center">
                    <ImageIcon size={36} className="mb-2 text-muted-foreground/60" />
                    <p className="text-xs font-bold text-foreground">No Banner Image Selected</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Upload a landscape image (1500 × 500 px recommended)</p>
                  </div>
                )}
                
                {/* Live Title & Subtitle Overlay Mockup */}
                {(form.title || form.subtitle) && (
                  <div className="relative z-10 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 max-w-lg text-white">
                    {form.title && <h4 className="text-sm sm:text-base font-bold font-serif">{form.title}</h4>}
                    {form.subtitle && <p className="text-xs opacity-90 line-clamp-1">{form.subtitle}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Image Input Section with Toggle Tabs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Banner Image *
                  </label>
                  
                  <div className="flex items-center space-x-1 bg-muted p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        imageInputMode === 'file' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Computer File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                        imageInputMode === 'url' ? 'bg-primary text-white shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <label className="flex flex-col items-center justify-center gap-2 w-full bg-muted/50 border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-5 cursor-pointer transition-all group">
                    {isUploading ? (
                      <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                        <span>Uploading & Validating Image...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={20} />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-foreground">Click to upload banner from computer</span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WEBP (Min width 800px)</p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={form.image}
                      onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    />
                  </div>
                )}

                {form.image && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <span className="font-bold truncate">Image loaded successfully</span>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="text-rose-500 hover:underline font-bold shrink-0 ml-2"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Subtitle Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Silk Collection 2026"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Handcrafted Sarees & Panjabis"
                    value={form.subtitle}
                    onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Target Link & Position & Active Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                    Click Action Destination URL
                  </label>
                  <div className="relative">
                    <ExternalLink size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. /search?category=sarees"
                      value={form.link}
                      onChange={(e) => setForm(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 pl-10 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider mb-1.5">
                    Position Index
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.position}
                    onChange={(e) => setForm(prev => ({ ...prev, position: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none transition font-mono font-bold"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="bg-muted/40 border border-border p-3.5 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-foreground">Slide Visibility Status</span>
                  <p className="text-[11px] text-muted-foreground">Active slides will be visible in homepage hero carousel.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-zinc-600 peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Dimension Guidelines Card */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info size={15} />
                  <span>Recommended Banner Size: 1500 × 500 px (Aspect Ratio 3:1)</span>
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  Minimum Width: 800px. Banners are displayed in landscape orientation across Mobile, Tablet, Laptop, and Desktop screens.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-[#b0842e] text-white rounded-xl text-xs sm:text-sm font-extrabold transition disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Check size={16} className="stroke-[2.5]" />
                  )}
                  <span>{editId ? 'Update Banner' : 'Save Banner'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
