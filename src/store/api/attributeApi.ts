import { baseApi } from './baseApi';

export const attributeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttributes: builder.query({
      query: () => '/attributes',
      providesTags: ['Attribute'],
    }),
    createAttribute: builder.mutation({
      query: (data) => ({
        url: '/attributes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attribute'],
    }),
    updateAttribute: builder.mutation({
      query: ({ id, data }) => ({
        url: `/attributes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Attribute'],
    }),
    addAttributeValue: builder.mutation({
      query: ({ id, value }) => ({
        url: `/attributes/${id}/values`,
        method: 'POST',
        body: { value },
      }),
      invalidatesTags: ['Attribute'],
    }),
    removeAttributeValue: builder.mutation({
      query: ({ id, value }) => ({
        url: `/attributes/${id}/values`,
        method: 'DELETE',
        body: { value },
      }),
      invalidatesTags: ['Attribute'],
    }),
    deleteAttribute: builder.mutation({
      query: (id) => ({
        url: `/attributes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attribute'],
    }),
    getCategoryAttributes: builder.query({
      query: (categoryId) => `/categories/${categoryId}/attributes`,
      providesTags: ['Attribute', 'Product'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useAddAttributeValueMutation,
  useRemoveAttributeValueMutation,
  useDeleteAttributeMutation,
  useGetCategoryAttributesQuery,
} = attributeApi;
