export const CATEGORY_PHRASE_MAP: Record<string, { bn: string; en: string }> = {
  // Common multi-word category phrases
  'saree': { bn: 'শাড়ি', en: 'Saree' },
  'sarees': { bn: 'শাড়ি সমূহ', en: 'Sarees' },
  'sharee': { bn: 'শাড়ি', en: 'Sharee' },
  'jamdani & silk sarees': { bn: 'জামদানি ও সিল্ক শাড়ি', en: 'Jamdani & Silk Sarees' },
  'jamdani silk sarees': { bn: 'জামদানি ও সিল্ক শাড়ি', en: 'Jamdani & Silk Sarees' },
  'jamdani-silk-sarees': { bn: 'জামদানি ও সিল্ক শাড়ি', en: 'Jamdani & Silk Sarees' },
  
  'panjabi': { bn: 'পাঞ্জাবী', en: 'Panjabi' },
  'panjabi & kabli': { bn: 'পাঞ্জাবী ও কাবলী', en: 'Panjabi & Kabli' },
  'panjabi kabli': { bn: 'পাঞ্জাবী ও কাবলী', en: 'Panjabi Kabli' },
  
  'designer kurtis': { bn: 'ডিজাইনার কুর্তি', en: 'Designer Kurtis' },
  'kurti': { bn: 'কুর্তি', en: 'Kurti' },
  'kurtis': { bn: 'কুর্তি সমূহ', en: 'Kurtis' },
  
  'salwar kameez': { bn: 'সালওয়ার কামিজ', en: 'Salwar Kameez' },
  'three piece': { bn: 'থ্রি পিস', en: 'Three Piece' },
  '3 piece': { bn: 'থ্রি পিস', en: '3 Piece' },
  'two piece': { bn: 'টু পিস', en: 'Two Piece' },
  'one piece': { bn: 'ওয়ান পিস', en: 'One Piece' },
  
  'polo shirt': { bn: 'পোলো শার্ট', en: 'Polo Shirt' },
  'casual shirt': { bn: 'ক্যাজুয়াল শার্ট', en: 'Casual Shirt' },
  'formal shirt': { bn: 'ফরমাল শার্ট', en: 'Formal Shirt' },
  'denim jeans': { bn: 'ডেনিম জিন্স', en: 'Denim Jeans' },
  
  'jewelry': { bn: 'জুয়েলারি', en: 'Jewelry' },
  'jewellery': { bn: 'জুয়েলারি', en: 'Jewellery' },
  'premium jewelry': { bn: 'প্রিমিয়াম জুয়েলারি', en: 'Premium Jewelry' },
  'ornaments': { bn: 'অলংকার', en: 'Ornaments' },
  
  'beauty': { bn: 'বিউটি', en: 'Beauty' },
  'beauty & attar': { bn: 'বিউটি ও আতর', en: 'Beauty & Attar' },
  'attar': { bn: 'আতর', en: 'Attar' },
  'perfume': { bn: 'পারফিউম', en: 'Perfume' },
  
  'gadgets': { bn: 'গ্যাজেটস', en: 'Gadgets' },
  'modern gadgets': { bn: 'আধুনিক গ্যাজেটস', en: 'Modern Gadgets' },
  'electronics': { bn: 'ইলেকট্রনিক্স', en: 'Electronics' },
  'mobile accessories': { bn: 'মোবাইল এক্সেসরিজ', en: 'Mobile Accessories' },
  
  'bag': { bn: 'ব্যাগ', en: 'Bag' },
  'bags': { bn: 'ব্যাগ সমূহ', en: 'Bags' },
  'handbag': { bn: 'হ্যান্ডব্যাগ', en: 'Handbag' },
  
  'home & lifestyle': { bn: 'হোম ও লাইফস্টাইল', en: 'Home & Lifestyle' },
  'home lifestyle': { bn: 'হোম ও লাইফস্টাইল', en: 'Home & Lifestyle' },
  'bed': { bn: 'বেড ও বিছানা', en: 'Bed' },
  'bed sheet': { bn: 'বেড শিট', en: 'Bed Sheet' },
  'bed sheets': { bn: 'বেড শিট', en: 'Bed Sheets' },
  'beddings': { bn: 'বেডিং সমূহ', en: 'Beddings' },
  
  'clothing': { bn: 'পোশাক', en: 'Clothing' },
  'clothes': { bn: 'পোশাক সমূহ', en: 'Clothes' },
  
  'kids': { bn: 'শিশু ও কিডস', en: 'Kids' },
  'baby': { bn: 'বেবি ও শিশু', en: 'Baby' },
  'kids fashion': { bn: 'কিডস ফ্যাশন', en: 'Kids Fashion' },
  
  'winter collection': { bn: 'শীতের কালেকশন', en: 'Winter Collection' },
  'summer collection': { bn: 'সামার কালেকশন', en: 'Summer Collection' },
  'eid collection': { bn: 'ঈদের কালেকশন', en: 'Eid Collection' },
  
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
  
  'foods': { bn: 'খাবার', en: 'Foods' },
  'food': { bn: 'খাবার', en: 'Food' },
  'organic food': { bn: 'অর্গানিক ফুড', en: 'Organic Food' },
  'islamic items': { bn: 'ইসলামিক আইটেমস', en: 'Islamic Items' }
};

