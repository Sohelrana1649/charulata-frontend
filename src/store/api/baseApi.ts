import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../authSlice';
import { getErrorMessage } from '@/utils/errorHelper';
import { toast } from 'react-toastify';

const getDynamicBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
  if (url.includes('charulata-backend.onrender.com')) {
    url = url.replace('charulata-backend.onrender.com', 'charulata-database.onrender.com');
  }
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
  
  if (result.error) {
    if (result.error.data && typeof result.error.data === 'object') {
      const cleanMessage = getErrorMessage(result.error);
      (result.error.data as any).message = cleanMessage;
    }

    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = url?.includes('/auth/login') || url?.includes('/auth/register');

    // 403 = Insufficient permissions (RBAC) — show toast, do NOT logout
    if (result.error.status === 403 && !isAuthEndpoint) {
      if (typeof window !== 'undefined') {
        const errorMsg = (result.error.data as any)?.message || 'আপনার এই অ্যাকশনের অনুমতি নেই';
        toast.error(errorMsg, { toastId: 'rbac-403' });
      }
    }

    // 401 = Expired/invalid token — auto-logout only for non-auth endpoints
    if (result.error.status === 401 && !isAuthEndpoint) {
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
  tagTypes: ['User', 'Cart', 'Order', 'Product', 'Coupon', 'Analytics', 'Address', 'Wishlist', 'Notification', 'Review', 'Banner', 'Role', 'Delivery', 'Subscriber', 'Contact', 'Landing', 'Settings', 'Campaign', 'Attribute', 'Blog'],
  endpoints: () => ({}),
});

