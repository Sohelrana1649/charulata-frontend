import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Shipping Address Actions
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: '/users/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['Address', 'User'],
    }),
    updateAddress: builder.mutation({
      query: ({ addressId, addressData }) => ({
        url: `/users/addresses/${addressId}`,
        method: 'PATCH',
        body: addressData,
      }),
      invalidatesTags: ['Address', 'User'],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address', 'User'],
    }),

    // Wishlist Actions
    getWishlist: builder.query({
      query: () => '/users/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url: '/users/wishlist',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url: `/users/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    // Notifications Actions
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (notifId) => ({
        url: `/notifications/${notifId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (notifId) => ({
        url: `/notifications/${notifId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Shipping Charge Calculator
    getShippingCharge: builder.query({
      query: (district) => `/delivery/charge?district=${district}`,
      providesTags: ['Delivery'],
    }),

    // Get all active districts
    getDistricts: builder.query({
      query: () => '/delivery/districts',
      providesTags: ['Delivery'],
    }),

    // Authenticated Password Change
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: '/users/change-password',
        method: 'PATCH',
        body: passwords,
      }),
    }),

    // Newsletter & Contact Actions
    subscribeNewsletter: builder.mutation({
      query: (email) => ({
        url: '/subscribers',
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Subscriber'],
    }),
    submitContactForm: builder.mutation({
      query: (contactData) => ({
        url: '/contacts',
        method: 'POST',
        body: contactData,
      }),
      invalidatesTags: ['Contact'],
    }),
    completeProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/complete-profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useGetShippingChargeQuery,
  useGetDistrictsQuery,
  useChangePasswordMutation,
  useSubscribeNewsletterMutation,
  useSubmitContactFormMutation,
  useCompleteProfileMutation,
} = userApi;