export const WORD_TRANSLATIONS: Record<string, string> = {
  // Fashion & Clothing Keywords
  'saree': 'শাড়ি',
  'sarees': 'শাড়ি',
  'sharee': 'শাড়ি',
  'panjabi': 'পাঞ্জাবী',
  'panjabis': 'পাঞ্জাবী',
  'kabli': 'কাবলি',
  'kurti': 'কুর্তি',
  'kurtis': 'কুর্তি',
  'kamiz': 'কামিজ',
  'kameez': 'কামিজ',
  'salwar': 'সালওয়ার',
  'lehenga': 'লেহেঙ্গা',
  'gown': 'গাউন',
  'gowns': 'গাউন',
  'abaya': 'আবায়া',
  'borka': 'বোরকা',
  'hijab': 'হিজাব',
  'orona': 'ওড়না',
  'dupatta': 'ওড়না',
  'shirt': 'শার্ট',
  'shirts': 'শার্ট',
  't-shirt': 'টি-শার্ট',
  't-shirts': 'টি-শার্ট',
  'tshirt': 'টি-শার্ট',
  'polo': 'পোলো',
  'pant': 'প্যান্ট',
  'pants': 'প্যান্ট',
  'jeans': 'জিন্স',
  'denim': 'ডেনিম',
  'trouser': 'ট্রাউজার',
  'trousers': 'ট্রাউজার',
  'fotua': 'ফতুয়া',
  'pajama': 'পায়জামা',
  'lungi': 'লুঙ্গি',
  'jacket': 'জ্যাকেট',
  'jackets': 'জ্যাকেট',
  'hoodie': 'হুডি',
  'hoodies': 'হুডি',
  'sweater': 'সোয়েটার',
  'sweaters': 'সোয়েটার',
  'shawl': 'শাল',
  'clothing': 'পোশাক',
  'clothes': 'পোশাক',
  'shoe': 'জুতা',
  'shoes': 'জুতা',
  'footwear': 'ফুটওয়্যার',
  'sandal': 'স্যান্ডেল',
  'sandals': 'স্যান্ডেল',

  // Jewelry & Accessories Keywords
  'jewelry': 'জুয়েলারি',
  'jewellery': 'জুয়েলারি',
  'ornament': 'অলংকার',
  'ornaments': 'অলংকার',
  'necklace': 'নেকলেস',
  'earring': 'ইয়াররিং',
  'earrings': 'ইয়াররিং',
  'bangle': 'বালা',
  'bangles': 'চুড়ি ও বালা',
  'ring': 'আংটি',
  'rings': 'আংটি',
  'watch': 'ঘড়ি',
  'watches': 'ঘড়ি',
  'sunglass': 'সানগ্লাস',
  'sunglasses': 'সানগ্লাস',
  'bag': 'ব্যাগ',
  'bags': 'ব্যাগ',
  'handbag': 'হ্যান্ডব্যাগ',
  'wallet': 'ওয়ালেট',
  'wallets': 'ওয়ালেট',

  // Beauty & Fragrance Keywords
  'beauty': 'বিউটি',
  'cosmetics': 'কসমেটিক্স',
  'skincare': 'স্কিনকেয়ার',
  'attar': 'আতর',
  'perfume': 'পারফিউম',
  'perfumes': 'পারফিউম',
  'lotion': 'লোশন',
  'soap': 'সাবান',

  // Home & Bedding Keywords
  'home': 'হোম',
  'lifestyle': 'লাইফস্টাইল',
  'bed': 'বেড',
  'sheet': 'শিট',
  'sheets': 'শিট',
  'bedding': 'বেডিং',
  'beddings': 'বেডিং',
  'pillow': 'বালিশ',
  'curtain': 'পর্দা',
  'curtains': 'পর্দা',
  'decor': 'ডেকোর',

  // Kids & Baby Keywords
  'kid': 'কিডস',
  'kids': 'কিডস',
  'baby': 'বেবি',
  'child': 'শিশু',
  'children': 'শিশু',
  'toy': 'খেলনা',
  'toys': 'খেলনা',

  // Electronics & Gadgets Keywords
  'gadget': 'গ্যাজেট',
  'gadgets': 'গ্যাজেটস',
  'electronic': 'ইলেকট্রনিক্স',
  'electronics': 'ইলেকট্রনিক্স',
  'mobile': 'মোবাইল',
  'accessory': 'এক্সেসরিজ',
  'accessories': 'এক্সেসরিজ',
  'smart': 'স্মার্ট',

  // Modifiers & Marketing Words
  'combo': 'কম্বো',
  'combos': 'কম্বো',
  'offer': 'অফার',
  'offers': 'অফার',
  'exclusive': 'এক্সক্লুসিভ',
  'premium': 'প্রিমিয়াম',
  'trending': 'ট্রেন্ডিং',
  'new': 'নিউ',
  'arrival': 'অ্যারাইভাল',
  'arrivals': 'অ্যারাইভাল',
  'special': 'স্পেশাল',
  'discount': 'ডিসকাউন্ট',
  'winter': 'শীতের',
  'summer': 'সামার',
  'eid': 'ঈদ',
  'puja': 'পূজা',
  'wedding': 'ওয়েডিং',
  'bridal': 'ব্রাইডাল',
  'women': 'নারী',
  "women's": 'নারীর',
  'womens': 'নারীর',
  'men': 'পুরুষ',
  "men's": 'পুরুষের',
  'mens': 'পুরুষের',
  'fashion': 'ফ্যাশন',
  'collection': 'কালেকশন',
  'collections': 'কালেকশন',
  'item': 'আইটেম',
  'items': 'আইটেমস',
  'food': 'খাবার',
  'foods': 'খাবার',
  'organic': 'অর্গানিক',
  'islamic': 'ইসলামিক',
  'three': 'থ্রি',
  'piece': 'পিস',
  'pieces': 'পিস',
  'two': 'টু',
  'one': 'ওয়ান',
  'and': 'ও',
  '&': 'ও'
};

