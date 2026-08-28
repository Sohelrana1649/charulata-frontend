'use client';

import React, { useState, useEffect } from 'react';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation
} from '@/store/api/productApi';
import { useUploadImageMutation, useUploadVideoMutation } from '@/store/api/adminApi';
import { triggerOnDemandRevalidation } from '@/utils/revalidateHelper';
import ProductDescriptionEditor from '@/components/admin/ProductDescriptionEditor';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  Filter, 
  Check, 
  Image as ImageIcon,
  Upload,
  Grid,
  List,
  Package,
  AlertTriangle,
  Sparkles,
  Zap,
  Clock,
  Hourglass,
  Calendar,
  Wrench,
  Eye,
  EyeOff,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Folder,
  Video,
  Play
} from 'lucide-react';
import { toast } from 'react-toastify';
import Image from '@/components/SafeImage';
import { useGetAttributesQuery, useGetCategoryAttributesQuery } from '@/store/api/attributeApi';

export interface ProductFormVariant {
  sku: string;
  price?: number;
  salePrice?: number;
  stockQuantity: number;
  image?: string;
  attributes: Record<string, string>;
  color?: string;
  size?: string;
}

interface ProductForm {
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number;
  stockQuantity: number;
  sku: string;
  category: string;
  productImages: string[];
  videoUrl?: string;
  colors: string[];
  sizes: string[];
  attributes: { name: string; options: string[] }[];
  variants: ProductFormVariant[];
  bestSelling: boolean;
  newArrival: boolean;
  flashSale: boolean;
  discountStartDate?: string;
  discountEndDate?: string;
  discountDurationPreset?: string;
  isActive: boolean;
}

const initialForm: ProductForm = {
  title: '',
  slug: '',
  description: '',
  price: 0,
  salePrice: 0,
  stockQuantity: 0,
  sku: '',
  category: '',
  productImages: [''],
  videoUrl: '',
  colors: [],
  sizes: [],
  attributes: [],
  variants: [],
  bestSelling: false,
  newArrival: false,
  flashSale: false,
  discountDurationPreset: '24h',
  isActive: true
};

