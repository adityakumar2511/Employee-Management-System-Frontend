/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Turbopack disable — webpack force karo
  webpack: (config) => config,

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
}

module.exports = nextConfig