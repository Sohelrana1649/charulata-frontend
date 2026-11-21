/**
 * Shared product variant helpers.
 * Mirrors the variant logic used on the Product Details page (ProductDetailClient) so the
 * cart can show / change the same options (e.g. "Size(সাইজ)", "colour(কালার)").
 */

export interface EffectiveAttribute {
  name: string;
  options: string[];
}

/** Map | object | undefined -> plain object */
export const toPlainAttrs = (attrs: any): Record<string, string> => {
  if (!attrs) return {};
  if (attrs instanceof Map) return Object.fromEntries(attrs) as Record<string, string>;
  if (typeof attrs === 'object') return { ...attrs };
  return {};
};

const SIZE_ORDER: Record<string, number> = {
  xxs: 1, xs: 2, s: 3, m: 4, l: 5, xl: 6, xxl: 7, '2xl': 7, xxxl: 8, '3xl': 8, '4xl': 9, '5xl': 10, free: 11, 'free size': 11,
};

/** Natural sort, smallest -> largest (e.g. 50, 52, 54 / M, L, XL, XXL / 128GB, 256GB, 1TB) */
const sortAttributeOptions = (options: string[]): string[] => {
  if (!options || options.length <= 1) return options;
  const parseNum = (str: string): number => {
    const s = str.trim().toLowerCase();
    const numMatch = s.match(/([0-9.]+)/);
    if (!numMatch) return NaN;
    let num = parseFloat(numMatch[1]);
    if (s.includes('tb')) num *= 1024;
    return num;
  };
  return [...options].sort((a, b) => {
    const sizeA = SIZE_ORDER[a.trim().toLowerCase()];
    const sizeB = SIZE_ORDER[b.trim().toLowerCase()];
    if (sizeA !== undefined && sizeB !== undefined) return sizeA - sizeB;
    const numA = parseNum(a);
    const numB = parseNum(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
};

/** All selectable attributes of a product (product.attributes + variants + legacy colors/sizes). */
export const getEffectiveAttributes = (product: any): EffectiveAttribute[] => {
  if (!product || typeof product !== 'object') return [];
  const attrMap: Record<string, Set<string>> = {};

  if (Array.isArray(product.attributes)) {
    product.attributes.forEach((attr: any) => {
      if (attr?.name && Array.isArray(attr.options)) {
        if (!attrMap[attr.name]) attrMap[attr.name] = new Set();
        attr.options.forEach((opt: string) => {
          if (opt) attrMap[attr.name].add(String(opt));
        });
      }
    });
  }

  if (Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      if (v?.color) {
        if (!attrMap['Color']) attrMap['Color'] = new Set();
        attrMap['Color'].add(String(v.color));
      }
      if (v?.size) {
        if (!attrMap['Size']) attrMap['Size'] = new Set();
        attrMap['Size'].add(String(v.size));
      }
      Object.entries(toPlainAttrs(v?.attributes)).forEach(([k, val]) => {
        if (k && val) {
          if (!attrMap[k]) attrMap[k] = new Set();
          attrMap[k].add(String(val));
        }
      });
    });
  }

  if (!attrMap['Color'] && Array.isArray(product.colors) && product.colors.length > 0) {
    attrMap['Color'] = new Set(product.colors.map(String));
  }
  if (!attrMap['Size'] && Array.isArray(product.sizes) && product.sizes.length > 0) {
    attrMap['Size'] = new Set(product.sizes.map(String));
  }

  return Object.entries(attrMap).map(([name, set]) => ({
    name,
    options: sortAttributeOptions(Array.from(set)),
  }));
};

/**
 * Current selection of a cart item, keyed by the product's attribute names.
 * Values that are no longer valid options (e.g. removed by admin) are dropped,
 * so the customer is asked to choose again.
 */
export const getItemSelection = (product: any, item: any): Record<string, string> => {
  const attrs = getEffectiveAttributes(product);
  const saved = toPlainAttrs(item?.selectedAttributes);
  const color = item?.color || item?.selectedColor;
  const size = item?.size || item?.selectedSize;
  const selection: Record<string, string> = {};

  for (const attr of attrs) {
    let value: any = saved[attr.name];
    if (!value && isColorAttribute(attr.name)) value = color;
    if (!value && isSizeAttribute(attr.name)) value = size;
    if (value && attr.options.includes(String(value))) {
      selection[attr.name] = String(value);
    }
  }
  return selection;
};

/** Attribute names the customer still has to choose. */
export const getMissingAttributes = (product: any, selection: Record<string, string>): string[] =>
  getEffectiveAttributes(product)
    .filter((a) => a.options.length > 0 && !selection[a.name])
    .map((a) => a.name);

/** Best matching variant for a selection (same scoring as the details page). */
export const findMatchingVariant = (product: any, selection: Record<string, string>): any => {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) return null;

  const targetEntries = Object.entries(selection || {}).filter(([, v]) => Boolean(v));
  if (targetEntries.length === 0) return null;

  let best: any = null;
  let maxScore = -1;

  for (const v of product.variants) {
    const vAttrs = toPlainAttrs(v.attributes);
    let matchCount = 0;
    let nonColorMatchCount = 0;
    let nonColorTotal = 0;
    let hasColorMismatch = false;

    for (const [key, val] of targetEntries) {
      const kLower = key.toLowerCase();
      let matched = false;
      if (kLower === 'color') {
        const vColor = v.color || vAttrs['Color'] || vAttrs['color'];
        if (vColor === val) matched = true;
        else if (vColor) hasColorMismatch = true;
      } else if (kLower === 'size') {
        nonColorTotal++;
        const vSize = v.size || vAttrs['Size'] || vAttrs['size'];
        if (vSize === val) {
          matched = true;
          nonColorMatchCount++;
        }
      } else {
        nonColorTotal++;
        if (vAttrs[key] === val || vAttrs[kLower] === val) {
          matched = true;
          nonColorMatchCount++;
        }
      }
      if (matched) matchCount++;
    }

    if (matchCount === targetEntries.length) return v;

    let score = matchCount * 10;
    if (nonColorTotal > 0 && nonColorMatchCount === nonColorTotal) score += 50;
    if (hasColorMismatch) score -= 2;
    if (score > maxScore && score > 0) {
      maxScore = score;
      best = v;
    }
  }
  return best;
};

