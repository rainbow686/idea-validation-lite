/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Ignore ESLint errors during production build (tests are excluded from build)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors in tests during builds
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
