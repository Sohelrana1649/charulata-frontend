import { baseApi } from './baseApi';

export interface ICartSnapshotItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ISaveLeadPayload {
  name?: string;
  phone: string;
  cartSnapshot?: ICartSnapshotItem[];
  cartTotal?: number;
}

export interface ILead {
  _id: string;
  name?: string;
  phone: string;
  cartSnapshot: ICartSnapshotItem[];
  cartTotal?: number;
  capturedAt: string;
  updatedAt: string;
  converted: boolean;
  convertedAt?: string;
  orderId?: {
    _id: string;
    orderId: string;
    totalAmount: number;
    deliveryStatus: string;
    createdAt: string;
    paymentMethod?: string;
  };
}

export interface IGetLeadsResponse {
  status: string;
  data: {
    leads: ILead[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: {
      totalLeads: number;
      convertedCount: number;
      unconvertedCount: number;
      conversionRate: string;
    };
  };
}

export const leadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveLead: builder.mutation<{ status: string; data: { lead: ILead } }, ISaveLeadPayload>({
      query: (leadData) => ({
        url: '/leads/save-lead',
        method: 'POST',
        body: leadData,
      }),
      invalidatesTags: ['Lead'],
    }),
    getLeads: builder.query<
      IGetLeadsResponse,
      { page?: number; limit?: number; converted?: string; search?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.converted && params.converted !== 'all') searchParams.append('converted', params.converted);
        if (params.search) searchParams.append('search', params.search);
        return `/leads?${searchParams.toString()}`;
      },
      providesTags: ['Lead'],
    }),
    deleteLead: builder.mutation<{ status: string; data: null }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lead'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSaveLeadMutation,
  useGetLeadsQuery,
  useDeleteLeadMutation,
} = leadApi;