/**
 * Smart Dynamic Translator for Backend Categories.
 * Automatically translates any backend category name typed by Admin into Bangla or English.
 */
export function translateCategoryName(categoryOrName: any, locale: string = 'bn'): string {
  if (!categoryOrName) return '';

  let name = '';
  let nameBn = '';

  if (typeof categoryOrName === 'object' && categoryOrName !== null) {
    name = categoryOrName.name || categoryOrName.title || '';
    nameBn = categoryOrName.nameBn || categoryOrName.name_bn || categoryOrName.titleBn || '';
  } else {
    name = String(categoryOrName);
  }

  // If language is English
  if (locale !== 'bn') {
    return name || nameBn;
  }

  // If admin explicitly provided a custom Bangla category name from backend/admin panel
  if (nameBn && nameBn.trim()) {
    return nameBn;
  }

  if (!name || !name.trim()) return '';

  const normalized = name.toLowerCase().trim();

  // 1. Direct match in Phrase Map
  if (CATEGORY_PHRASE_MAP[normalized]) {
    return CATEGORY_PHRASE_MAP[normalized].bn;
  }

  // 2. Slugified match in Phrase Map
  const slugified = normalized.replace(/\s+/g, '-').replace(/&/g, 'and');
  if (CATEGORY_PHRASE_MAP[slugified]) {
    return CATEGORY_PHRASE_MAP[slugified].bn;
  }

  // 3. Check if input is ALREADY written in Bengali script (e.g. "শীতের পোশাক" or "শাড়ি")
  const isBanglaScript = /[\u0980-\u09FF]/.test(name);
  if (isBanglaScript) {
    return name;
  }

  // 4. Dynamic Word-by-Word Component Translation Algorithm
  const words = normalized.split(/[\s\-_]+/);
  let translatedWords: string[] = [];
  let translatedCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check 2-word sub-phrase (e.g., "winter collection")
    if (i < words.length - 1) {
      const pair = `${word} ${words[i + 1]}`;
      if (CATEGORY_PHRASE_MAP[pair]) {
        translatedWords.push(CATEGORY_PHRASE_MAP[pair].bn);
        translatedCount += 2;
        i++; // skip next word
        continue;
      }
    }

    if (WORD_TRANSLATIONS[word]) {
      translatedWords.push(WORD_TRANSLATIONS[word]);
      translatedCount++;
    } else {
      // Keep capitalized original or phonetic approximation
      translatedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }

  // If at least one keyword was translated, return joined Bengali sentence
  if (translatedCount > 0) {
    return translatedWords.join(' ');
  }

  return name;
}

// Backward compatibility export
export const CATEGORY_TRANSLATIONS = CATEGORY_PHRASE_MAP;
