'use client';

import React, { useState } from 'react';
import {
  useGetAllCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation
} from '@/store/api/campaignApi';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Check, 
  Sparkles,
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  Tag,
  Eye,
  Flame,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';

interface CampaignForm {
  title: string;
  subtitle: string;
  badgeText: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  ctaText: string;
  ctaLink: string;
  bannerImage1: string;
  bannerImage2: string;
  images: string[];
  isActive: boolean;
  priority: number;
}

const toLocalDatetimeString = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const initialForm: CampaignForm = {
  title: 'সর্বোচ্চ ৩৫% ছাড় চারুলতা কালেকশনে।',
  subtitle: 'Charulata Collection',
  badgeText: '🔥 চারুলতা উৎসব স্পেশাল ধামাকা',
  description: 'হাতে বোনা ঐতিহ্যবাহী জামদানি শাড়ি, প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ জুয়েলারিতে উপভোগ করুন সেরা অফার দাম।',
  discountPercent: 35,
  startDate: toLocalDatetimeString(new Date()),
  endDate: toLocalDatetimeString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  ctaText: 'অফার প্রোডাক্টস দেখুন',
  ctaLink: '/search',
  bannerImage1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
  bannerImage2: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781684539/download_4_liieog.jpg',
  images: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    'https://res.cloudinary.com/dau8sazoh/image/upload/v1781684539/download_4_liieog.jpg'
  ],
  isActive: true,
  priority: 1
};

