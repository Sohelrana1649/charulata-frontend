import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (checkoutData) => ({
        url: '/orders/checkout',
        method: 'POST',
        body: checkoutData,
      }),
      invalidatesTags: ['Cart', 'Order', 'Analytics'],
    }),
    guestCheckout: builder.mutation({
      query: (guestCheckoutData) => ({
        url: '/orders/guest-checkout',
        method: 'POST',
        body: guestCheckoutData,
      }),
      invalidatesTags: ['Cart', 'Order', 'Analytics'],
    }),
    getOrderHistory: builder.query({
      query: () => '/orders/history',
      providesTags: ['Order'],
    }),
    trackOrder: builder.mutation({
      query: (trackingData) => ({
        url: '/orders/track',
        method: 'POST',
        body: trackingData,
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ['Order'],
    }),
    validateCoupon: builder.mutation({
      query: (couponData: { code: string; orderAmount: number }) => ({
        url: '/coupons/validate',
        method: 'POST',
        body: couponData,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useCheckoutMutation,
  useGuestCheckoutMutation,
  useGetOrderHistoryQuery,
  useTrackOrderMutation,
  useGetOrderDetailsQuery,
  useValidateCouponMutation,
} = orderApi;
