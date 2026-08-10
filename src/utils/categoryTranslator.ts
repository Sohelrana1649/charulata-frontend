export const CATEGORY_TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  'saree': { bn: 'শাড়ি', en: 'Saree' },
  'sarees': { bn: 'শাড়ি সমূহ', en: 'Sarees' },
  'jamdani & silk sarees': { bn: 'জামদানি ও সিল্ক শাড়ি', en: 'Jamdani & Silk Sarees' },
  'jamdani-silk-sarees': { bn: 'জামদানি ও সিল্ক শাড়ি', en: 'Jamdani & Silk Sarees' },
  
  'panjabi': { bn: 'পাঞ্জাবী', en: 'Panjabi' },
  'panjabi & kabli': { bn: 'পাঞ্জাবী ও কাবলী', en: 'Panjabi & Kabli' },
  
  'designer kurtis': { bn: 'ডিজাইনার কুর্তি', en: 'Designer Kurtis' },
  'kurti': { bn: 'কুর্তি', en: 'Kurti' },
  'kurtis': { bn: 'কুর্তি সমূহ', en: 'Kurtis' },
  
  'jewelry': { bn: 'জুয়েলারি', en: 'Jewelry' },
  'premium jewelry': { bn: 'প্রিমিয়াম জুয়েলারি', en: 'Premium Jewelry' },
  'ornaments': { bn: 'অলংকার', en: 'Ornaments' },
  
  'beauty': { bn: 'বিউটি', en: 'Beauty' },
  'beauty & attar': { bn: 'বিউটি ও আতর', en: 'Beauty & Attar' },
  'attar': { bn: 'আতর', en: 'Attar' },
  'perfume': { bn: 'পারফিউম', en: 'Perfume' },
  
  'gadgets': { bn: 'গ্যাজেটস', en: 'Gadgets' },
  'modern gadgets': { bn: 'আধুনিক গ্যাজেটস', en: 'Modern Gadgets' },
  'electronics': { bn: 'ইলেকট্রনিক্স', en: 'Electronics' },
  
  'bag': { bn: 'ব্যাগ', en: 'Bag' },
  'bags': { bn: 'ব্যাগ সমূহ', en: 'Bags' },
  'handbag': { bn: 'হ্যান্ডব্যাগ', en: 'Handbag' },
  
  'bed': { bn: 'বেড ও বিছানা', en: 'Bed' },
  'bed sheet': { bn: 'বেড শিট', en: 'Bed Sheet' },
  'beddings': { bn: 'বেডিং সমূহ', en: 'Beddings' },
  
  'clothing': { bn: 'পোশাক', en: 'Clothing' },
  'clothes': { bn: 'পোশাক সমূহ', en: 'Clothes' },
  
  'kids': { bn: 'শিশু ও কিডস', en: 'Kids' },
  'baby': { bn: 'বেবি ও শিশু', en: 'Baby' },
  'kids fashion': { bn: 'কিডস ফ্যাশন', en: 'Kids Fashion' },
  
  'shoes': { bn: 'জুতা', en: 'Shoes' },
  'footwear': { bn: 'ফুটওয়্যার', en: 'Footwear' },
  
  't-shirt': { bn: 'টি-শার্ট', en: 'T-Shirt' },
  't-shirts': { bn: 'টি-শার্ট সমূহ', en: 'T-Shirts' },
  
  'shirt': { bn: 'শার্ট', en: 'Shirt' },
  'shirts': { bn: 'শার্ট সমূহ', en: 'Shirts' },
  
  'sunglasses': { bn: 'সানগ্লাস', en: 'Sunglasses' },
  'glasses': { bn: 'চশমা', en: 'Glasses' },
  
  'pants': { bn: 'প্যান্ট', en: 'Pants' },
  'trousers': { bn: 'ট্রাউজার', en: 'Trousers' },
  
  "men's fashion": { bn: 'পুরুষের ফ্যাশন', en: "Men's Fashion" },
  'mens fashion': { bn: 'পুরুষের ফ্যাশন', en: "Men's Fashion" },
  
  "women's fashion": { bn: 'নারীর ফ্যাশন', en: "Women's Fashion" },
  'womens fashion': { bn: 'নারীর ফ্যাশন', en: "Women's Fashion" },
  
  'home & lifestyle': { bn: 'হোম ও লাইফস্টাইল', en: 'Home & Lifestyle' },
  'home lifestyle': { bn: 'হোম ও লাইফস্টাইল', en: 'Home & Lifestyle' },
  
  'foods': { bn: 'খাবার', en: 'Foods' },
  'food': { bn: 'খাবার', en: 'Food' },

  'organic food': { bn: 'অর্গানিক ফুড', en: 'Organic Food' },
  'islamic items': { bn: 'ইসলামিক আইটেমস', en: 'Islamic Items' }
};

/**
 * Translate dynamic backend category name into current locale (Bangla or English).
 */
export function translateCategoryName(name: string, locale: string = 'bn'): string {
  if (!name) return '';
  if (locale !== 'bn') return name;

  const normalized = name.toLowerCase().trim();
  
  // 1. Direct dictionary match
  if (CATEGORY_TRANSLATIONS[normalized]) {
    return CATEGORY_TRANSLATIONS[normalized].bn;
  }

  // 2. Exact slug match
  const slugified = normalized.replace(/\s+/g, '-').replace(/&/g, 'and');
  if (CATEGORY_TRANSLATIONS[slugified]) {
    return CATEGORY_TRANSLATIONS[slugified].bn;
  }

  // 3. Substring matching for compound names
  for (const [key, value] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (normalized === key) {
      return value.bn;
    }
  }

  return name;
}