export default function AdminCampaignsPage() {
  const { data: campaignsRes, isLoading, refetch } = useGetAllCampaignsQuery();
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();
  const [uploadImage] = useUploadImageMutation();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(initialForm);
  const [uploadingImg1, setUploadingImg1] = useState(false);
  const [uploadingImg2, setUploadingImg2] = useState(false);

  const campaigns = campaignsRes?.data?.campaigns || (campaignsRes as any)?.campaigns || [];
  
  const filteredCampaigns = campaigns.filter((c: any) => 
    (c.title || '').toLowerCase().includes(search.toLowerCase().trim()) ||
    (c.badgeText || '').toLowerCase().includes(search.toLowerCase().trim())
  );

  const [uploadingSliderImg, setUploadingSliderImg] = useState(false);
  const [sliderInputUrl, setSliderInputUrl] = useState('');

  const handleAddSliderUrl = () => {
    if (!sliderInputUrl.trim()) return;
    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), sliderInputUrl.trim()]
    }));
    setSliderInputUrl('');
  };

  const handleRemoveSliderImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSliderFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingSliderImg(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);
        const res = await uploadImage(formData).unwrap();
        const url = res.url || res.data?.url;
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} slider image(s) uploaded!`);
      }
    } catch (err: any) {
      toast.error('Failed to upload slider image');
    } finally {
      setUploadingSliderImg(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      ...initialForm,
      startDate: toLocalDatetimeString(new Date()),
      endDate: toLocalDatetimeString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditId(c._id);
    const existingImages = Array.isArray(c.images) && c.images.length > 0
      ? c.images
      : [c.bannerImage1, c.bannerImage2].filter(Boolean);

    setForm({
      title: c.title || '',
      subtitle: c.subtitle || '',
      badgeText: c.badgeText || '',
      description: c.description || '',
      discountPercent: c.discountPercent || 0,
      startDate: c.startDate ? toLocalDatetimeString(new Date(c.startDate)) : '',
      endDate: c.endDate ? toLocalDatetimeString(new Date(c.endDate)) : '',
      ctaText: c.ctaText || 'অফার প্রোডাক্টস দেখুন',
      ctaLink: c.ctaLink || '/search',
      bannerImage1: c.bannerImage1 || '',
      bannerImage2: c.bannerImage2 || '',
      images: existingImages,
      isActive: c.isActive !== undefined ? !!c.isActive : true,
      priority: c.priority || 0
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'bannerImage1' | 'bannerImage2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = targetField === 'bannerImage1' ? setUploadingImg1 : setUploadingImg2;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData).unwrap();
      const imageUrl = res.url || res.data?.url;

      if (imageUrl) {
        setForm(prev => ({ ...prev, [targetField]: imageUrl }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Upload failed: Invalid response');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Campaign title is required');
      return;
    }

    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined
      };

      if (editId) {
        await updateCampaign({ id: editId, data: payload }).unwrap();
        toast.success('Campaign updated successfully!');
      } else {
        await createCampaign(payload).unwrap();
        toast.success('Campaign created successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save campaign');
    }
  };

  const handleToggleActive = async (c: any) => {
    try {
      await updateCampaign({ id: c._id, data: { isActive: !c.isActive } }).unwrap();
      toast.success(`Campaign ${!c.isActive ? 'activated' : 'deactivated'}!`);
      refetch();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteCampaign(id).unwrap();
      toast.success('Campaign deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete campaign');
    }
  };

  const getCampaignStatus = (c: any) => {
    if (!c.isActive) return { text: 'Disabled', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
    const now = new Date();
    const start = c.startDate ? new Date(c.startDate) : null;
    const end = c.endDate ? new Date(c.endDate) : null;

    if (start && now < start) {
      return { text: 'Scheduled', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    if (end && now > end) {
      return { text: 'Expired', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    }
    return { text: 'Live Now', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={20} />
            </span>
            <h1 className="text-2xl font-extrabold text-foreground font-serif tracking-tight">Campaign & Promotion Manager</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create dynamic festive offer banners, countdown sales (Eid, Puja, Black Friday), and set automatic start/end schedules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="text-xs font-mono font-bold text-muted-foreground">
          Total: {filteredCampaigns.length}
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-6">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-extrabold text-foreground">No Campaigns Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Get started by creating your first promotional campaign banner with an automatic countdown timer.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center space-x-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Plus size={14} />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((c: any) => {
            const status = getCampaignStatus(c);
            return (
              <div
                key={c._id}
                className={`bg-card border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 ${
                  c.isActive ? 'border-border' : 'border-border/60 opacity-75'
                }`}
              >
                {/* Campaign Header & Status */}
                <div className="p-5 border-b border-border/60 flex items-start justify-between gap-3 bg-muted/20">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${status.color}`}>
                        {status.text}
                      </span>
                      {c.discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-white">
                          {c.discountPercent}% OFF
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-muted-foreground">Priority: {c.priority || 0}</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-foreground font-serif leading-snug truncate pt-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-primary font-bold">{c.badgeText}</p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20'
                      }`}
                      title={c.isActive ? 'Disable Campaign' : 'Enable Campaign'}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.description || 'No description added.'}
                  </p>

                  {/* Dates Schedule */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/50">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Start Date:</span>
                      <span className="font-mono font-bold text-foreground">
                        {c.startDate ? new Date(c.startDate).toLocaleString() : 'Immediate'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">End Date (Target):</span>
                      <span className="font-mono font-bold text-primary">
                        {c.endDate ? new Date(c.endDate).toLocaleString() : 'Indefinite'}
                      </span>
                    </div>
                  </div>

                  {/* Image Previews */}
                  <div className="flex items-center space-x-3 pt-1">
                    {c.bannerImage1 && (
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-border/80 bg-muted shrink-0">
                        <Image src={c.bannerImage1} alt="Banner 1" fill className="object-cover" />
                      </div>
                    )}
                    {c.bannerImage2 && (
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-border/80 bg-muted shrink-0">
                        <Image src={c.bannerImage2} alt="Banner 2" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-xs space-y-1">
                      <div className="truncate"><span className="font-bold text-muted-foreground">CTA:</span> {c.ctaText}</div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground"><span className="font-bold text-muted-foreground">Link:</span> {c.ctaLink}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-foreground border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles size={18} className="text-primary" />
                <h2 className="text-lg font-extrabold font-serif">
                  {editId ? 'Edit Campaign Banner' : 'Create Festive Campaign'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. সর্বোচ্চ ৩৫% ছাড় চারুলতা কালেকশনে।"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Badge Tag Text</label>
                  <input
                    type="text"
                    value={form.badgeText}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    placeholder="e.g. 🔥 চারুলতা উৎসব স্পেশাল ধামাকা"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Discount Percent (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    placeholder="e.g. 35"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Campaign subtitle details..."
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">End Date (Countdown Target)</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">CTA Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="e.g. অফার প্রোডাক্টস দেখুন"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">CTA Redirect Link</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    placeholder="e.g. /search?category=saree"
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Multi-Image Campaign Slider Section */}
                <div className="space-y-2 sm:col-span-2 border-t border-border/60 pt-3">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Campaign Slider Images (Multiple Photos supported for Swiper Carousel)</span>
                    <span className="text-[11px] text-muted-foreground font-normal">{(form.images || []).length} images added</span>
                  </label>

                  {/* Thumbnail List */}
                  {form.images && form.images.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl bg-muted/30 border border-border/50 max-h-36 overflow-y-auto">
                      {form.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group w-16 h-20 rounded-xl overflow-hidden border border-border shrink-0 bg-card">
                          <Image src={imgUrl} alt={`Slider ${idx + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSliderImage(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition opacity-90 hover:scale-110 cursor-pointer"
                            title="Remove image"
                          >
                            <X size={10} className="stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL Input or File Upload */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={sliderInputUrl}
                      onChange={(e) => setSliderInputUrl(e.target.value)}
                      placeholder="Paste Image URL or upload below..."
                      className="flex-1 rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddSliderUrl}
                      className="bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-xl text-xs font-bold border border-border cursor-pointer shrink-0"
                    >
                      + Add URL
                    </button>
                    <label className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center space-x-1 shrink-0 shadow-xs">
                      {uploadingSliderImg ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Upload size={14} />}
                      <span>Upload Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSliderFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Priority Number</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-foreground cursor-pointer">
                    Enable & Publish Campaign
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  {(isCreating || isUpdating) && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  <span>{editId ? 'Save Changes' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
