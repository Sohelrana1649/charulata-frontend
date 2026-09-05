export interface IGuestCartItem {
  _id: string;
  product: any;
  quantity: number;
  color?: string;
  size?: string;
  selectedAttributes?: Record<string, string>;
  price: number;
}

export const getGuestCart = (): IGuestCartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('charulata_guest_cart');
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Filter out corrupted/ghost items and ensure every item has a unique _id
    let needsResave = false;
    const validItems = parsed
      .filter((item: any) => {
        if (!item || !item.product) return false;
        const p = item.product;
        const title = p.title || p.name;
        if (!title || title === 'Charulata Product' || !p.slug || p.slug === 'undefined') {
          return false;
        }
        return true;
      })
      .map((item: any, idx: number) => {
        if (!item._id) {
          item._id = `guest_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
          needsResave = true;
        }
        return item;
      });

    if (validItems.length !== parsed.length || needsResave) {
      localStorage.setItem('charulata_guest_cart', JSON.stringify(validItems));
    }
    return validItems;
  } catch (err) {
    return [];
  }
};

export const saveGuestCart = (items: IGuestCartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('charulata_guest_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('guest_cart_updated'));
  } catch (err) {
    console.error('Failed to save guest cart', err);
  }
};

export const addToGuestCart = (
  product: any, 
  quantity: number = 1, 
  color?: string, 
  size?: string, 
  selectedAttributes?: Record<string, string>,
  customPrice?: number
) => {
  const currentCart = getGuestCart();
  const productId = product._id || product.id || product;
  
  const isDiscountExpired = product?.discountEndDate && new Date() > new Date(product.discountEndDate);
  const salePrice = (!isDiscountExpired && product?.salePrice !== undefined && product?.salePrice !== null && Number(product.salePrice) > 0)
    ? Number(product.salePrice)
    : 0;
  const basePrice = customPrice !== undefined && customPrice > 0 ? customPrice : (Number(product.price) || 0);
  const unitPrice = (salePrice > 0 && salePrice < basePrice && customPrice === undefined) ? salePrice : basePrice;

  const existingIndex = currentCart.findIndex(
    item => (item.product?._id === productId || item.product === productId) &&
            item.color === color &&
            item.size === size &&
            JSON.stringify(item.selectedAttributes || {}) === JSON.stringify(selectedAttributes || {})
  );

  if (existingIndex > -1) {
    currentCart[existingIndex].quantity += quantity;
    currentCart[existingIndex].product = product;
    currentCart[existingIndex].price = unitPrice;
  } else {
    currentCart.push({
      _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product,
      quantity,
      color,
      size,
      selectedAttributes,
      price: unitPrice
    });
  }

  saveGuestCart(currentCart);
};

export const removeFromGuestCart = (itemId: string) => {
  const currentCart = getGuestCart();
  const targetId = String(itemId);
  const filtered = currentCart.filter(item => 
    String(item._id) !== targetId && 
    String(item.product?._id) !== targetId && 
    String(item.product?.id) !== targetId && 
    String(item.product) !== targetId
  );
  saveGuestCart(filtered);
};

export const updateGuestCartQuantity = (itemId: string, quantity: number) => {
  const currentCart = getGuestCart();
  const targetId = String(itemId);
  const item = currentCart.find(i => 
    String(i._id) === targetId || 
    String(i.product?._id) === targetId || 
    String(i.product?.id) === targetId || 
    String(i.product) === targetId
  );
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveGuestCart(currentCart);
  }
};

export const clearGuestCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('charulata_guest_cart');
  window.dispatchEvent(new Event('guest_cart_updated'));
};
