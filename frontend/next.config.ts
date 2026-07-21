import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Abaikan error ESLint saat proses build di Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Abaikan error TypeScript saat proses build di Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;