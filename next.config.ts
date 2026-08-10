import type { NextConfig } from "next";

const apiURL = process.env.NEXT_PUBLIC_API_URL;
const remotePatterns: any[] = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '5000',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'plus.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
  },
];

if (apiURL) {
  try {
    const url = new URL(apiURL);
    remotePatterns.push({
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      port: url.port || undefined,
    });
  } catch (e) {
    // Ignore invalid URLs
  }
}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-toastify'],
  },
};

export default nextConfig;
