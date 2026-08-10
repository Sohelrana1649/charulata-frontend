export interface AttributeDefinition {
  name: string;
  values: string[];
}

export const GLOBAL_ATTRIBUTES: AttributeDefinition[] = [
  {
    name: 'Size',
    values: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '32', '34', '36', '38', '40', '42', '44', '46', '48', 'Free Size', 'No Size']
  },
  {
    name: 'Color',
    values: ['Black', 'White', 'Blue', 'Green', 'Red', 'Yellow', 'Grey', 'Brown', 'Navy', 'Pink', 'Purple', 'Orange', 'Golden', 'Silver', 'Maroon']
  },
  {
    name: 'Storage',
    values: ['64GB', '128GB', '256GB', '512GB', '1TB']
  },
  {
    name: 'RAM',
    values: ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB']
  },
  {
    name: 'Volume',
    values: ['3ml', '6ml', '12ml', '25ml', '50ml', '100ml']
  },
  {
    name: 'Capacity',
    values: ['10000mAh', '20000mAh', '30000mAh']
  },
  {
    name: 'Watt',
    values: ['18W', '20W', '25W', '33W', '45W', '65W', '100W']
  },
  {
    name: 'Screen Size',
    values: ['13"', '14"', '15.6"', '24"', '27"', '32"']
  },
  {
    name: 'Material',
    values: ['Cotton', 'Silk', 'Linen', 'Leather', 'Stainless Steel', 'Gold', 'Silver']
  },
  {
    name: 'Length',
    values: ['5.5 Meter', '12 Hand', '14 Hand']
  },
  {
    name: 'Weight',
    values: ['250g', '500g', '1kg', '2kg']
  }
];

export const CATEGORY_ATTRIBUTE_MAPPING: Record<string, string[]> = {
  'T-Shirt': ['Size', 'Color'],
  'Shirt': ['Size', 'Color'],
  'Panjabi': ['Size', 'Color'],
  'Shoes': ['Size', 'Color'],
  'Jamdani & Silk Sarees': ['Color', 'Length'],
  'Modern Gadgets': ['Storage', 'RAM', 'Color', 'Capacity', 'Watt', 'Screen Size'],
  'Premium Jewelry': ['Material', 'Color'],
  'Beauty & Attar': ['Volume']
};

export function getAttributesForCategory(categoryNameOrSlug?: string): AttributeDefinition[] {
  if (!categoryNameOrSlug) return [];
  const normalized = categoryNameOrSlug.trim().toLowerCase();
  
  const matchedCategoryKey = Object.keys(CATEGORY_ATTRIBUTE_MAPPING).find(key => {
    const keyLower = key.toLowerCase();
    const slugKey = keyLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return keyLower === normalized || slugKey === normalized;
  });

  if (!matchedCategoryKey) return [];

  const allowedAttrNames = CATEGORY_ATTRIBUTE_MAPPING[matchedCategoryKey];
  return GLOBAL_ATTRIBUTES.filter(attr => allowedAttrNames.includes(attr.name));
}
