/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add any image domains you need here
  },
  // Uncomment to add rewrites/redirects if needed
  // async rewrites() {
  //   return [];
  // },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable experimental features if needed
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig; 