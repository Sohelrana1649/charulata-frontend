'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useDeleteBlogGalleryImageMutation,
  useReorderBlogGalleryImagesMutation,
  useRegenerateBlogPreviewTokenMutation,
  IBlogItem,
  IBlogImage,
} from '@/store/api/blogApi';
import { useUploadImageMutation } from '@/store/api/adminApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import RoleGuard from '@/components/admin/RoleGuard';
import RichTextEditor from '@/components/admin/RichTextEditor';
import Image from '@/components/SafeImage';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Loader2,
  Check,
  BookOpen,
  Eye,
  ExternalLink,
  Calendar,
  Sparkles,
  Upload,
  Layers,
  FileText,
  Tag,
  AlertTriangle,
  Globe,
  CheckCircle2,
  Clock,
  Filter,
  Images,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  ShoppingBag,
  Star,
  Copy,
  RefreshCw,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface BlogFormData {
  title: string;
  titleBn: string;
  slug: string;
  excerpt: string;
  content: string;
  contentBn: string;
  coverImage: string;
  images: IBlogImage[];
  relatedProducts: any[];
  focusKeyword: string;
  isFeatured: boolean;
  scheduledAt: string;
  author: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  status: 'draft' | 'published' | 'scheduled';
}

const initialBlogForm: BlogFormData = {
  title: '',
  titleBn: '',
  slug: '',
  excerpt: '',
  content: '',
  contentBn: '',
  coverImage: '',
  images: [],
  relatedProducts: [],
  focusKeyword: '',
  isFeatured: false,
  scheduledAt: '',
  author: 'Charulata Lifestyle',
  category: 'Fashion',
  tags: [],
  metaTitle: '',
  metaDescription: '',
  status: 'published',
};

const DEFAULT_CATEGORIES = [
  'Fashion',
  'Saree & Traditional',
  'Panjabi & Men',
  'Jewelry & Accessories',
  'Beauty & Fragrance',
  'Styling Tips',
  'Lifestyle',
  'Product Care',
];

