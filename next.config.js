/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Enable Cloudflare-specific features
  // Ensure CF context is available
  env: {
    CLOUDFLARE_CONTEXT: 'true',
  },
}

module.exports = nextConfig
