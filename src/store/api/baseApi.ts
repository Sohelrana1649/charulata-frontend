import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../authSlice';

const getDynamicBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-backend.onrender.com/api/v1';
  if (typeof window !== 'undefined' && url.includes('localhost')) {
    url = url.replace('localhost', window.location.hostname);
  }
  return url;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const dynamicBaseQuery = fetchBaseQuery({
    baseUrl: getDynamicBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth?: { token?: string } }).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await dynamicBaseQuery(args, api, extraOptions);
  
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    // Don't auto-logout on auth endpoints (login/register) — 401 there means bad credentials, not expired session
    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = url?.includes('/auth/login') || url?.includes('/auth/register');
    
    if (!isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('charulata_token');
        // Only trigger session expiration redirect if the user WAS logged in with a stored token!
        if (storedToken) {
          api.dispatch(logout());
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&expired=true`;
          }
        }
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Cart', 'Order', 'Product', 'Coupon', 'Analytics', 'Address', 'Wishlist', 'Notification', 'Review', 'Banner', 'Role', 'Delivery', 'Subscriber', 'Contact', 'Landing', 'Settings', 'Campaign'],
  endpoints: () => ({}),
});