const toDatetimeLocal = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export default function AdminBlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPreviewToken, setCurrentPreviewToken] = useState<string>('');
  const [formData, setFormData] = useState<BlogFormData>(initialBlogForm);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'english' | 'bangla' | 'gallery' | 'shopTheLook' | 'seo'>('english');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageCaption, setCustomImageCaption] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Product picker search state
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<IBlogItem | null>(null);

  // Queries & Mutations
  const { data: blogsRes, isLoading, isFetching } = useGetAdminBlogsQuery({
    page,
    limit: 15,
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  // Product Search Query
  const { data: searchProductsRes, isFetching: isSearchingProducts } = useGetProductsQuery(
    { search: productSearchTerm.trim(), limit: 12 },
    { skip: !productSearchTerm.trim() }
  );
  const searchProductsList = searchProductsRes?.data?.products || searchProductsRes?.products || [];

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [deleteGalleryImage, { isLoading: isDeletingGalleryImage }] = useDeleteBlogGalleryImageMutation();
  const [reorderGalleryImages] = useReorderBlogGalleryImagesMutation();
  const [regeneratePreviewToken, { isLoading: isRegeneratingToken }] = useRegenerateBlogPreviewTokenMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const blogs = blogsRes?.data?.blogs || [];
  const pagination = blogsRes?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Stats calculation
  const totalBlogs = pagination.total || blogs.length;
  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);

  // Auto-generate slug when title changes in create mode
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!isEditing) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim();
        if (!prev.metaTitle) {
          updated.metaTitle = val ? `${val} | Charulata Lifestyle` : '';
        }
      }
      return updated;
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setCurrentPreviewToken('');
    setFormData(initialBlogForm);
    setTagInput('');
    setCustomImageUrl('');
    setCustomImageCaption('');
    setProductSearchTerm('');
    setActiveTab('english');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (blog: IBlogItem) => {
    setIsEditing(true);
    setEditingId(blog._id);
    setCurrentPreviewToken(blog.previewToken || '');
    setFormData({
      title: blog.title || '',
      titleBn: blog.titleBn || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      contentBn: blog.contentBn || '',
      coverImage: blog.coverImage || '',
      images: blog.images ? [...blog.images].sort((a, b) => (a.order || 0) - (b.order || 0)) : [],
      relatedProducts: blog.relatedProducts || [],
      focusKeyword: blog.focusKeyword || '',
      isFeatured: Boolean(blog.isFeatured),
      scheduledAt: toDatetimeLocal(blog.scheduledAt),
      author: blog.author || 'Charulata Lifestyle',
      category: blog.category || 'Fashion',
      tags: blog.tags || [],
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      status: (blog.status as any) || 'published',
    });
    setTagInput('');
    setCustomImageUrl('');
    setCustomImageCaption('');
    setProductSearchTerm('');
    setActiveTab('english');
    setIsModalOpen(true);
  };

  // Copy Preview Link to Clipboard
  const handleCopyPreviewLink = () => {
    if (!formData.slug || !currentPreviewToken) {
      toast.warning('No preview token available yet.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://charulatalifestyle.com';
    const previewUrl = `${origin}/blog/preview/${formData.slug}?token=${currentPreviewToken}`;
    navigator.clipboard.writeText(previewUrl);
    toast.success('Preview link copied to clipboard!');
  };

  // Regenerate Preview Token
  const handleRegenerateToken = async () => {
    if (!editingId) return;
    try {
      const res = await regeneratePreviewToken(editingId).unwrap();
      const newToken = res?.data?.previewToken || (res?.data as any)?.blog?.previewToken;
      if (newToken) {
        setCurrentPreviewToken(newToken);
        toast.success('Preview token regenerated!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to regenerate preview token.');
    }
  };

  // Single Cover Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await uploadImage(uploadData).unwrap();
      const url = res?.data?.url || res?.url;
      if (url) {
        let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
        if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
          baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
        }
        const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
        setFormData((prev) => ({ ...prev, coverImage: fullUrl }));
        toast.success('Cover image uploaded successfully!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload cover image.');
    }
  };

  // Multiple Gallery Images Upload handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      toast.warning('A maximum of 10 gallery images is allowed per blog post.');
      return;
    }

    setIsUploadingGallery(true);
    try {
      const newImages: IBlogImage[] = [];
      let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
      if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
        baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append('image', file);
        const res = await uploadImage(uploadData).unwrap();
        const url = res?.data?.url || res?.url;
        if (url) {
          const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
          newImages.push({
            url: fullUrl,
            publicId: res?.data?.publicId || res?.publicId,
            caption: '',
            order: formData.images.length + newImages.length,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      toast.success(`${newImages.length} gallery image(s) uploaded!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload gallery images.');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Add gallery image by URL
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    if (formData.images.length >= 10) {
      toast.warning('Maximum 10 images allowed.');
      return;
    }
    const newImg: IBlogImage = {
      url: customImageUrl.trim(),
      caption: customImageCaption.trim(),
      order: formData.images.length,
    };
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImg],
    }));
    setCustomImageUrl('');
    setCustomImageCaption('');
    toast.success('Gallery image added!');
  };

  // Remove gallery image
  const handleRemoveGalleryImage = async (index: number) => {
    const targetImage = formData.images[index];
    
    if (isEditing && editingId && targetImage._id) {
      try {
        await deleteGalleryImage({
          blogId: editingId,
          imageId: targetImage._id,
        }).unwrap();
        toast.success('Gallery image deleted from server!');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to delete gallery image.');
        return;
      }
    }

    setFormData((prev) => {
      const filtered = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: filtered.map((img, idx) => ({ ...img, order: idx })),
      };
    });
  };

  // Move gallery image up/down
  const handleMoveGalleryImage = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.images.length) return;

    const updated = [...formData.images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((img, idx) => ({ ...img, order: idx }));
    setFormData((prev) => ({ ...prev, images: reordered }));

    if (isEditing && editingId && reordered.every((img) => img._id)) {
      try {
        await reorderGalleryImages({
          blogId: editingId,
          imageIds: reordered.map((img) => img._id!),
        }).unwrap();
      } catch (err) {
        // Fallback on full save
      }
    }
  };

  // Update caption
  const handleCaptionChange = (index: number, caption: string) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      updated[index] = { ...updated[index], caption };
      return { ...prev, images: updated };
    });
  };

  // Select / Add Related Product
  const handleSelectProduct = (product: any) => {
    if (formData.relatedProducts.some((p) => (typeof p === 'object' ? p._id : p) === product._id)) {
      toast.info('Product is already added.');
      return;
    }
    if (formData.relatedProducts.length >= 8) {
      toast.warning('Maximum 8 products allowed for Shop the Look.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      relatedProducts: [...prev.relatedProducts, product],
    }));
    toast.success(`"${product.title || 'Product'}" linked!`);
  };

  // Remove Related Product
  const handleRemoveProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedProducts: prev.relatedProducts.filter((p) => (typeof p === 'object' ? p._id : p) !== productId),
    }));
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Submit Blog Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Blog title (English) is required.');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Blog slug is required.');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Blog content is required.');
      return;
    }

    if (formData.status === 'scheduled') {
      if (!formData.scheduledAt) {
        toast.error('Please specify a scheduled publication date and time.');
        return;
      }
      const schedTime = new Date(formData.scheduledAt).getTime();
      if (schedTime <= Date.now()) {
        toast.error('Scheduled date and time must be in the future.');
        return;
      }
    }

    // Extract product IDs for API
    const productIds = formData.relatedProducts
      .map((p) => (typeof p === 'object' && p !== null ? p._id : p))
      .filter(Boolean);

    const payload: Partial<IBlogItem> = {
      title: formData.title,
      titleBn: formData.titleBn,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      contentBn: formData.contentBn,
      coverImage: formData.coverImage,
      images: formData.images,
      relatedProducts: productIds,
      focusKeyword: formData.focusKeyword.trim(),
      isFeatured: Boolean(formData.isFeatured),
      scheduledAt: formData.status === 'scheduled' && formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      author: formData.author,
      category: formData.category,
      tags: formData.tags,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      status: formData.status,
    };

    try {
      if (isEditing && editingId) {
        const res = await updateBlog({
          id: editingId,
          data: payload,
        }).unwrap();
        const updatedToken = res?.data?.blog?.previewToken;
        if (updatedToken) setCurrentPreviewToken(updatedToken);
        toast.success('Blog post updated successfully!');
      } else {
        const res = await createBlog(payload).unwrap();
        const createdBlog = res?.data?.blog;
        if (createdBlog?._id) {
          setEditingId(createdBlog._id);
          setIsEditing(true);
          if (createdBlog.previewToken) setCurrentPreviewToken(createdBlog.previewToken);
        }
        toast.success('Blog post created successfully!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save blog post.');
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    try {
      await deleteBlog(blogToDelete._id).unwrap();
      toast.success('Blog post deleted successfully!');
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete blog post.');
    }
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'admin', 'staff']} fallback="message">
      <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        
        {/* ─── Top Header & Actions ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <BookOpen size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-foreground">
                Blog Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Create, edit, and organize fashion stories, Shop the Look products, and multiple photo galleries for Charulata Journal.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-extrabold text-foreground shadow-2xs transition-all"
            >
              <ExternalLink size={15} />
              <span>View Public Blog</span>
            </Link>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={17} />
              <span>New Blog Post</span>
            </button>
          </div>
        </div>

        {/* ─── Stats Summary Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Articles</p>
              <p className="text-2xl font-black font-serif text-foreground mt-0.5">{totalBlogs}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Published</p>
              <p className="text-2xl font-black font-serif text-emerald-600 dark:text-emerald-400 mt-0.5">{publishedCount}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Drafts</p>
              <p className="text-2xl font-black font-serif text-amber-600 dark:text-amber-400 mt-0.5">{draftCount}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Views</p>
              <p className="text-2xl font-black font-serif text-foreground mt-0.5">{totalViews}</p>
            </div>
          </div>
        </div>

        {/* ─── Search & Filters Bar ───────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-muted/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status and Category Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Status Tabs */}
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-extrabold">
                {['all', 'published', 'draft', 'scheduled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

            </div>

          </div>
        </div>

        {/* ─── Blogs Table ────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs sm:text-sm font-bold">Loading blog posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <BookOpen size={30} />
              </div>
              <h3 className="text-lg font-bold font-serif text-foreground">No Blog Posts Found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                Start writing stories and guides to attract readers and boost SEO ranking for your brand.
              </p>
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-muted-foreground font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-5">Article</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Media & Links</th>
                    <th className="py-4 px-4">Author</th>
                    <th className="py-4 px-4">Views</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-muted/40 transition-colors group">
                      
                      {/* Thumbnail & Title */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border shadow-xs">
                            <Image
                              src={blog.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'}
                              alt={blog.title}
                              fill
                              className="object-cover"
                            />
                            {blog.isFeatured && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center space-x-0.5 shadow-md">
                                <Star size={9} fill="currentColor" />
                                <span>Featured</span>
                              </div>
                            )}
                          </div>
                          <div className="max-w-xs sm:max-w-sm">
                            <p className="font-extrabold font-serif text-foreground group-hover:text-primary transition-colors truncate">
                              {blog.title}
                            </p>
                            {blog.titleBn && (
                              <p className="text-[11px] text-muted-foreground font-sans truncate mt-0.5">
                                {blog.titleBn}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                              /{blog.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-[11px]">
                          {blog.category || 'General'}
                        </span>
                      </td>

                      {/* Media & Links count */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-[11px] font-bold text-muted-foreground">
                          <span className="inline-flex items-center space-x-1">
                            <Images size={13} className="text-primary" />
                            <span>{blog.images?.length || 0} photos</span>
                          </span>
                          <span className="inline-flex items-center space-x-1">
                            <ShoppingBag size={13} className="text-emerald-500" />
                            <span>{blog.relatedProducts?.length || 0} products</span>
                          </span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 text-muted-foreground font-medium">
                        {blog.author || 'Charulata'}
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 font-mono font-bold text-foreground">
                        <span className="inline-flex items-center space-x-1">
                          <Eye size={13} className="text-muted-foreground" />
                          <span>{blog.views || 0}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                            blog.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : blog.status === 'scheduled'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {blog.status === 'scheduled' ? 'Scheduled' : blog.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-muted-foreground text-xs whitespace-nowrap">
                        {blog.status === 'scheduled' && blog.scheduledAt ? (
                          <div>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {new Date(blog.scheduledAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <p className="text-[10px] text-muted-foreground">Scheduled Time</p>
                          </div>
                        ) : (
                          new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          
                          {/* If published, link to public blog. If draft/scheduled, link to preview */}
                          {blog.status === 'published' ? (
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                              title="View Public Article"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          ) : (
                            <Link
                              href={`/blog/preview/${blog.slug}?token=${blog.previewToken || ''}`}
                              target="_blank"
                              className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white transition-colors shadow-2xs"
                              title="Preview Draft Article"
                            >
                              <Eye size={15} />
                            </Link>
                          )}

                          <button
                            onClick={() => handleOpenEdit(blog)}
                            className="p-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary text-primary hover:text-white transition-colors shadow-2xs cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setBlogToDelete(blog);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors shadow-2xs cursor-pointer"
                            title="Delete Blog"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Create / Edit Blog Modal ────────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black font-serif text-foreground">
                      {isEditing ? 'Edit Blog Article' : 'Create New Blog Post'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Fill in the details below to publish to the public journal.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Preview Bar (Available when editing with previewToken) */}
              {isEditing && currentPreviewToken && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold">
                    <Eye size={15} />
                    <span>Private Preview Link is Active</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`/blog/preview/${formData.slug}?token=${currentPreviewToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-2xs transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>Open Preview</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyPreviewLink}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-muted text-foreground font-bold transition-colors cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRegenerateToken}
                      disabled={isRegeneratingToken}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-bold transition-colors cursor-pointer disabled:opacity-50"
                      title="Invalidate old link and create new preview token"
                    >
                      <RefreshCw size={13} className={isRegeneratingToken ? 'animate-spin' : ''} />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form Tabs */}
              <div className="flex border-b border-border bg-card px-6 pt-2 gap-2 text-xs font-extrabold overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('english')}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'english'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  English Content (Primary)
                </button>
                <button
                  onClick={() => setActiveTab('bangla')}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'bangla'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  বাংলা কন্টেন্ট (Optional)
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === 'gallery'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Images size={14} />
                  <span>Gallery ({formData.images.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('shopTheLook')}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    activeTab === 'shopTheLook'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>Shop the Look ({formData.relatedProducts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'seo'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  SEO & Meta
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* ─── TAB 1: English Content ─────────────────────────────── */}
                {activeTab === 'english' && (
                  <div className="space-y-5">
                    
                    {/* Title & Slug Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                          Article Title (English) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="e.g. Traditional Bangladeshi Fabrics and Their Heritage"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:bg-background transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                          URL Slug <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                          placeholder="traditional-bangladeshi-fabrics-and-their-heritage"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 font-mono text-xs text-foreground focus:border-primary focus:outline-none focus:bg-background transition-all"
                        />
                      </div>
                    </div>

                    {/* Category, Author & Status Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                          className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                          placeholder="Charulata Lifestyle"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                          Publish Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                          className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="published">Published (Live)</option>
                          <option value="draft">Draft (Private)</option>
                          <option value="scheduled">Scheduled (Timed Release)</option>
                        </select>
                      </div>
                    </div>

                    {/* Scheduled Datetime Picker (revealed when status === 'scheduled') */}
                    {formData.status === 'scheduled' && (
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          Scheduled Publication Date & Time <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.scheduledAt}
                          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                          className="w-full sm:w-auto h-11 px-4 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Must be a future date and time. The blog post will automatically become public once this time passes.
                        </p>
                      </div>
                    )}

                    {/* Mark as Featured Story Toggle */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-foreground">
                          <Star size={15} className={formData.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'} />
                          <span>Mark as Featured Story</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Only one blog can be featured at a time — enabling this will unfeature the current one.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formData.isFeatured ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.isFeatured ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Cover Image Upload & URL */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Main Cover Image
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {formData.coverImage && (
                          <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-border bg-muted shrink-0 shadow-xs">
                            <Image src={formData.coverImage} alt="Cover Preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                              className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}

                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formData.coverImage}
                              onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
                              placeholder="Cover Image URL or upload from device..."
                              className="flex-1 h-10 px-4 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:border-primary focus:outline-none"
                            />

                            <label className="h-10 px-4 rounded-xl bg-card border border-border hover:bg-muted text-foreground flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs">
                              {isUploadingImage ? <Loader2 className="animate-spin" size={15} /> : <Upload size={15} />}
                              <span>Upload Cover</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Recommended aspect ratio: 16:9 (1200x675px) for optimal display.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Excerpt / Summary (Short Preview)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.excerpt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="A short summary of the article displayed on card previews..."
                        className="w-full p-3 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:bg-background transition-all"
                      />
                    </div>

                    {/* Tags Input */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Tags (Keywords)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Type tag and press Enter (e.g. saree, styling, summer)..."
                          className="flex-1 h-10 px-4 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="h-10 px-4 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground cursor-pointer"
                        >
                          Add Tag
                        </button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {formData.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold"
                            >
                              <span>#{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(t)}
                                className="hover:text-rose-600 transition cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rich Text Editor for Content */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Article Content (Rich Text HTML) <span className="text-rose-500">*</span>
                      </label>
                      <div className="border border-border rounded-2xl overflow-hidden shadow-xs">
                        <RichTextEditor
                          content={formData.content}
                          onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                          placeholder="Write the full article content here. You can format headings, bold, italic, colors, links, lists, and tables..."
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* ─── TAB 2: Bangla Content ──────────────────────────────── */}
                {activeTab === 'bangla' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                      বাংলা ভার্সন যুক্ত করলে বাংলা ইউজারদের কাছে স্বয়ংক্রিয়ভাবে বাংলা টাইটেল ও কন্টেন্ট প্রদর্শিত হবে।
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        আর্টিকেল শিরোনাম (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={formData.titleBn}
                        onChange={(e) => setFormData((prev) => ({ ...prev, titleBn: e.target.value }))}
                        placeholder="যেমন: ঐতিহ্যবাহী বাংলাদেশি কাপড় এবং তাদের ঐতিহ্য"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none focus:bg-background transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        বাংলা বিস্তারিত কন্টেন্ট (Rich Text)
                      </label>
                      <div className="border border-border rounded-2xl overflow-hidden shadow-xs">
                        <RichTextEditor
                          content={formData.contentBn}
                          onChange={(html) => setFormData((prev) => ({ ...prev, contentBn: html }))}
                          placeholder="বাংলায় সম্পূর্ণ আর্টিকেল কন্টেন্ট এখানে লিখুন..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: Photo Gallery (Multiple Images) ─────────────── */}
                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Images size={22} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground">
                            Blog Photo Gallery (Up to 10 Images)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Upload high quality photos with captions to create an interactive gallery.
                          </p>
                        </div>
                      </div>

                      {/* Multi Upload Button */}
                      <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer shrink-0">
                        {isUploadingGallery ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                        <span>Upload Multiple Images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryUpload}
                          disabled={isUploadingGallery || formData.images.length >= 10}
                        />
                      </label>
                    </div>

                    {/* Direct Image URL Input */}
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        Or Add Image via Cloudinary URL
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <input
                          type="text"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          placeholder="https://res.cloudinary.com/.../image.jpg"
                          className="sm:col-span-6 h-10 px-3.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          value={customImageCaption}
                          onChange={(e) => setCustomImageCaption(e.target.value)}
                          placeholder="Caption (e.g. Loom Work in Narayanganj)"
                          className="sm:col-span-4 h-10 px-3.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="sm:col-span-2 h-10 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-extrabold border border-border transition-colors cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Gallery Images List */}
                    {formData.images.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
                        <Images size={32} className="mx-auto text-muted-foreground/60" />
                        <p className="text-xs sm:text-sm font-bold">No gallery photos added yet</p>
                        <p className="text-xs text-muted-foreground/70">
                          Click "Upload Multiple Images" above to add photos to this blog.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                          <span>Gallery Images ({formData.images.length} / 10)</span>
                          <span>Reorder & Captions</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {formData.images.map((img, idx) => (
                            <div
                              key={img._id || img.url || idx}
                              className="p-3.5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs group"
                            >
                              {/* Thumbnail & Order badge */}
                              <div className="flex items-center space-x-3 shrink-0">
                                <span className="w-6 h-6 rounded-full bg-muted font-mono font-bold text-xs flex items-center justify-center text-muted-foreground">
                                  {idx + 1}
                                </span>
                                <div className="relative h-16 w-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                                  <Image src={img.url} alt="Gallery Photo" fill className="object-cover" />
                                </div>
                              </div>

                              {/* Caption Input */}
                              <div className="flex-1 w-full space-y-1">
                                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                  Caption
                                </label>
                                <input
                                  type="text"
                                  value={img.caption || ''}
                                  onChange={(e) => handleCaptionChange(idx, e.target.value)}
                                  placeholder="Add description or credit..."
                                  className="w-full h-9 px-3 rounded-lg border border-border bg-muted/40 text-xs text-foreground focus:border-primary focus:outline-none"
                                />
                              </div>

                              {/* Reorder & Delete Buttons */}
                              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryImage(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground disabled:opacity-30 transition cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMoveGalleryImage(idx, 'down')}
                                  disabled={idx === formData.images.length - 1}
                                  className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground disabled:opacity-30 transition cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(idx)}
                                  className="p-2 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* ─── TAB 4: Shop the Look (Related Products) ─────────────── */}
                {activeTab === 'shopTheLook' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ShoppingBag size={22} />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-foreground">
                            Shop the Look — Linked Products ({formData.relatedProducts.length} / 8)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Search and select up to 8 products to showcase on this blog article page.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Search Products Input & Dropdown */}
                    <div className="space-y-3">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground">
                        Search Products to Link
                      </label>

                      <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          placeholder="Type product title to search (e.g. Saree, Panjabi, Shirt)..."
                          className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                        {productSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setProductSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Product Search Results Dropdown */}
                      {productSearchTerm.trim() && (
                        <div className="p-2 rounded-2xl border border-border bg-card shadow-lg max-h-60 overflow-y-auto divide-y divide-border/60">
                          {isSearchingProducts ? (
                            <div className="p-4 text-center text-xs font-bold text-muted-foreground flex items-center justify-center space-x-2">
                              <Loader2 className="animate-spin text-primary" size={16} />
                              <span>Searching products...</span>
                            </div>
                          ) : searchProductsList.length === 0 ? (
                            <div className="p-4 text-center text-xs font-bold text-muted-foreground">
                              No products found for "{productSearchTerm}"
                            </div>
                          ) : (
                            searchProductsList.map((product: any) => {
                              const isSelected = formData.relatedProducts.some(
                                (p) => (typeof p === 'object' ? p._id : p) === product._id
                              );
                              const thumb =
                                (Array.isArray(product.productImages) && product.productImages[0]) ||
                                product.image ||
                                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100';

                              return (
                                <div
                                  key={product._id}
                                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-muted/40 rounded-xl transition-colors"
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                      <Image src={thumb} alt={product.title} fill className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-foreground truncate">{product.title}</p>
                                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                        ৳{product.salePrice > 0 ? product.salePrice : product.price}
                                        {product.salePrice > 0 && (
                                          <span className="line-through text-[10px] ml-1.5 opacity-60">
                                            ৳{product.price}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSelectProduct(product)}
                                    disabled={isSelected || formData.relatedProducts.length >= 8}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                        : 'bg-primary hover:opacity-90 text-white shadow-2xs disabled:opacity-40'
                                    }`}
                                  >
                                    {isSelected ? 'Added ✓' : '+ Select'}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Products Chips / List */}
                    {formData.relatedProducts.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground space-y-2">
                        <ShoppingBag size={32} className="mx-auto text-muted-foreground/60" />
                        <p className="text-xs sm:text-sm font-bold">No products linked yet.</p>
                        <p className="text-xs text-muted-foreground/70">
                          Search and link up to 8 products to feature in the "Shop the Look" section of this article.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                          Linked Products ({formData.relatedProducts.length} / 8)
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {formData.relatedProducts.map((item, idx) => {
                            const prod = typeof item === 'object' ? item : { _id: item, title: 'Product', price: 0 };
                            const thumb =
                              (Array.isArray(prod.productImages) && prod.productImages[0]) ||
                              prod.image ||
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100';

                            return (
                              <div
                                key={prod._id || idx}
                                className="p-3 rounded-2xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                                    <Image src={thumb} alt={prod.title} fill className="object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{prod.title}</p>
                                    <p className="text-[11px] font-mono text-primary font-bold mt-0.5">
                                      ৳{prod.salePrice > 0 ? prod.salePrice : prod.price}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(prod._id)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Remove Product"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* ─── TAB 5: SEO & Meta ───────────────────────────────────── */}
                {activeTab === 'seo' && (
                  <div className="space-y-5">
                    
                    {/* Focus Keyword */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Focus Keyword (Highlight Pull-Quote)
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={formData.focusKeyword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, focusKeyword: e.target.value }))}
                        placeholder="e.g. Traditional Jamdani Saree"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        This keyword will be highlighted as a pull-quote on the article page.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Meta Title (Google Search Title)
                      </label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="Traditional Bangladeshi Fabrics Heritage Guide | Charulata"
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">Recommended length: 50-60 characters.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-foreground mb-1.5">
                        Meta Description (Google Snippet)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Explore the royal history of Jamdani and traditional Bangladeshi textiles..."
                        className="w-full p-3 rounded-xl border border-border bg-muted/40 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">Recommended length: 140-160 characters.</p>
                    </div>

                    {/* Google Search Preview */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                        Google Search Preview
                      </p>
                      <p className="text-xs text-emerald-600 font-mono truncate">
                        https://charulatalifestyle.com/blog/{formData.slug || 'article-slug'}
                      </p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                        {formData.metaTitle || formData.title || 'Article Title'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {formData.metaDescription || formData.excerpt || 'Article summary will appear here in Google Search results.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating || isUpdating || isUploadingGallery}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    {(isCreating || isUpdating || isUploadingGallery) && <Loader2 className="animate-spin" size={16} />}
                    <span>{isEditing ? 'Save Changes' : 'Publish Blog Post'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ─── Delete Confirmation Modal ──────────────────────────────────── */}
        {isDeleteModalOpen && blogToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-foreground">
                  Delete Blog Post?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-bold text-foreground">"{blogToDelete.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setBlogToDelete(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting && <Loader2 className="animate-spin" size={14} />}
                  <span>Delete Post</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </RoleGuard>
  );
}