export default function AdminProductsPage() {
  const { data: productsRes, isLoading: productsLoading, refetch } = useGetProductsQuery({ limit: 200 });
  const { data: categoriesRes } = useGetCategoriesQuery({});
  const { data: attributesRes } = useGetAttributesQuery({});
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [bulkUpdateProducts, { isLoading: isBulkUpdating }] = useBulkUpdateProductsMutation();
  const [bulkDeleteProducts, { isLoading: isBulkDeleting }] = useBulkDeleteProductsMutation();
  const [uploadImage] = useUploadImageMutation();
  const [uploadVideo, { isLoading: isUploadingVideo }] = useUploadVideoMutation();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkStockModalOpen, setBulkStockModalOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<number>(20);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Modern Delete Confirmation Modal States
  const [deleteModalProduct, setDeleteModalProduct] = useState<{ id: string; title: string; image?: string; sku?: string; price?: number; slug?: string; categorySlug?: string } | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const productsList = productsRes?.data?.products || productsRes?.data || productsRes?.products || [];
  const categoriesList = categoriesRes?.data?.categories || categoriesRes?.data || categoriesRes?.categories || [];

  // Filter products by search and category
  const filteredProducts = productsList.filter((prod: any) => {
    const matchesSearch = prod.title?.toLowerCase().includes(search.toLowerCase()) || prod.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || prod.category?._id === selectedCategory || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;

  const handleSelectAllProducts = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p: any) => p._id));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkActiveToggle = async (isActive: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      await bulkUpdateProducts({ productIds: selectedProductIds, isActive }).unwrap();
      toast.success(`${selectedProductIds.length} product(s) marked as ${isActive ? 'Published (Active)' : 'Draft (Inactive)'}!`);
      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['products', 'landing', 'categories'],
        paths: ['/', '/products', '/search']
      });
      setSelectedProductIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update selected products');
    }
  };

  const handleBulkFeaturedToggle = async (isFeatured: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      await bulkUpdateProducts({ productIds: selectedProductIds, isFeatured }).unwrap();
      toast.success(`${selectedProductIds.length} product(s) updated!`);
      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['products', 'landing'],
        paths: ['/', '/products', '/search']
      });
      setSelectedProductIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update selected products');
    }
  };

  const handleBulkStockUpdate = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      await bulkUpdateProducts({ productIds: selectedProductIds, stockQuantity: Number(bulkStockValue) }).unwrap();
      toast.success(`${selectedProductIds.length} product(s) stock set to ${bulkStockValue}!`);
      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['products'],
        paths: ['/products', '/search']
      });
      setBulkStockModalOpen(false);
      setSelectedProductIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update stock');
    }
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      await bulkDeleteProducts({ productIds: selectedProductIds }).unwrap();
      toast.success(`${selectedProductIds.length} product(s) deleted successfully!`);
      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: ['products', 'landing', 'categories'],
        paths: ['/', '/products', '/search']
      });
      setIsBulkDeleteModalOpen(false);
      setSelectedProductIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete selected products');
    }
  };

  // Auto-generate slug and clean standard parent SKU from title
  useEffect(() => {
    if (!editId && form.title) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Generate clean concise E-Commerce Parent SKU (e.g. PUNJABI-101)
      const cleanTitleWords = form.title.trim().split(/\s+/).filter(Boolean);
      let autoSku = '';
      if (cleanTitleWords.length > 0) {
        const primaryWord = cleanTitleWords[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
        const secWord = cleanTitleWords.length > 1 ? cleanTitleWords[1].toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
        const prefix = secWord ? `${primaryWord.substring(0, 4)}-${secWord.substring(0, 4)}` : primaryWord.substring(0, 8);
        const randomNum = Math.floor(100 + Math.random() * 900);
        autoSku = `${prefix}-${randomNum}`;
      }

      setForm(prev => ({
        ...prev,
        slug: generatedSlug,
        sku: !prev.sku || prev.sku === prev.slug ? autoSku : prev.sku
      }));
    }
  }, [form.title, editId]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      ...initialForm,
      category: categoriesList[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditId(prod._id);
    const parsedVariants = (prod.variants || []).map((v: any) => ({
      sku: v.sku || '',
      price: v.price !== undefined ? v.price : undefined,
      salePrice: v.salePrice !== undefined ? v.salePrice : undefined,
      stockQuantity: v.stockQuantity || 0,
      image: v.image || '',
      color: v.color || '',
      size: v.size || '',
      attributes: v.attributes ? (v.attributes instanceof Map ? Object.fromEntries(v.attributes) : v.attributes) : {}
    }));

    setForm({
      title: prod.title || '',
      slug: prod.slug || '',
      description: prod.description || '',
      price: prod.price || 0,
      salePrice: prod.salePrice || 0,
      stockQuantity: prod.stockQuantity || 0,
      sku: prod.sku || '',
      category: prod.category?._id || prod.category || '',
      productImages: prod.productImages && prod.productImages.length > 0 ? [...prod.productImages] : [''],
      videoUrl: prod.videoUrl || '',
      colors: prod.colors || [],
      sizes: prod.sizes || [],
      attributes: prod.attributes || [],
      variants: parsedVariants,
      bestSelling: !!prod.bestSelling,
      newArrival: !!prod.newArrival,
      flashSale: !!prod.flashSale,
      discountStartDate: prod.discountStartDate ? new Date(prod.discountStartDate).toISOString() : undefined,
      discountEndDate: prod.discountEndDate ? new Date(prod.discountEndDate).toISOString().substring(0, 16) : undefined,
      discountDurationPreset: prod.discountEndDate ? 'custom' : '24h',
      isActive: prod.isActive !== undefined ? !!prod.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...form.productImages];
    updated[index] = val;
    setForm(prev => ({ ...prev, productImages: updated }));
  };

  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);

  const addImageField = () => {
    setForm(prev => ({ ...prev, productImages: [...prev.productImages, ''] }));
  };

  const removeImageField = (index: number) => {
    if (form.productImages.length === 1) return;
    const updated = form.productImages.filter((_, idx) => idx !== index);
    setForm(prev => ({ ...prev, productImages: updated }));
  };

  const moveImageOrder = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= form.productImages.length) return;
    const updated = [...form.productImages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setForm(prev => ({ ...prev, productImages: updated }));
  };

  const handleProductImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
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
        const updated = [...form.productImages];
        updated[index] = fullUrl;
        setForm(prev => ({ ...prev, productImages: updated }));
        toast.success('Image uploaded!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingMultiple(true);
    try {
      let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
      if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
        baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
      }
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadImage(formData).unwrap();
        const url = res?.data?.url || res?.url;
        if (url) {
          const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
          uploadedUrls.push(fullUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => {
          const existingClean = prev.productImages.filter(img => img.trim() !== '');
          return { ...prev, productImages: [...existingClean, ...uploadedUrls] };
        });
        toast.success(`${uploadedUrls.length} angle photo(s) uploaded successfully!`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload multiple images.');
    } finally {
      setIsUploadingMultiple(false);
    }
  };

  const handleProductVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
      if (typeof window !== 'undefined' && baseApiUrl.includes('localhost')) {
        baseApiUrl = baseApiUrl.replace('localhost', window.location.hostname);
      }
      const formData = new FormData();
      formData.append('video', file);
      const res = await uploadVideo(formData).unwrap();
      const url = res?.data?.url || res?.url;
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${baseApiUrl.replace('/api/v1', '')}${url}`;
        setForm(prev => ({ ...prev, videoUrl: fullUrl }));
        toast.success('Product marketing video uploaded successfully! 🎬');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to upload video. Max 100MB video allowed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedImages = form.productImages.filter(img => img.trim() !== '');
    if (cleanedImages.length === 0) {
      toast.error('Please enter at least one product image URL.');
      return;
    }
    
    let calculatedEndDate: string | undefined = undefined;
    if (form.flashSale || (form.salePrice && form.salePrice < form.price)) {
      if (form.discountDurationPreset === '8h') {
        calculatedEndDate = new Date(Date.now() + 8 * 3600 * 1000).toISOString();
      } else if (form.discountDurationPreset === '24h') {
        calculatedEndDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      } else if (form.discountDurationPreset === '48h') {
        calculatedEndDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      } else if (form.discountDurationPreset === '7d') {
        calculatedEndDate = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
      } else if (form.discountDurationPreset === 'custom' && form.discountEndDate) {
        calculatedEndDate = new Date(form.discountEndDate).toISOString();
      }
    }

    // Clean up variants and attributes
    const attrMap: Record<string, Set<string>> = {};
    (form.attributes || []).forEach(a => {
      if (a.name && Array.isArray(a.options) && a.options.length > 0) {
        if (!attrMap[a.name]) attrMap[a.name] = new Set();
        a.options.forEach(opt => {
          if (opt) attrMap[a.name].add(String(opt));
        });
      }
    });

    const cleanedVariants = (form.variants || []).map(v => {
      const colorVal = v.attributes?.['Color'] || v.color;
      const sizeVal = v.attributes?.['Size'] || v.size;
      const vAttrs = v.attributes || {};

      if (colorVal) {
        if (!attrMap['Color']) attrMap['Color'] = new Set();
        attrMap['Color'].add(colorVal);
      }
      if (sizeVal) {
        if (!attrMap['Size']) attrMap['Size'] = new Set();
        attrMap['Size'].add(sizeVal);
      }
      Object.entries(vAttrs).forEach(([k, val]) => {
        if (k && val) {
          if (!attrMap[k]) attrMap[k] = new Set();
          attrMap[k].add(String(val));
        }
      });

      return {
        sku: v.sku || `${form.sku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        price: v.price ? Number(v.price) : undefined,
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stockQuantity: Number(v.stockQuantity || 0),
        image: v.image ? v.image.trim() : undefined,
        color: colorVal,
        size: sizeVal,
        attributes: vAttrs
      };
    });

    const cleanedAttributes = Object.entries(attrMap).map(([name, optionsSet]) => ({
      name,
      options: Array.from(optionsSet)
    }));

    // Auto calculate colors and sizes arrays from selected attributes or variants for backward compatibility
    const sizeAttr = cleanedAttributes.find(a => a.name === 'Size');
    const colorAttr = cleanedAttributes.find(a => a.name === 'Color');
    const derivedSizes = sizeAttr ? sizeAttr.options : (form.sizes || []);
    const derivedColors = colorAttr ? colorAttr.options : (form.colors || []);

    // Total stock quantity fallback to sum of variant stock if variants present
    let finalStockQuantity = Number(form.stockQuantity);
    if (cleanedVariants.length > 0) {
      const totalVariantStock = cleanedVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
      if (totalVariantStock > 0) {
        finalStockQuantity = totalVariantStock;
      }
    }

    const payload = {
      ...form,
      productImages: cleanedImages,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      stockQuantity: finalStockQuantity,
      sizes: derivedSizes,
      colors: derivedColors,
      attributes: cleanedAttributes,
      variants: cleanedVariants,
      discountStartDate: form.flashSale ? new Date().toISOString() : undefined,
      discountEndDate: calculatedEndDate
    };

    try {
      const currentSlug = payload.slug;
      const existingProd = editId ? productsList.find((p: any) => p._id === editId) : null;
      const oldSlug = existingProd?.slug;
      const categorySlug = selectedCatObj?.slug;

      if (editId) {
        await updateProduct({ id: editId, productData: payload }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created successfully!');
      }

      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: [
          'products',
          'landing',
          'categories',
          currentSlug ? `product-${currentSlug}` : '',
          oldSlug ? `product-${oldSlug}` : '',
          categorySlug ? `category-${categorySlug}` : ''
        ],
        paths: [
          '/',
          '/products',
          '/search',
          currentSlug ? `/products/${currentSlug}` : '',
          oldSlug && oldSlug !== currentSlug ? `/products/${oldSlug}` : '',
          categorySlug ? `/category/${categorySlug}` : ''
        ]
      });

      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save product details.');
    }
  };

  const handleDelete = (product: any) => {
    setDeleteModalProduct({
      id: product._id,
      title: product.title,
      image: product.productImages?.[0] || product.image,
      sku: product.sku,
      price: product.salePrice || product.price,
      slug: product.slug,
      categorySlug: product.category?.slug || (typeof product.category === 'object' ? product.category?.slug : '')
    });
  };

  const confirmSingleDelete = async () => {
    if (!deleteModalProduct) return;
    try {
      const deletedSlug = deleteModalProduct.slug;
      const deletedCatSlug = deleteModalProduct.categorySlug;
      await deleteProduct(deleteModalProduct.id).unwrap();
      toast.success('Product deleted successfully!');

      // Trigger Instant On-Demand Revalidation on Vercel
      triggerOnDemandRevalidation({
        tags: [
          'products',
          'landing',
          'categories',
          deletedSlug ? `product-${deletedSlug}` : '',
          deletedCatSlug ? `category-${deletedCatSlug}` : ''
        ],
        paths: [
          '/',
          '/products',
          '/search',
          deletedSlug ? `/products/${deletedSlug}` : '',
          deletedCatSlug ? `/category/${deletedCatSlug}` : ''
        ]
      });

      setDeleteModalProduct(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete product.');
    }
  };

  const selectedCatObj = categoriesList.find((c: any) => c._id === form.category);

  const { data: categoryAttributesRes } = useGetCategoryAttributesQuery(form.category, { skip: !form.category });
  const allMasterAttributes = attributesRes?.data?.attributes || attributesRes?.data || attributesRes?.attributes || [];
  const categoryAttrNames: string[] = categoryAttributesRes?.data?.attributes || categoryAttributesRes?.data || categoryAttributesRes?.attributes || selectedCatObj?.attributes || [];

  const categoryAttributes: { name: string; values: string[] }[] = allMasterAttributes.filter(
    (attr: any) => categoryAttrNames.includes(attr.name)
  );

  const handleToggleAttributeOption = (attrName: string, optionValue: string) => {
    setForm(prev => {
      const currentAttrs = [...(prev.attributes || [])];
      const attrIdx = currentAttrs.findIndex(a => a.name === attrName);

      if (attrIdx > -1) {
        const currentOptions = [...currentAttrs[attrIdx].options];
        const optIdx = currentOptions.indexOf(optionValue);
        if (optIdx > -1) {
          currentOptions.splice(optIdx, 1);
        } else {
          currentOptions.push(optionValue);
        }

        if (currentOptions.length === 0) {
          currentAttrs.splice(attrIdx, 1);
        } else {
          currentAttrs[attrIdx] = { ...currentAttrs[attrIdx], options: currentOptions };
        }
      } else {
        currentAttrs.push({ name: attrName, options: [optionValue] });
      }
      return { ...prev, attributes: currentAttrs };
    });
  };

  const handleGenerateVariants = () => {
    const selectedAttrs = (form.attributes || []).filter(a => a.options && a.options.length > 0);
    if (selectedAttrs.length === 0) {
      toast.error('Please select at least one attribute option first');
      return;
    }

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap(c => curr.map(n => [...c, n])),
        [[]]
      );
    };

    const attrNames = selectedAttrs.map(a => a.name);
    const attrOptions = selectedAttrs.map(a => a.options);
    const combinations = cartesian(attrOptions);

    const getShortOptionCode = (val: string): string => {
      if (!val) return '';
      const clean = val.trim();
      const lower = clean.toLowerCase();
      
      const colorMap: Record<string, string> = {
        'black': 'BLK',
        'white': 'WHT',
        'red': 'RED',
        'blue': 'BLU',
        'navy': 'NVY',
        'green': 'GRN',
        'yellow': 'YLW',
        'gold': 'GLD',
        'silver': 'SLV',
        'pink': 'PNK',
        'purple': 'PRP',
        'magenta': 'MAG',
        'orange': 'ORG',
        'brown': 'BRN',
        'grey': 'GRY',
        'gray': 'GRY',
        'maroon': 'MRN',
        'olive': 'OLV',
        'beige': 'BGE'
      };

      if (colorMap[lower]) return colorMap[lower];
      
      const alphaNum = clean.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (alphaNum.length <= 6) return alphaNum;
      return alphaNum.substring(0, 5);
    };

    const newVariants: ProductFormVariant[] = combinations.map((combo) => {
      const attrMap: Record<string, string> = {};
      const skuParts: string[] = [];

      combo.forEach((val, i) => {
        const name = attrNames[i];
        attrMap[name] = val;
        skuParts.push(getShortOptionCode(val));
      });

      const colorVal = attrMap['Color'];
      const sizeVal = attrMap['Size'];
      const baseSku = form.sku ? form.sku.trim() : 'SKU';
      const comboSku = `${baseSku}-${skuParts.join('-')}`;

      return {
        sku: comboSku,
        price: form.price || 0,
        stockQuantity: 10,
        image: '',
        color: colorVal,
        size: sizeVal,
        attributes: attrMap
      };
    });

    setForm(prev => ({ ...prev, variants: newVariants }));
    toast.success(`Generated ${newVariants.length} variant combination(s)!`);
  };

  const handleAddVariant = () => {
    setForm(prev => {
      const newVarIndex = prev.variants.length + 1;
      const initialAttrs: Record<string, string> = {};
      prev.attributes.forEach(attr => {
        if (attr.name && attr.options && attr.options.length > 0) {
          initialAttrs[attr.name] = attr.options[0];
        }
      });

      return {
        ...prev,
        variants: [
          ...prev.variants,
          {
            sku: `${prev.sku || 'SKU'}-V${newVarIndex}`,
            price: prev.price || 0,
            stockQuantity: 10,
            image: '',
            attributes: initialAttrs
          }
        ]
      };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateVariant = (index: number, key: string, value: any) => {
    setForm(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleUpdateVariantAttribute = (index: number, attrName: string, attrVal: string) => {
    setForm(prev => {
      const updated = [...prev.variants];
      const currentAttrs = { ...(updated[index].attributes || {}) };
      currentAttrs[attrName] = attrVal;
      updated[index] = { ...updated[index], attributes: currentAttrs };
      return { ...prev, variants: updated };
    });
  };

  const totalProducts = productsList.length;
  const lowStockCount = productsList.filter((p: any) => (p.stockQuantity || 0) < 5).length;
  const bestsellerCount = productsList.filter((p: any) => !!p.bestSelling).length;
  const flashSaleCount = productsList.filter((p: any) => !!p.flashSale).length;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-3 sm:space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground font-serif">Products Catalog</h1>
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalProducts} Items
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Manage inventory, pricing, discount offers, attributes, and image galleries.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Total Products</p>
            <p className="text-base sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1 font-serif">{totalProducts}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Low Stock Alerts</p>
            <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 font-serif">{lowStockCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Bestsellers</p>
            <p className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1 font-serif">{bestsellerCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[8px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider leading-tight">Flash Sale Live</p>
            <p className="text-base sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-1 font-serif">{flashSaleCount}</p>
          </div>
          <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="space-y-3 bg-card border border-border p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm min-w-0 w-full relative z-20">
        
        {/* Top Row: Search Input, Category Select Dropdown & View Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 min-w-0 w-full">
          
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 min-w-0 w-full">
            {/* Search Field */}
            <div className="relative flex-1 min-w-0 w-full">
              <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by product title, SKU, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 pl-10 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition-colors"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Custom Luxury Category Dropdown with Lucide Icons */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between space-x-2 bg-muted/60 hover:bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-foreground focus:outline-none transition cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Filter size={14} className="text-primary shrink-0" />
                  <span className="truncate">
                    {selectedCategory === 'all'
                      ? `All Categories (${categoriesList.length})`
                      : categoriesList.find((c: any) => c._id === selectedCategory)?.name || 'Category'}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isCategoryDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 origin-top-right rounded-2xl border border-border bg-card/98 backdrop-blur-xl p-1.5 shadow-2xl focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-72 overflow-y-auto no-scrollbar">
                    
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setPage(1);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between space-x-2 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-primary/10 text-primary font-black'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Filter size={14} className="text-primary shrink-0" />
                        <span>All Categories</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground font-semibold">({categoriesList.length})</span>
                    </button>

                    <div className="my-1 border-t border-border/60" />

                    {categoriesList.map((cat: any) => {
                      const isSelected = selectedCategory === cat._id;
                      return (
                        <button
                          key={cat._id}
                          onClick={() => {
                            setSelectedCategory(cat._id);
                            setPage(1);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between space-x-2 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-black'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Folder size={14} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-primary shrink-0" />}
                        </button>
                      );
                    })}

                  </div>
                </>
              )}
            </div>
          </div>

          {/* View Mode Switcher (Grid / Table) */}
          <div className="flex items-center space-x-1 bg-muted border border-border p-1 rounded-xl shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'grid' ? 'bg-card text-primary shadow-2xs font-extrabold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <Grid size={15} />
              <span className="text-[11px]">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-card text-primary shadow-2xs font-extrabold' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List size={15} />
              <span className="text-[11px]">Table</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Quick Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All Categories
          </button>

          {categoriesList.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat._id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* Floating Glassmorphic Bulk Action Bar for Products */}
      {selectedProductIds.length > 0 && (
        <div className="sticky top-20 z-40 w-full bg-card/95 dark:bg-card/90 backdrop-blur-xl border-2 border-primary/40 rounded-2xl p-3 sm:p-4 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Selection Info & Clear */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-black shadow-xs">
                <span>✓</span>
                <span>{selectedProductIds.length} {selectedProductIds.length === 1 ? 'Product' : 'Products'} Selected</span>
              </span>
              <button
                onClick={() => setSelectedProductIds([])}
                className="text-xs text-muted-foreground hover:text-foreground font-bold hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkActiveToggle(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
                title="Publish selected products"
              >
                <Eye size={14} />
                <span>Publish</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkActiveToggle(false)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
                title="Draft selected products"
              >
                <EyeOff size={14} />
                <span>Draft</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => handleBulkFeaturedToggle(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-600 hover:text-white border border-purple-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
                title="Feature selected products"
              >
                <Sparkles size={14} />
                <span>Feature</span>
              </button>

              <button
                disabled={isBulkUpdating}
                onClick={() => setBulkStockModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
                title="Update stock for selected products"
              >
                <Package size={14} />
                <span>Set Stock</span>
              </button>

              <button
                disabled={isBulkDeleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50"
                title="Delete selected products"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bulk Stock Modal */}
      {bulkStockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-foreground text-sm font-serif flex items-center gap-1.5">
                <Package size={16} className="text-primary" />
                <span>Set Bulk Stock Quantity</span>
              </h3>
              <button onClick={() => setBulkStockModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Stock Quantity for {selectedProductIds.length} Selected Product(s):
              </label>
              <input
                type="number"
                min={0}
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(Number(e.target.value))}
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkStockModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl border border-border transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkStockUpdate}
                disabled={isBulkUpdating}
                className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:opacity-90 transition shadow-xs flex items-center space-x-1.5"
              >
                {isBulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Apply Bulk Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid / Table */}
      {productsLoading ? (
        <div className="py-24 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm">
          <Loader2 className="animate-spin text-primary inline h-6 w-6 mr-2" />
          <span className="text-xs font-bold">Loading store product catalog...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground bg-card border border-border rounded-xl sm:rounded-2xl shadow-sm space-y-3">
          <p className="text-sm font-bold text-foreground">No products found</p>
          <p className="text-xs text-muted-foreground">Try searching with a different keyword or category filter.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedProducts.map((prod: any) => (
            <div 
              key={prod._id} 
              className={`group bg-card border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 relative ${selectedProductIds.includes(prod._id) ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border'}`}
            >
              {/* Product Select Checkbox */}
              <input
                type="checkbox"
                checked={selectedProductIds.includes(prod._id)}
                onChange={() => handleToggleSelectProduct(prod._id)}
                className="absolute top-3 right-3 z-30 w-4 h-4 rounded border-border accent-primary cursor-pointer shadow-xs"
              />

              {/* Product Badges */}
              {/* Product Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {prod.bestSelling && (
                  <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Bestseller
                  </span>
                )}
                {prod.flashSale && (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Flash Sale
                  </span>
                )}
                {prod.newArrival && (
                  <span className="bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                    New
                  </span>
                )}
              </div>

              {/* Product Image Header */}
              <div className="h-52 bg-muted relative overflow-hidden shrink-0 border-b border-border">
                {prod.productImages?.[0] ? (
                  <Image
                    src={prod.productImages[0]}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mb-1">
                    <span>SKU: {prod.sku || 'N/A'}</span>
                    <span className="capitalize font-sans font-semibold text-primary">{prod.category?.name || 'Category'}</span>
                  </div>
                  <h3 className="font-bold text-foreground font-serif text-sm line-clamp-2 leading-snug">{prod.title}</h3>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-baseline justify-between">
                    <div>
                      {prod.salePrice ? (
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-base font-extrabold text-foreground font-serif">৳{prod.salePrice.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through font-normal">৳{prod.price.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-foreground font-serif">৳{(prod.price || 0).toLocaleString()}</span>
                      )}
                    </div>
                    
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      prod.stockQuantity > 5 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : prod.stockQuantity > 0 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {prod.stockQuantity > 0 ? `${prod.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 bg-muted hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-border"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-xs transition cursor-pointer border border-rose-500/20"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[8px] sm:text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllProducts}
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      title={isAllSelected ? 'Deselect All' : 'Select All Products'}
                    />
                  </th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Product Details</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">SKU</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Category</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Price</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Stock</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">Status</th>
                  <th className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[11px] sm:text-xs text-foreground">
                {paginatedProducts.map((prod: any) => (
                  <tr key={prod._id} className={`hover:bg-muted/30 transition ${selectedProductIds.includes(prod._id) ? 'bg-primary/5' : ''}`}>
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(prod._id)}
                        onChange={() => handleToggleSelectProduct(prod._id)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-muted border border-border overflow-hidden relative shrink-0">
                          {prod.productImages?.[0] ? (
                            <Image src={prod.productImages[0]} alt={prod.title} fill className="object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-bold text-foreground font-serif text-sm">{prod.title}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-mono text-[11px] text-muted-foreground">
                      {prod.sku || 'N/A'}
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-semibold">
                      {prod.category?.name || 'Uncategorized'}
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 font-extrabold text-foreground">
                      {prod.salePrice ? (
                        <span>৳{prod.salePrice.toLocaleString()} <span className="text-[10px] text-muted-foreground line-through font-normal">৳{prod.price.toLocaleString()}</span></span>
                      ) : (
                        <span>৳{(prod.price || 0).toLocaleString()}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                      <span className={`font-extrabold ${prod.stockQuantity > 5 ? 'text-foreground' : 'text-rose-600 dark:text-rose-400'}`}>
                        {prod.stockQuantity}
                      </span>
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                        prod.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {prod.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-2.5 px-2.5 sm:py-3.5 sm:px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-foreground bg-muted hover:bg-primary hover:text-white rounded-lg border border-border transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-500/20 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
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
            Showing {paginatedProducts.length} of {filteredProducts.length} products · Page {page} of {totalPages}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl my-auto overflow-hidden">
            
            {/* Modal Header (Sticky) */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-6 sm:py-4 bg-card shrink-0">
              <div className="min-w-0 pr-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground font-serif truncate">
                  {editId ? 'Edit Product Details' : 'Add New Product'}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {editId ? 'Update product pricing, stock, images and category' : 'Publish a new item to catalog'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  
                  {/* Title */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter product title"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 sm:py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition min-h-[42px]"
                    />
                  </div>

                  {/* Slug */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Auto-generated from title (editable)"
                      value={form.slug}
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 sm:py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[42px]"
                    />
                  </div>

                  {/* Category Custom Brand Dropdown */}
                  <div className="col-span-1 relative">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsFormCategoryDropdownOpen(!isFormCategoryDropdownOpen)}
                        className="w-full bg-muted/60 hover:bg-muted border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground transition cursor-pointer flex items-center justify-between shadow-2xs min-h-[42px]"
                      >
                        <div className="flex items-center space-x-2 truncate min-w-0">
                          <Folder size={16} className="text-primary shrink-0" />
                          <span className={`truncate ${form.category ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                            {categoriesList.find((c: any) => c._id === form.category)?.name || 'Select a category'}
                          </span>
                        </div>
                        <ChevronDown size={16} className={`text-muted-foreground shrink-0 ml-1 transition-transform duration-200 ${isFormCategoryDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                      </button>

                      {isFormCategoryDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsFormCategoryDropdownOpen(false)} 
                          />
                          
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-border/40 animate-in fade-in slide-in-from-top-2 duration-150 p-1 space-y-0.5">
                            {categoriesList.map((cat: any) => {
                              const isSelected = form.category === cat._id;
                              return (
                                <button
                                  key={cat._id}
                                  type="button"
                                  onClick={() => {
                                    setForm(prev => ({ ...prev, category: cat._id }));
                                    setIsFormCategoryDropdownOpen(false);
                                  }}
                                  className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'bg-primary text-white shadow-xs font-extrabold'
                                      : 'text-foreground hover:bg-primary/10 hover:text-primary'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    <Folder size={14} className={isSelected ? 'text-white' : 'text-primary'} />
                                    <span>{cat.name}</span>
                                  </div>
                                  {isSelected && <Check size={14} className="text-white shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter unique SKU"
                      value={form.sku}
                      onChange={(e) => setForm(prev => ({ ...prev, sku: e.target.value }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[42px]"
                    />
                  </div>

                  {/* Regular Price */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Regular Price (গায়ের মূল দাম ৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 500"
                      value={form.price === 0 ? '' : form.price}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0) }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[42px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">পণ্যের মূল আসল গায়ের দাম (যেমন: ৳৫০০)</p>
                  </div>

                  {/* Sale Price */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Sale Price (অফার বিক্রয় মূল্য ৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 300 (খালি রাখুন ছাড় না থাকলে)"
                      value={form.salePrice === 0 ? '' : form.salePrice || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm(prev => ({ ...prev, salePrice: e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0) }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[42px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">কাস্টমার যে দামে কিনবেন (যেমন: ৳৩০০)</p>
                  </div>

                  {/* Dynamic Price Breakdown & Live Preview Card */}
                  {form.price > 0 && (
                    <div className="col-span-1 sm:col-span-2 bg-primary/5 border border-primary/20 p-3.5 sm:p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-primary">
                        <span className="flex items-center space-x-1.5">
                          <Sparkles size={15} className="text-primary shrink-0 animate-pulse" />
                          <span>কাস্টমার ওয়েবসাইটে যেভাবে দেখবে (Live Price Preview):</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">কাস্টমার চূড়ান্ত যে দাম দেবেন:</span>
                          <span className="text-lg sm:text-xl font-black text-primary font-mono">
                            ৳{(form.salePrice > 0 && form.salePrice < form.price ? form.salePrice : form.price).toLocaleString()}
                          </span>
                        </div>

                        {form.salePrice > 0 && form.salePrice < form.price && (
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">আসল গায়ের দাম (Regular):</span>
                            <span className="text-sm font-bold text-muted-foreground line-through font-mono">
                              ৳{form.price.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {form.salePrice > 0 && form.salePrice < form.price && (
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">মোট ছাড় পাবেন:</span>
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                              ৳{(form.price - form.salePrice).toLocaleString()} ছাড় ({Math.floor(((form.price - form.salePrice) / form.price) * 100)}% OFF)
                            </span>
                          </div>
                        )}

                        {form.salePrice > 0 && form.salePrice >= form.price && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 w-full mt-1">
                            ⚠️ দ্রষ্টব্য: ছাড় দিয়ে বিক্রি করতে চাইলে "Sale Price" এ গায়ের দামের চেয়ে কম মূল্য (যেমন: ৳300) লিখুন।
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Discount Duration Selector with Lucide Icons & Brand Colors */}
                  {form.salePrice > 0 && (
                    <div className="col-span-1 sm:col-span-2 space-y-2 bg-primary/5 border border-primary/20 p-3.5 rounded-2xl">
                      <label className="block text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center justify-between flex-wrap gap-1">
                        <span className="flex items-center space-x-1.5 text-primary">
                          <Clock size={15} className="text-primary shrink-0" />
                          <span>Discount Timer Duration</span>
                        </span>
                        <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          Brand Offer Duration
                        </span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                        {[
                          { value: '8h', label: '8 Hours Flash', icon: Zap },
                          { value: '24h', label: '24 Hours (1 Day)', icon: Clock },
                          { value: '48h', label: '48 Hours (2 Days)', icon: Hourglass },
                          { value: '7d', label: '7 Days (1 Week)', icon: Calendar },
                          { value: 'custom', label: 'Custom End Date', icon: Wrench },
                        ].map((preset) => {
                          const Icon = preset.icon;
                          const isSelected = (form.discountDurationPreset || '24h') === preset.value;
                          return (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, discountDurationPreset: preset.value }))}
                              className={`flex items-center space-x-1.5 sm:space-x-2 p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 text-left ${
                                isSelected
                                  ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/30'
                                  : 'bg-card hover:bg-muted text-foreground border-border hover:border-primary/40'
                              }`}
                            >
                              <Icon size={14} className={`shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`} />
                              <span className="truncate">{preset.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {form.salePrice > 0 && form.discountDurationPreset === 'custom' && (
                    <div className="col-span-1 sm:col-span-2 bg-primary/5 border border-primary/20 p-3.5 rounded-2xl space-y-1.5">
                      <label className="block text-xs font-extrabold text-primary uppercase tracking-wider flex items-center space-x-1.5">
                        <Wrench size={14} className="text-primary shrink-0" />
                        <span>Custom Discount End Date & Time *</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={form.discountEndDate || ''}
                        onChange={(e) => setForm(prev => ({ ...prev, discountEndDate: e.target.value }))}
                        className="w-full bg-card border border-primary/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none transition font-mono font-bold"
                      />
                    </div>
                  )}

                  {/* Stock Quantity */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Enter available stock"
                      value={form.stockQuantity === 0 ? '' : form.stockQuantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm(prev => ({ ...prev, stockQuantity: e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0) }))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[42px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                </div>

                {/* Description (Tiptap Rich Text Editor) */}
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <ProductDescriptionEditor
                    content={form.description}
                    onChange={(html) => setForm(prev => ({ ...prev, description: html }))}
                    placeholder="Describe the product, key features, specifications, and care instructions..."
                  />
                </div>

                {/* Dynamic Attributes & Product Variants Section */}
                {categoryAttributes.length > 0 && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-serif flex items-center space-x-1.5">
                          <Sparkles size={14} className="text-primary" />
                          <span>Category Attributes & Options ({selectedCatObj?.name || 'Selected Category'})</span>
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Select available options for this category to generate dynamic variants.
                        </p>
                      </div>
                    </div>

                    {/* Attribute Option Toggles */}
                    <div className="space-y-3 bg-muted/40 p-3 sm:p-3.5 rounded-2xl border border-border">
                      {categoryAttributes.map(attr => {
                        const selectedOptions = form.attributes.find(a => a.name === attr.name)?.options || [];
                        return (
                          <div key={attr.name} className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-foreground uppercase tracking-wider">
                              {attr.name}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {attr.values.map(val => {
                                const isChecked = selectedOptions.includes(val);
                                return (
                                  <button
                                    type="button"
                                    key={val}
                                    onClick={() => handleToggleAttributeOption(attr.name, val)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[34px] ${
                                      isChecked
                                        ? 'bg-primary text-white border-primary shadow-2xs font-extrabold'
                                        : 'bg-card text-foreground border-border hover:border-muted-foreground/40'
                                    }`}
                                  >
                                    {isChecked ? `✓ ${val}` : val}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Product Variants List */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                          Product Variants ({form.variants.length})
                        </label>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                        >
                          <Plus size={14} />
                          <span>Add Variant</span>
                        </button>
                      </div>

                      {form.variants.length > 0 ? (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                          {form.variants.map((v, vIdx) => (
                            <div key={vIdx} className="bg-card border border-border rounded-2xl p-3 sm:p-3.5 space-y-3 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                                <span className="text-xs font-bold text-primary font-mono">
                                  Variant #{vIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(vIdx)}
                                  className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Remove variant"
                                >
                                  <X size={15} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                                {/* SKU */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">SKU</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. CL-SRI-101-M"
                                    value={v.sku || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                                    className="w-full bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                                  />
                                </div>

                                {/* Old / Base Price Override */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Old Price (৳)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder={`e.g. ${form.price || 500}`}
                                    value={v.price !== undefined ? v.price : ''}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handleUpdateVariant(vIdx, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>

                                {/* Sale / Offer Price Override */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-rose-500 mb-1">Sale Price (৳)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder={`e.g. ${form.salePrice || 400}`}
                                    value={v.salePrice !== undefined ? v.salePrice : ''}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handleUpdateVariant(vIdx, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>

                                {/* Stock Quantity */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Stock</label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 50"
                                    value={v.stockQuantity === 0 ? '' : v.stockQuantity}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => handleUpdateVariant(vIdx, 'stockQuantity', e.target.value === '' ? 0 : (parseInt(e.target.value, 10) || 0))}
                                    className="w-full bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>

                                {/* Image URL */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Variant Image URL</label>
                                  <input
                                    type="url"
                                    placeholder="e.g. https://domain.com/img.jpg"
                                    value={v.image || ''}
                                    onChange={(e) => handleUpdateVariant(vIdx, 'image', e.target.value)}
                                    className="w-full bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                  />
                                </div>
                              </div>

                              {/* Attribute Choices for Variant */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                                {(form.attributes.length > 0 ? form.attributes : categoryAttributes).map((attr: any) => {
                                  const selectedOptions = (attr.options || attr.values || []) as string[];
                                  if (!selectedOptions || selectedOptions.length === 0) return null;
                                  const currentAttrVal = v.attributes?.[attr.name] || selectedOptions[0] || '';
                                  return (
                                    <div key={attr.name}>
                                      <label className="block text-[10px] font-bold text-foreground uppercase mb-0.5 truncate">{attr.name}</label>
                                      <select
                                        value={currentAttrVal}
                                        onChange={(e) => handleUpdateVariantAttribute(vIdx, attr.name, e.target.value)}
                                        className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer"
                                      >
                                        {selectedOptions.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>

                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-dashed border-border text-center">
                          No custom variants added yet. Click "+ Add Variant" above to define specific SKU, price, stock or image per attribute combination.
                        </p>
                      )}
                    </div>

                  </div>
                )}

                {/* Product Images Gallery Upload Section (Multi-Image Angles) */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-foreground uppercase tracking-wider font-serif">
                        Product Photos & Multi-Angle Gallery *
                      </label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Upload front view, back view, side angles, or fabric detail photos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0">
                        {isUploadingMultiple ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>+ Upload Files</span>
                          </>
                        )}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={isUploadingMultiple}
                          onChange={handleMultipleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={addImageField}
                        className="px-3.5 py-2 bg-muted text-foreground border border-border hover:bg-muted/80 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        + Add URL
                      </button>
                    </div>
                  </div>

                  {/* Live Thumbnail Grid Preview with Order & Cover Photo Badge */}
                  {form.productImages.some(img => img.trim() !== '') && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 bg-muted/30 p-2.5 sm:p-3 rounded-2xl border border-border">
                      {form.productImages.map((imgUrl, idx) => {
                        if (!imgUrl.trim()) return null;
                        const isCover = idx === 0;
                        return (
                          <div key={idx} className="relative group bg-card border border-border rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
                            <div className="h-24 sm:h-28 w-full bg-muted relative">
                              <Image src={imgUrl} alt={`Product Angle #${idx + 1}`} fill className="object-cover" />
                              {isCover && (
                                <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow-xs">
                                  ⭐ Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImageField(idx)}
                                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg backdrop-blur-xs transition cursor-pointer"
                                title="Delete Photo"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            <div className="p-1 sm:p-1.5 flex items-center justify-between bg-card text-[10px] border-t border-border">
                              <span className="font-bold text-muted-foreground">Angle #{idx + 1}</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveImageOrder(idx, 'left')}
                                  className="p-1 text-foreground hover:text-primary disabled:opacity-30 cursor-pointer font-bold"
                                  title="Move Left"
                                >
                                  ←
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === form.productImages.length - 1}
                                  onClick={() => moveImageOrder(idx, 'right')}
                                  className="p-1 text-foreground hover:text-primary disabled:opacity-30 cursor-pointer font-bold"
                                  title="Move Right"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Individual URL Input List */}
                  <div className="space-y-2">
                    {form.productImages.map((imgUrl, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="url"
                          placeholder={`Paste Image URL #${idx + 1} or click upload`}
                          value={imgUrl}
                          onChange={(e) => handleImageChange(idx, e.target.value)}
                          className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition min-h-[38px]"
                        />

                        <label className="p-2 bg-muted hover:bg-primary hover:text-white rounded-xl border border-border transition cursor-pointer text-muted-foreground shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center" title="Upload File">
                          {uploadingIndex === idx ? (
                            <Loader2 size={16} className="animate-spin text-primary" />
                          ) : (
                            <Upload size={16} />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>

                        {form.productImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(idx)}
                            className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-500/10 transition cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── OPTIONAL PRODUCT MARKETING VIDEO SECTION ── */}
                <div className="space-y-2.5 bg-muted/20 p-3.5 sm:p-4 rounded-2xl border border-border">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center space-x-2">
                      <Video className="text-rose-500" size={17} />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        Product Demo Video <span className="text-muted-foreground font-normal text-[10px] sm:text-xs">(Optional)</span>
                      </h3>
                    </div>
                    <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                      Video / MP4
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                    Upload an MP4/WebM file or paste a video URL to show demo video on product page.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste video URL (e.g. https://domain.com/video.mp4)"
                      value={form.videoUrl || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition font-mono min-h-[38px]"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex-1 sm:flex-initial px-3.5 py-2 bg-primary text-white hover:opacity-90 rounded-xl transition cursor-pointer font-bold text-xs flex items-center justify-center space-x-1.5 shrink-0 shadow-2xs min-h-[38px]">
                        {isUploadingVideo ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Upload Video</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          disabled={isUploadingVideo}
                          onChange={handleProductVideoUpload}
                          className="hidden"
                        />
                      </label>

                      {form.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, videoUrl: '' }))}
                          className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
                          title="Remove Video"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Video Preview Player */}
                  {form.videoUrl && (
                    <div className="mt-2 relative rounded-xl border border-border overflow-hidden bg-black/90 aspect-video max-w-sm">
                      <video
                        src={form.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-rose-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
                        🎬 Video Preview
                      </div>
                    </div>
                  )}
                </div>

                {/* Marketing Badges & Status Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-muted/30 p-3 sm:p-3.5 rounded-2xl border border-border/80">
                  <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={form.bestSelling}
                      onChange={(e) => setForm(prev => ({ ...prev, bestSelling: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground select-none">Bestseller</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={form.flashSale}
                      onChange={(e) => setForm(prev => ({ ...prev, flashSale: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground select-none">Flash Sale</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={form.newArrival}
                      onChange={(e) => setForm(prev => ({ ...prev, newArrival: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground select-none">New Arrival</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-bold text-foreground select-none">Active Item</span>
                  </label>
                </div>

              </div>

              {/* Submit Buttons (Sticky Bottom) */}
              <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-3.5 bg-card flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-extrabold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{editId ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Single Product Delete Confirmation Modal ── */}
      {deleteModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-inner">
                <Trash2 size={26} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground font-serif tracking-tight">
                  Delete Product?
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  Are you sure you want to permanently remove this product from your inventory? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Product Summary Preview Card */}
            <div className="bg-muted/50 border border-border/80 rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="w-14 h-14 rounded-xl bg-card border border-border/60 overflow-hidden relative shrink-0">
                {deleteModalProduct.image ? (
                  <Image src={deleteModalProduct.image} alt={deleteModalProduct.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-sm text-foreground truncate font-serif">{deleteModalProduct.title}</p>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-muted-foreground font-mono">
                  {deleteModalProduct.sku && <span className="bg-muted px-1.5 py-0.5 rounded border border-border">SKU: {deleteModalProduct.sku}</span>}
                  {deleteModalProduct.price ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">৳{deleteModalProduct.price.toLocaleString()}</span> : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSingleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
              >
                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirmation Modal ── */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-inner">
                <AlertTriangle size={26} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground font-serif tracking-tight">
                  Delete {selectedProductIds.length} Selected Products?
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  You are about to permanently delete <strong className="text-rose-600 font-bold">{selectedProductIds.length} products</strong> in bulk. This action is irreversible.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isBulkDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
              >
                {isBulkDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{isBulkDeleting ? 'Deleting...' : `Delete All (${selectedProductIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
