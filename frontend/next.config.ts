/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Abaikan error tipe TypeScript saat build di Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Abaikan warning/error ESLint saat build di Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;