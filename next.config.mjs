/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  
  // Configure image domains if needed
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Add webpack configuration for handling large files
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
