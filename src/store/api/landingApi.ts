import { baseApi } from './baseApi';

export const landingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingData: builder.query({
      query: () => '/landing',
      providesTags: ['Landing'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetLandingDataQuery } = landingApi;
