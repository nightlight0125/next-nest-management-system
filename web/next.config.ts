import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // disable ESLint in production build
    ignoreDuringBuilds: true,
  },
  // disable type checking
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
