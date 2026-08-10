import { baseApi } from './baseApi';

export interface ICampaignItem {
  _id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  description?: string;
  discountPercent?: number;
  startDate?: string;
  endDate?: string;
  ctaText?: string;
  ctaLink?: string;
  bannerImage1?: string;
  bannerImage2?: string;
  images?: string[];
  isActive: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const campaignApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveCampaign: builder.query<{ status: string; data: { campaign: ICampaignItem | null } }, void>({
      query: () => '/campaigns/active',
      providesTags: ['Campaign', 'Landing']
    }),
    getAllCampaigns: builder.query<{ status: string; results: number; data: { campaigns: ICampaignItem[] } }, void>({
      query: () => '/campaigns',
      providesTags: ['Campaign']
    }),
    getCampaignById: builder.query<{ status: string; data: { campaign: ICampaignItem } }, string>({
      query: (id) => `/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }]
    }),
    createCampaign: builder.mutation<{ status: string; data: { campaign: ICampaignItem } }, Partial<ICampaignItem>>({
      query: (body) => ({
        url: '/campaigns',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Campaign', 'Landing']
    }),
    updateCampaign: builder.mutation<{ status: string; data: { campaign: ICampaignItem } }, { id: string; data: Partial<ICampaignItem> }>({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Campaign', 'Landing']
    }),
    deleteCampaign: builder.mutation<{ status: string }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Campaign', 'Landing']
    })
  })
});

export const {
  useGetActiveCampaignQuery,
  useGetAllCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation
} = campaignApi;
