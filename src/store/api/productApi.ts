import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 300, // Cache product lists for 5 mins
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
      keepUnusedDataFor: 300, // Cache product details for 5 mins
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Product'],
      keepUnusedDataFor: 600, // Cache categories for 10 mins
    }),
    getActiveBanners: builder.query({
      query: () => '/banners/active',
      providesTags: ['Banner'],
      keepUnusedDataFor: 600, // Cache banners for 10 mins
    }),

    // Admin CRUD Actions for Products
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, productData }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: productData,
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    bulkUpdateProducts: builder.mutation({
      query: (body: { productIds: string[]; [key: string]: any }) => ({
        url: '/products/bulk-update',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),
    bulkDeleteProducts: builder.mutation({
      query: (body: { productIds: string[] }) => ({
        url: '/products/bulk-delete',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Product', 'Analytics'],
    }),

    // Admin CRUD Actions for Categories
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, categoryData }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: categoryData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Review Actions for Customers
    getProductReviews: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: ['Review'],
    }),
    getApprovedReviews: builder.query({
      query: (limit = 3) => `/reviews/approved?limit=${limit}`,
      providesTags: ['Review'],
    }),
    submitReview: builder.mutation({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoriesQuery,
  useGetActiveBannersQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductReviewsQuery,
  useGetApprovedReviewsQuery,
  useSubmitReviewMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
} = productApi;
