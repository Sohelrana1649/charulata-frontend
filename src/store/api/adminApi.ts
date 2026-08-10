import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query({
      query: () => '/analytics/overview',
      providesTags: ['Analytics'],
    }),
    getSalesChartData: builder.query({
      query: (timeframe = '30days') => `/analytics/sales-chart?timeframe=${timeframe}`,
      providesTags: ['Analytics'],
    }),
    getCategoryDistribution: builder.query({
      query: () => '/analytics/categories',
      providesTags: ['Analytics'],
    }),
    getRecentOrders: builder.query({
      query: () => '/analytics/recent-orders',
      providesTags: ['Analytics'],
    }),
    exportAnalytics: builder.query({
      query: () => '/analytics/export',
      providesTags: ['Analytics'],
    }),
    getAdminOrders: builder.query({
      query: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
        const { status = 'All', search = '', page = 1, limit = 50 } = params || {};
        let url = `/orders?page=${page}&limit=${limit}`;
        if (status && status !== 'All') {
          url += `&status=${status}`;
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        return url;
      },
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order', 'Analytics'],
    }),
    bulkUpdateOrderStatus: builder.mutation({
      query: ({ orderIds, status, deliveryNotes }: { orderIds: string[]; status: string; deliveryNotes?: string }) => ({
        url: '/orders/bulk-status',
        method: 'PATCH',
        body: { orderIds, status, deliveryNotes },
      }),
      invalidatesTags: ['Order', 'Analytics'],
    }),

    // Coupon Actions
    getCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation({
      query: (couponData) => ({
        url: '/coupons',
        method: 'POST',
        body: couponData,
      }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, couponData }) => ({
        url: `/coupons/${id}`,
        method: 'PATCH',
        body: couponData,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),

    // Delivery Zone Actions
    getDeliveryZones: builder.query({
      query: () => '/delivery/zones',
      providesTags: ['Delivery'],
    }),
    createOrUpdateDeliveryZone: builder.mutation({
      query: (zoneData) => ({
        url: '/delivery/zones',
        method: 'POST',
        body: zoneData,
      }),
      invalidatesTags: ['Delivery'],
    }),
    deleteDeliveryZone: builder.mutation({
      query: (id) => ({
        url: `/delivery/zones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Delivery'],
    }),

    // Promotional Banner Actions
    getBanners: builder.query({
      query: () => '/banners',
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation({
      query: (bannerData) => ({
        url: '/banners',
        method: 'POST',
        body: bannerData,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation({
      query: ({ id, bannerData }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body: bannerData,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),

    // Review Actions
    getReviews: builder.query({
      query: () => '/reviews',
      providesTags: ['Review'],
    }),
    moderateReview: builder.mutation({
      query: ({ id, status }) => ({
        url: `/reviews/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Review', 'Analytics'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'Analytics'],
    }),
    bulkReviewAction: builder.mutation({
      query: ({ ids, action }) => ({
        url: '/reviews/bulk-action',
        method: 'POST',
        body: { ids, action },
      }),
      invalidatesTags: ['Review', 'Analytics'],
    }),

    // Role Actions
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Role'],
    }),
    createRole: builder.mutation({
      query: (roleData) => ({
        url: '/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ id, roleData }) => ({
        url: `/roles/${id}`,
        method: 'PATCH',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    // Notification Actions
    getNotifications: builder.query({
      query: () => '/notifications?scope=admin',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications?scope=admin',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Image Upload
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Video Upload
    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: '/upload/video',
        method: 'POST',
        body: formData,
      }),
    }),

    // Subscriber & Contact management
    getSubscribers: builder.query({
      query: () => '/subscribers',
      providesTags: ['Subscriber'],
    }),
    getContactMessages: builder.query({
      query: () => '/contacts',
      providesTags: ['Contact'],
    }),
    markContactMessageRead: builder.mutation({
      query: (id) => ({
        url: `/contacts/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Contact'],
    }),
    deleteContactMessage: builder.mutation({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
    sendPromotionalEmail: builder.mutation({
      query: (promoData) => ({
        url: '/subscribers/send-promotion',
        method: 'POST',
        body: promoData,
      }),
    }),
    getUsers: builder.query({
      query: () => '/users/admin/all',
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/admin/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOverviewStatsQuery,
  useGetSalesChartDataQuery,
  useGetCategoryDistributionQuery,
  useGetRecentOrdersQuery,
  useExportAnalyticsQuery,
  useLazyExportAnalyticsQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetDeliveryZonesQuery,
  useCreateOrUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useGetReviewsQuery,
  useModerateReviewMutation,
  useDeleteReviewMutation,
  useBulkReviewActionMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useUploadImageMutation,
  useUploadVideoMutation,
  useGetSubscribersQuery,
  useGetContactMessagesQuery,
  useMarkContactMessageReadMutation,
  useDeleteContactMessageMutation,
  useSendPromotionalEmailMutation,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useBulkUpdateOrderStatusMutation,
} = adminApi;
