import { baseApi } from './baseApi';
import { getItemSelection, isSameSelection } from '@/utils/productVariants';

export interface ChangeCartVariantArgs {
  oldItemId: string;
  product: any;
  quantity: number;
  color?: string;
  size?: string;
  selectedAttributes?: Record<string, string>;
  newSelection: Record<string, string>;
}

const extractCartItems = (resData: any): any[] | null => {
  const cart = resData?.data?.cart || resData?.cart || resData?.data || resData;
  return Array.isArray(cart?.items) ? cart.items : null;
};

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: '/cart',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartQuantity: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft: any) => {
            const cart = draft?.data?.cart || draft?.cart || draft?.data || draft;
            if (cart?.items && Array.isArray(cart.items)) {
              const targetId = String(itemId);
              const item = cart.items.find((i: any) => 
                String(i._id) === targetId || 
                String(i.product?._id) === targetId || 
                String(i.product) === targetId
              );
              if (item) {
                item.quantity = quantity;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    /**
     * Atomically swaps a cart line's variant (POST new variant -> DELETE old line) inside a
     * single queryFn so RTK Query NEVER refetches GET /cart in between (preventing duplicate cards).
     * Also updates the cached cart optimistically in place for an instant, zero-flicker UX.
     */
    changeCartItemVariant: builder.mutation<any, ChangeCartVariantArgs>({
      async queryFn(arg, _api, _extraOptions, baseQuery) {
        const { oldItemId, product, quantity, color, size, selectedAttributes, newSelection } = arg;
        const productId = product?._id || product?.id || product;
        const oldId = String(oldItemId);
        const oldQty = quantity || 1;
        const body = { product: productId, quantity: oldQty, color, size, selectedAttributes };

        const addRes = await baseQuery({ url: '/cart', method: 'POST', body });
        if (addRes.error) return { error: addRes.error };

        let freshItems = extractCartItems(addRes.data);
        if (!freshItems) {
          const getRes = await baseQuery('/cart');
          if (getRes.error) return { error: getRes.error };
          freshItems = extractCartItems(getRes.data) || [];
        }

        const sameProduct = (i: any) =>
          String(typeof i.product === 'object' ? i.product?._id : i.product) === String(productId);

        const newLine = freshItems.find(
          (i: any) =>
            String(i._id) !== oldId &&
            sameProduct(i) &&
            isSameSelection(getItemSelection(product, i), newSelection)
        );

        if (newLine) {
          const delRes = await baseQuery({ url: `/cart/${oldId}`, method: 'DELETE' });
          if (delRes.error) return { error: delRes.error };
          return { data: delRes.data };
        }

        const oldLine = freshItems.find((i: any) => String(i._id) === oldId);
        if (oldLine && isSameSelection(getItemSelection(product, oldLine), newSelection)) {
          if ((oldLine.quantity || 1) !== oldQty) {
            await baseQuery({ url: `/cart/${oldId}`, method: 'PATCH', body: { quantity: oldQty } });
          }
          return { data: addRes.data };
        }

        if (oldLine) {
          const delRes = await baseQuery({ url: `/cart/${oldId}`, method: 'DELETE' });
          if (delRes.error) return { error: delRes.error };
          const reAddRes = await baseQuery({ url: '/cart', method: 'POST', body });
          if (reAddRes.error) return { error: reAddRes.error };
          return { data: reAddRes.data };
        }

        return { data: addRes.data };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { oldItemId, product, color, size, selectedAttributes, newSelection } = arg;
        const productId = String(product?._id || product?.id || product);
        const oldId = String(oldItemId);

        const patchResult = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft: any) => {
            const cart = draft?.data?.cart || draft?.cart || draft?.data || draft;
            if (!cart?.items || !Array.isArray(cart.items)) return;

            const oldIdx = cart.items.findIndex((i: any) => String(i._id) === oldId);
            if (oldIdx === -1) return;

            const dupIdx = cart.items.findIndex(
              (other: any, idx: number) =>
                idx !== oldIdx &&
                String(typeof other.product === 'object' ? other.product?._id : other.product) === productId &&
                isSameSelection(getItemSelection(product, other), newSelection)
            );

            if (dupIdx > -1) {
              cart.items[dupIdx].quantity = (cart.items[dupIdx].quantity || 1) + (cart.items[oldIdx].quantity || 1);
              cart.items.splice(oldIdx, 1);
            } else {
              cart.items[oldIdx].color = color;
              cart.items[oldIdx].size = size;
              cart.items[oldIdx].selectedAttributes = selectedAttributes;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useChangeCartItemVariantMutation,
} = cartApi;
