import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://charulatalifestyle.com';
const cleanApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://charulata-database.onrender.com/api/v1';
  if (url.includes('charulata-backend.onrender.com')) {
    url = url.replace('charulata-backend.onrender.com', 'charulata-database.onrender.com');
  }
  return url;
};

const API_URL = cleanApiUrl();

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate hourly
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.products || json?.products || json?.data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.categories || json?.categories || json?.data || [];
  } catch {
    return [];
  }
}

async function getBlogs() {
  try {
    const res = await fetch(`${API_URL}/blogs?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.blogs || json?.blogs || json?.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs] = await Promise.all([getProducts(), getCategories(), getBlogs()]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic Product routes with image sitemap entries for Google Image Search
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product: any) => product?.slug)
    .map((product: any) => {
      const entry: any = {
        url: `${SITE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };

      // Add image entries for Google Image Search indexing
      if (product.productImages && product.productImages.length > 0) {
        entry.images = product.productImages.map((imgUrl: string) => imgUrl);
      }

      return entry;
    });

  // Dynamic Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category: any) => category?.slug)
    .map((category: any) => {
      const entry: any = {
        url: `${SITE_URL}/category/${category.slug}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      };

      // Add category banner image
      if (category.image) {
        entry.images = [category.image];
      }

      return entry;
    });

  // Dynamic Blog routes
  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((blog: any) => blog?.slug)
    .map((blog: any) => {
      const entry: any = {
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      };

      if (blog.coverImage) {
        entry.images = [blog.coverImage];
      }

      return entry;
    });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