/** Cart payload fields for a selection (same shape the details page sends). */
export const buildVariantPayload = (selection: Record<string, string>) => {
  const findKey = (name: string) => Object.keys(selection).find((k) => k.toLowerCase() === name);
  const colorKey = findKey('color');
  const sizeKey = findKey('size');
  return {
    color: colorKey ? selection[colorKey] : undefined,
    size: sizeKey ? selection[sizeKey] : undefined,
    selectedAttributes: Object.keys(selection).length > 0 ? { ...selection } : undefined,
  };
};

export const isSameSelection = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    if ((a?.[k] || '') !== (b?.[k] || '')) return false;
  }
  return true;
};

/** True when the attribute looks like a colour picker (English or Bengali name). */
export const isColorAttribute = (name: string): boolean => {
  const l = name.toLowerCase();
  return l.includes('color') || l.includes('colour') || name.includes('কালার') || name.includes('রং') || name.includes('রঙ');
};

/** True when the attribute looks like a size picker (English or Bengali name). */
export const isSizeAttribute = (name: string): boolean => {
  const l = name.toLowerCase();
  return l.includes('size') || name.includes('সাইজ') || name.includes('মাপ');
};

const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a', white: '#ffffff', blue: '#2563eb', red: '#dc2626', green: '#16a34a',
  yellow: '#eab308', grey: '#6b7280', gray: '#6b7280', brown: '#78350f', navy: '#1e3a8a',
  pink: '#ec4899', purple: '#9333ea', orange: '#ea580c', golden: '#d97706', gold: '#d97706',
  silver: '#cbd5e1', maroon: '#800000', ash: '#9ca3af', coffee: '#451a03', cream: '#fef3c7',
  olive: '#65a30d', teal: '#0d9488', beige: '#d6c6a5', magenta: '#db2777', sky: '#38bdf8',
  'কালো': '#1a1a1a', 'সাদা': '#ffffff', 'লাল': '#dc2626', 'নীল': '#2563eb', 'সবুজ': '#16a34a',
  'গাঢ় সবুজ': '#14532d', 'গাঢ় সবুজ': '#14532d', 'হলুদ': '#eab308', 'মেরুন': '#800000',
  'গোলাপি': '#ec4899', 'বেগুনি': '#9333ea', 'কমলা': '#ea580c', 'খয়েরি': '#78350f',
  'বাদামি': '#78350f', 'বাদামী': '#78350f', 'ছাই রং': '#9ca3af', 'ছাই': '#9ca3af',
  'নেভি ব্লু': '#1e3a8a', 'নেভী': '#1e3a8a', 'জলপাই': '#65a30d', 'অফ হোয়াইট': '#f5f5f0',
  'ক্রিম': '#fef3c7', 'সোনালি': '#d97706', 'পেষ্ট': '#86efac', 'পেস্ট': '#86efac',
  'আকাশী': '#38bdf8', 'আকাশি': '#38bdf8', 'জাম': '#581c87', 'ম্যাজেন্টা': '#db2777',
  'টিল': '#0d9488', 'বেইজ': '#d6c6a5', 'ডার্ক': '#1f2937', 'হালকা ডার্ক': '#4b5563',
  'লাইট': '#e5e7eb',
};

export const getColorHex = (value: string): string | null => {
  const v = (value || '').trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  const nfc = v.normalize('NFC');
  return COLOR_HEX[nfc.toLowerCase()] || COLOR_HEX[nfc] || COLOR_HEX[v] || null;
};

