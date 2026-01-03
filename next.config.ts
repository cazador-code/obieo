import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sanity Studio requires this
  transpilePackages: ['sanity'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
