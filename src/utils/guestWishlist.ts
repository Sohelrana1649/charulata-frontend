export interface IGuestWishlistItem {
  _id: string;
  title?: string;
  slug?: string;
  price?: number;
  salePrice?: number;
  image?: string;
}

export const getGuestWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('charulata_guest_wishlist');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

export const getGuestWishlistItems = (): IGuestWishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('charulata_guest_wishlist_details');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.title && item.title !== 'Charulata Product' && item.slug && item.slug !== 'undefined');
      }
    }
    
    // Fallback if only IDs exist
    const ids = getGuestWishlist();
    return ids.map(id => ({ _id: id }));
  } catch (err) {
    return [];
  }
};

export const saveGuestWishlistItems = (items: IGuestWishlistItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    const cleanItems = items.filter(item => item && item.title && item.title !== 'Charulata Product' && item.slug && item.slug !== 'undefined');
    localStorage.setItem('charulata_guest_wishlist_details', JSON.stringify(cleanItems));
    const ids = cleanItems.map(i => i._id);
    localStorage.setItem('charulata_guest_wishlist', JSON.stringify(ids));
    window.dispatchEvent(new Event('guest_wishlist_updated'));
  } catch (err) {
    console.error('Failed to save guest wishlist items', err);
  }
};

export const toggleGuestWishlist = (productOrId: any): boolean => {
  const currentItems = getGuestWishlistItems();
  const productObj = typeof productOrId === 'object' ? productOrId : { _id: productOrId };
  const productId = (productObj._id || productObj.id || productObj).toString();
  const index = currentItems.findIndex(item => item._id === productId);
  let isAdded = false;

  if (index > -1) {
    currentItems.splice(index, 1);
    isAdded = false;
  } else {
    currentItems.push({
      _id: productId,
      title: productObj.title || '',
      slug: productObj.slug || productId,
      price: Number(productObj.price) || 0,
      salePrice: Number(productObj.salePrice) || 0,
      image: productObj.productImages?.[0] || productObj.image || ''
    });
    isAdded = true;
  }

  saveGuestWishlistItems(currentItems);
  return isAdded;
};

export const isProductInGuestWishlist = (productId: string): boolean => {
  const currentWishlist = getGuestWishlist();
  return currentWishlist.includes(productId.toString());
};
