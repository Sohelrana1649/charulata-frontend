import { baseApi } from './baseApi';

export interface IBlogImage {
  _id?: string;
  url: string;
  publicId?: string;
  caption?: string;
  order?: number;
}

export interface IBlogItem {
  _id: string;
  title: string;
  titleBn?: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentBn?: string;
  coverImage?: string;
  images?: IBlogImage[];
  relatedProducts?: any[];
  focusKeyword?: string;
  isFeatured?: boolean;
  scheduledAt?: string;
  previewToken?: string;
  author: string;
  category?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IBlogListResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    blogs: IBlogItem[];
    pagination: IBlogPagination;
  };
}

export interface ISingleBlogResponse {
  success: boolean;
  status: string;
  message: string;
  data: {
    blog: IBlogItem;
    relatedBlogs: IBlogItem[];
  };
}

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Public Published Blogs
    getAllBlogs: builder.query<
      IBlogListResponse,
      { page?: number; limit?: number; search?: string; category?: string; tag?: string; sort?: string } | void
    >({
      query: (params) => ({
        url: '/blogs',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.blogs
          ? [
              ...result.data.blogs.map(({ _id }) => ({ type: 'Blog' as const, id: _id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),

    // 2. Get Single Blog by Slug (Public)
    getBlogBySlug: builder.query<ISingleBlogResponse, string>({
      query: (slug) => `/blogs/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),

    // 3. Get Preview of Blog by Slug & Token (Token-gated)
    getBlogPreview: builder.query<ISingleBlogResponse, { slug: string; token: string }>({
      query: ({ slug, token }) => ({
        url: `/blogs/preview/${slug}`,
        params: { token },
      }),
    }),

    // 4. Get Featured Blog (Public)
    getFeaturedBlog: builder.query<{ success: boolean; data: { blog: IBlogItem | null } }, void>({
      query: () => '/blogs/featured',
      providesTags: [{ type: 'Blog', id: 'FEATURED' }],
    }),

    // 5. Get Admin Blogs (All statuses)
    getAdminBlogs: builder.query<
      IBlogListResponse,
      { page?: number; limit?: number; search?: string; category?: string; status?: string; sort?: string } | void
    >({
      query: (params) => ({
        url: '/blogs/admin/all',
        params: params || {},
      }),
      providesTags: [{ type: 'Blog', id: 'ADMIN_LIST' }],
    }),

    // 6. Create Blog (Admin)
    createBlog: builder.mutation<{ success: boolean; data: { blog: IBlogItem } }, FormData | Partial<IBlogItem>>({
      query: (body) => ({
        url: '/blogs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'ADMIN_LIST' },
        { type: 'Blog', id: 'FEATURED' },
      ],
    }),

    // 7. Update Blog (Admin)
    updateBlog: builder.mutation<
      { success: boolean; data: { blog: IBlogItem } },
      { id: string; data: FormData | Partial<IBlogItem> }
    >({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'ADMIN_LIST' },
        { type: 'Blog', id: 'FEATURED' },
      ],
    }),

    // 8. Delete Blog (Admin)
    deleteBlog: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'ADMIN_LIST' },
        { type: 'Blog', id: 'FEATURED' },
      ],
    }),

    // 9. Delete Single Gallery Image (Admin)
    deleteBlogGalleryImage: builder.mutation<
      { success: boolean; data: { blog: IBlogItem } },
      { blogId: string; imageId: string }
    >({
      query: ({ blogId, imageId }) => ({
        url: `/blogs/${blogId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'ADMIN_LIST' },
        { type: 'Blog', id: 'FEATURED' },
      ],
    }),

    // 10. Reorder Gallery Images (Admin)
    reorderBlogGalleryImages: builder.mutation<
      { success: boolean; data: { blog: IBlogItem } },
      { blogId: string; imageIds: string[] }
    >({
      query: ({ blogId, imageIds }) => ({
        url: `/blogs/${blogId}/images/reorder`,
        method: 'PATCH',
        body: { imageIds },
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: 'Blog', id: blogId },
        { type: 'Blog', id: 'LIST' },
        { type: 'Blog', id: 'ADMIN_LIST' },
        { type: 'Blog', id: 'FEATURED' },
      ],
    }),

    // 11. Regenerate Preview Token (Admin)
    regenerateBlogPreviewToken: builder.mutation<
      { success: boolean; data: { blog: IBlogItem; previewToken: string } },
      string
    >({
      query: (id) => ({
        url: `/blogs/${id}/preview-token`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'ADMIN_LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllBlogsQuery,
  useGetBlogBySlugQuery,
  useGetBlogPreviewQuery,
  useGetFeaturedBlogQuery,
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useDeleteBlogGalleryImageMutation,
  useReorderBlogGalleryImagesMutation,
  useRegenerateBlogPreviewTokenMutation,
} = blogApi;
