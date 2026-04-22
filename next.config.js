/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@remotion/renderer/**/*',
      'node_modules/@remotion/bundler/**/*',
      'node_modules/puppeteer/**/*',
      './public/**/*'
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['@remotion/bundler', '@remotion/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
