import { baseApi } from './baseApi';

export interface ISiteSettings {
  _id?: string;
  navbarLogo: string;
  footerLogo: string;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  facebookUrl: string;
  advancePaymentAmount: number;
  requireAdvancePayment?: boolean;
  paymentPhoneNumber: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  enableBkash?: boolean;
  enableNagad?: boolean;
  enableRocket?: boolean;
  enableCOD?: boolean;
  paymentInstructions?: string;
  paymentMethodsInfo: string;
  prepaymentNoticeTitle: string;
  prepaymentRule1: string;
  prepaymentRule2: string;
  prepaymentRule3: string;
  prepaymentHelpText: string;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  freeShippingMinAmount: number;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<{ status: string; data: ISiteSettings }, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<
      { status: string; data: ISiteSettings; message: string },
      Partial<ISiteSettings>
    >({
      query: (body) => ({
        url: '/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
