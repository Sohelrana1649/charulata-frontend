import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
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
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 95],
    minimumCacheTTL: 86400,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-toastify'],
  },
};

export default nextConfig;
