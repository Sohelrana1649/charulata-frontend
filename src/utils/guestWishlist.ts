export interface IGuestWishlistItem {
  _id: string;
  title?: string;
  slug?: string;
  price?: number;
  salePrice?: number;
  image?: string;
}

/**
 * Returns string IDs of products saved in guest wishlist.
 */
export const getGuestWishlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('charulata_guest_wishlist');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed
          .map((id: any) => id?.toString())
          .filter((id: string) => Boolean(id && id !== 'undefined' && id !== 'null' && id.trim().length > 0));
      }
    }
    // Fallback from details if ids key is missing/empty
    const detailsData = localStorage.getItem('charulata_guest_wishlist_details');
    if (detailsData) {
      const parsedDetails = JSON.parse(detailsData);
      if (Array.isArray(parsedDetails)) {
        return parsedDetails
          .map((item: any) => (item?._id || item?.id)?.toString())
          .filter((id: string) => Boolean(id && id !== 'undefined' && id !== 'null' && id.trim().length > 0));
      }
    }
    return [];
  } catch (err) {
    return [];
  }
};

/**
 * Returns full item objects of guest wishlist.
 */
export const getGuestWishlistItems = (): IGuestWishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('charulata_guest_wishlist_details');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item: any) => {
          const id = (item?._id || item?.id)?.toString();
          return Boolean(id && id !== 'undefined' && id !== 'null' && id.trim().length > 0);
        });
      }
    }

    // Fallback if details are missing, but IDs exist
    const ids = getGuestWishlist();
    return ids.map((id) => ({ _id: id }));
  } catch (err) {
    return [];
  }
};

/**
 * Persists guest wishlist items and their ID list to localStorage.
 * Always keeps items as long as they have a valid ID.
 */
export const saveGuestWishlistItems = (items: IGuestWishlistItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    const validItems = (Array.isArray(items) ? items : []).filter((item: any) => {
      const id = (item?._id || item?.id)?.toString();
      return Boolean(id && id !== 'undefined' && id !== 'null' && id.trim().length > 0);
    });

    localStorage.setItem('charulata_guest_wishlist_details', JSON.stringify(validItems));
    const ids = validItems.map((i: any) => (i._id || i.id).toString());
    localStorage.setItem('charulata_guest_wishlist', JSON.stringify(ids));
    window.dispatchEvent(new Event('guest_wishlist_updated'));
  } catch (err) {
    console.error('Failed to save guest wishlist items', err);
  }
};

/**
 * Toggles a product in guest wishlist. Accepts full product object or string ID.
 * Returns true if added, false if removed.
 */
export const toggleGuestWishlist = (productOrId: any): boolean => {
  if (!productOrId) return false;

  const currentItems = getGuestWishlistItems();
  const isObj = typeof productOrId === 'object' && productOrId !== null;
  const productId = (isObj ? (productOrId._id || productOrId.id) : productOrId)?.toString();

  if (!productId || productId === 'undefined' || productId === 'null' || productId.trim().length === 0) {
    return false;
  }

  const index = currentItems.findIndex((item: any) => {
    const itemId = (item?._id || item?.id)?.toString();
    return itemId === productId;
  });

  let isAdded = false;

  if (index > -1) {
    // Already in wishlist -> remove it
    currentItems.splice(index, 1);
    isAdded = false;
  } else {
    // Not in wishlist -> add it with full product details
    const title = isObj ? (productOrId.title || productOrId.name || '') : '';
    const slug = isObj ? (productOrId.slug || productId) : productId;
    const price = isObj ? (Number(productOrId.price) || 0) : 0;
    const salePrice = isObj ? (Number(productOrId.salePrice) || 0) : 0;

    let image = '';
    if (isObj) {
      const imgSources = (Array.isArray(productOrId.productImages) ? productOrId.productImages : [])
        .concat(Array.isArray(productOrId.images) ? productOrId.images : [])
        .concat(productOrId.image ? [productOrId.image] : []);
      image = imgSources.find((src: any) => typeof src === 'string' && src.trim() !== '') || '';
    }

    currentItems.push({
      _id: productId,
      title,
      slug,
      price,
      salePrice,
      image,
    });
    isAdded = true;
  }

  saveGuestWishlistItems(currentItems);
  return isAdded;
};

/**
 * Checks whether a specific product is in the guest wishlist.
 */
export const isProductInGuestWishlist = (productId: string): boolean => {
  if (!productId) return false;
  const currentWishlist = getGuestWishlist();
  return currentWishlist.includes(productId.toString());
};

/**
 * Clears guest wishlist completely.
 */
export const clearGuestWishlist = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('charulata_guest_wishlist');
    localStorage.removeItem('charulata_guest_wishlist_details');
    window.dispatchEvent(new Event('guest_wishlist_updated'));
  } catch (err) {
    console.error('Failed to clear guest wishlist', err);
  }
};
