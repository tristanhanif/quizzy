/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Abaikan error tipe TypeScript saat build di Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;