import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart'],
    }),
    googleLogin: builder.mutation({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Cart'],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query<any, any>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let result = await fetchWithBQ('/auth/profile');
        if (result.error && (result.error.status === 404 || result.error.status === 'FETCH_ERROR')) {
          const fallback = await fetchWithBQ('/users/profile');
          if (!fallback.error) {
            return { data: fallback.data };
          }
        }
        if (result.error) return { error: result.error };
        return { data: result.data };
      },
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<any, any>({
      async queryFn(userData: any, _queryApi, _extraOptions, fetchWithBQ) {
        // 1. Try PATCH /users/profile
        let result = await fetchWithBQ({
          url: '/users/profile',
          method: 'PATCH',
          body: userData,
        });

        // 2. Fallback to PATCH /auth/profile if 404
        if (result.error && result.error.status === 404) {
          const authPatch = await fetchWithBQ({
            url: '/auth/profile',
            method: 'PATCH',
            body: userData,
          });
          if (!authPatch.error) return { data: authPatch.data };

          // 3. Fallback to PUT /auth/profile or PUT /users/profile
          const authPut = await fetchWithBQ({
            url: '/auth/profile',
            method: 'PUT',
            body: userData,
          });
          if (!authPut.error) return { data: authPut.data };

          const userPut = await fetchWithBQ({
            url: '/users/profile',
            method: 'PUT',
            body: userData,
          });
          if (!userPut.error) return { data: userPut.data };
        }

        if (result.error) return { error: result.error };
        return { data: result.data };
      },
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
